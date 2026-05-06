import type { ExtensionAPI } from "@mariozechner/pi-coding-agent"

import type { PiEngramConfig } from "../config"
import type { EngramHttpDaemon } from "../engram/http-daemon"
import type { EngramMcpBridge } from "../engram/mcp-bridge"
import { persistRuntimeState, type PiEngramRuntimeState } from "../engram/state"
import { buildCompactionSummary } from "../summary/compaction-summary"

export interface PiEngramCompactionDeps {
  config: PiEngramConfig
  runtime: PiEngramRuntimeState
  http: EngramHttpDaemon
  bridge: EngramMcpBridge
}

export function registerCompactionLifecycle(pi: ExtensionAPI, deps: PiEngramCompactionDeps) {
  pi.on("session_before_compact", async (event, _ctx) => {
    if (!deps.runtime.project || !deps.runtime.engramSessionId) return

    const summary = buildCompactionSummary(
      (event.branchEntries ?? []) as unknown[],
      deps.runtime.project,
    )

    deps.runtime.needsCompactionRecovery = true
    deps.runtime.summarySavedAt = Date.now()
    persistRuntimeState(pi, deps.runtime)

    await deps.bridge.ensureReady().catch(() => undefined)
    await deps.bridge.callTool("mem_session_summary", {
      session_id: deps.runtime.engramSessionId,
      content: summary,
    }).catch(() => undefined)

    const firstKeptEntryId = event.preparation?.firstKeptEntryId
    return {
      compaction: {
        summary,
        firstKeptEntryId,
        tokensBefore: event.preparation?.tokensBefore,
      },
    }
  })
}
