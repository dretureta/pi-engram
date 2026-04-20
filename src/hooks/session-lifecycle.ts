import type { ExtensionAPI } from "@mariozechner/pi-coding-agent"

import type { PiEngramConfig } from "../config"
import { detectProjectName } from "../engram/project"
import { deriveEngramSessionId } from "../engram/session-id"
import { buildStatusSnapshot, formatStatusSnapshot } from "../engram/status"
import { persistRuntimeState, restoreRuntimeState, type PiEngramRuntimeState } from "../engram/state"
import type { EngramHttpDaemon } from "../engram/http-daemon"
import type { EngramMcpBridge } from "../engram/mcp-bridge"
import { buildSessionSummary } from "../summary/session-summary"

export interface PiEngramLifecycleDeps {
  config: PiEngramConfig
  runtime: PiEngramRuntimeState
  http: EngramHttpDaemon
  bridge: EngramMcpBridge
}

async function persistState(pi: ExtensionAPI, runtime: PiEngramRuntimeState): Promise<void> {
  persistRuntimeState(pi, runtime)
}

export function registerSessionLifecycle(pi: ExtensionAPI, deps: PiEngramLifecycleDeps) {
  pi.on("session_start", async (_event, ctx) => {
    const restored = restoreRuntimeState(ctx.sessionManager.getEntries() as Array<{ type?: string; customType?: string; data?: unknown }>)
    Object.assign(deps.runtime, restored)

    deps.runtime.project = detectProjectName(ctx.cwd)
    deps.runtime.sessionId = ctx.sessionManager.getSessionFile?.() ?? ctx.cwd
    deps.runtime.engramSessionId = deriveEngramSessionId({
      cwd: ctx.cwd,
      project: deps.runtime.project,
      sessionFile: deps.runtime.sessionId,
      leafId: ctx.sessionManager.getLeafId?.() ?? null,
      branchId: ctx.sessionManager.getBranch?.()?.at?.(-1)?.id ?? null,
    })

    await deps.http.ensureRunning()
    if (!deps.runtime.daemonStartedByExtension && deps.http.wasStartedByExtension) {
      deps.runtime.daemonStartedByExtension = true
    }

    if (deps.runtime.project) {
      const legacyProject = ctx.cwd.split("/").pop() ?? deps.runtime.project
      if (legacyProject && legacyProject !== deps.runtime.project) {
        await deps.http.migrateProject(legacyProject, deps.runtime.project)
      }
    }

    if (deps.runtime.project && deps.runtime.engramSessionId) {
      await deps.bridge.ensureReady().catch(() => undefined)
      await deps.http.createSession({
        id: deps.runtime.engramSessionId,
        project: deps.runtime.project,
        directory: ctx.cwd,
      })
      const context = await deps.http.getContext(deps.runtime.project)
      deps.runtime.cachedContext = context
    }

    await persistState(pi, deps.runtime)
    ctx.ui.notify(
      formatStatusSnapshot(
        buildStatusSnapshot(deps.runtime, deps.config, {
          http: await deps.http.isHealthy(),
          mcp: deps.bridge.healthy,
        }),
      ).join("\n"),
      "info",
    )
  })

  pi.on("session_shutdown", async (_event, ctx) => {
    if (deps.runtime.project && deps.runtime.engramSessionId) {
      const summary = buildSessionSummary(ctx.sessionManager.getBranch() as unknown[], deps.runtime.project)
      if (summary.trim()) {
        await deps.bridge.ensureReady().catch(() => undefined)
        await deps.bridge.callTool("mem_session_summary", {
          session_id: deps.runtime.engramSessionId,
          project: deps.runtime.project,
          summary,
        }).catch(() => undefined)
      }
      await deps.bridge.callTool("mem_session_end", {
        session_id: deps.runtime.engramSessionId,
      }).catch(() => undefined)
      await deps.http.endSession(deps.runtime.engramSessionId)
    }

    await persistState(pi, deps.runtime)
    await deps.bridge.close().catch(() => undefined)
    await deps.http.shutdown().catch(() => undefined)
  })
}
