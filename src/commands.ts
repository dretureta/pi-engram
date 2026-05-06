import type { ExtensionAPI } from "@mariozechner/pi-coding-agent"

import type { PiEngramConfig } from "./config"
import { buildSessionSummary } from "./summary/session-summary"
import type { EngramHttpDaemon } from "./engram/http-daemon"
import type { EngramMcpBridge } from "./engram/mcp-bridge"
import { buildStatusSnapshot, formatStatusSnapshot } from "./engram/status"
import type { PiEngramRuntimeState } from "./engram/state"

export interface PiEngramCommandDeps {
  config: PiEngramConfig
  runtime: PiEngramRuntimeState
  http: EngramHttpDaemon
  bridge: EngramMcpBridge
}

function joinLines(lines: string[]): string {
  return lines.join("\n")
}

export function registerEngramCommands(pi: ExtensionAPI, deps: PiEngramCommandDeps) {
  pi.registerCommand("engram-status", {
    description: "Show Engram status",
    handler: async (_args, ctx) => {
      const snapshot = buildStatusSnapshot(deps.runtime, deps.config, {
        http: await deps.http.isHealthy(),
        mcp: deps.bridge.healthy,
      })
      ctx.ui.notify(joinLines(formatStatusSnapshot(snapshot)), "info")
    },
  })

  pi.registerCommand("engram-restart", {
    description: "Restart the Engram bridge",
    handler: async (_args, ctx) => {
      await deps.bridge.close()
      await deps.http.shutdown()
      await deps.http.ensureRunning()
      await deps.bridge.ensureReady()
      ctx.ui.notify("Engram bridge restarted", "info")
    },
  })

  pi.registerCommand("engram-context", {
    description: "Fetch and display Engram context",
    handler: async (_args, ctx) => {
      if (!deps.runtime.project) {
        ctx.ui.notify("No project available for Engram context", "warning")
        return
      }
      const context = await deps.http.getContext(deps.runtime.project)
      deps.runtime.cachedContext = context
      ctx.ui.notify(context ?? "No context returned by Engram", "info")
    },
  })

  pi.registerCommand("engram-save-summary", {
    description: "Save a manual Engram session summary",
    handler: async (_args, ctx) => {
      if (!deps.runtime.project || !deps.runtime.engramSessionId) {
        ctx.ui.notify("Engram session is not ready", "warning")
        return
      }
      const summary = buildSessionSummary(ctx.sessionManager.getBranch() as unknown[], deps.runtime.project)
      await deps.bridge.ensureReady()
      await deps.bridge.callTool("mem_session_summary", {
        session_id: deps.runtime.engramSessionId,
        content: summary,
      })
      ctx.ui.notify("Engram session summary saved", "info")
    },
  })
}
