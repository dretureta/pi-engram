import type { ExtensionAPI } from "@mariozechner/pi-coding-agent"

import type { PiEngramConfig } from "../config"
import { buildMemoryProtocol } from "../engram/memory-protocol"
import { redactPrivateContent } from "../engram/privacy"
import { buildSessionSummary } from "../summary/session-summary"
import type { EngramHttpDaemon } from "../engram/http-daemon"
import { persistRuntimeState, type PiEngramRuntimeState } from "../engram/state"

export interface PiEngramPromptDeps {
  config: PiEngramConfig
  runtime: PiEngramRuntimeState
  http: EngramHttpDaemon
}

export function registerPromptLifecycle(pi: ExtensionAPI, deps: PiEngramPromptDeps) {
  pi.on("input", async (event, _ctx) => {
    if (typeof event.text === "string" && event.text.trim()) {
      deps.runtime.promptCount += 1
      deps.runtime.lastPrompt = redactPrivateContent(event.text)
      persistRuntimeState(pi, deps.runtime)
    }

    if (
      deps.runtime.project &&
      deps.runtime.engramSessionId &&
      deps.config.capturePrompts &&
      typeof event.text === "string" &&
      event.text.trim().length > 10
    ) {
      await deps.http.savePrompt({
        session_id: deps.runtime.engramSessionId,
        project: deps.runtime.project,
        content: redactPrivateContent(event.text),
      })
    }

    return { action: "continue" as const }
  })

  pi.on("before_agent_start", async (event, _ctx) => {
    const project = deps.runtime.project ?? "unknown"
    const protocol = buildMemoryProtocol(project)
    let systemPrompt = `${event.systemPrompt ?? ""}\n\n${protocol}`.trim()

    if (deps.runtime.pendingSaveNudge) {
      systemPrompt += "\n\nYou have been asked to save an Engram memory. Call mem_save if the work is durable."
      deps.runtime.pendingSaveNudge = false
    }

    if (deps.runtime.needsCompactionRecovery && deps.runtime.cachedContext) {
      systemPrompt += `\n\n## Engram Recovery Context\n${deps.runtime.cachedContext}`
      deps.runtime.needsCompactionRecovery = false
    }

    if (deps.runtime.promptCount <= 1 && deps.runtime.cachedContext) {
      systemPrompt += `\n\n## Recent Engram Context\n${deps.runtime.cachedContext}`
    }

    return { systemPrompt }
  })
}
