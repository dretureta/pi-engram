import type { ExtensionAPI } from "@mariozechner/pi-coding-agent"

import type { PiEngramConfig } from "../config"
import { buildPassiveCaptureContent, shouldCapturePassiveOutput } from "../engram/passive-capture"
import { clearSaveNudge, markSaveNudge, recordToolActivity, shouldNudgeForSave } from "../engram/nudges"
import { redactPrivateContent } from "../engram/privacy"
import type { EngramHttpDaemon } from "../engram/http-daemon"
import { persistRuntimeState, type PiEngramRuntimeState } from "../engram/state"

export interface PiEngramToolObserverDeps {
  config: PiEngramConfig
  runtime: PiEngramRuntimeState
  http: EngramHttpDaemon
}

export function registerToolObserver(pi: ExtensionAPI, deps: PiEngramToolObserverDeps) {
  pi.on("tool_result", async (event, _ctx) => {
    const toolName = String(event.toolName ?? "")
    if (!toolName) return

    if (toolName.startsWith("mem_")) {
      if (toolName === "mem_save") {
        deps.runtime.lastMemSaveAt = Date.now()
        clearSaveNudge(deps.runtime)
        persistRuntimeState(pi, deps.runtime)
      }

      if (toolName === "mem_session_summary") {
        deps.runtime.summarySavedAt = Date.now()
        deps.runtime.needsCompactionRecovery = false
        persistRuntimeState(pi, deps.runtime)
      }

      recordToolActivity(deps.runtime)
      return
    }

    recordToolActivity(deps.runtime)

    if (deps.runtime.project && deps.runtime.engramSessionId && deps.config.passiveCapture) {
      const content = redactPrivateContent(
        typeof event.content === "string"
          ? event.content
          : JSON.stringify(event.content ?? event.details ?? "", null, 2),
      )

      if (shouldCapturePassiveOutput(toolName, content, deps.config.passiveCapture)) {
        await deps.http.capturePassive({
          session_id: deps.runtime.engramSessionId,
          project: deps.runtime.project,
          source: toolName,
          content: buildPassiveCaptureContent(toolName, content),
        })
      }
    }

    if (shouldNudgeForSave(deps.runtime, deps.config)) {
      markSaveNudge(deps.runtime)
      persistRuntimeState(pi, deps.runtime)
    }
  })
}
