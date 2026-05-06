import type { ExtensionAPI } from "@mariozechner/pi-coding-agent"

import type { PiEngramConfig } from "../config"
import { createEngramToolExecutor } from "./tool-executor"
import { engramTools } from "./tool-registry"
import type { EngramMcpBridge } from "./mcp-bridge"
import { engramToolSchemas } from "./tool-schemas"

export function registerEngramTools(
  pi: ExtensionAPI,
  bridge: EngramMcpBridge,
  config: PiEngramConfig,
) {
  const execute = createEngramToolExecutor(bridge)

  for (const tool of engramTools) {
    if (config.toolProfile === "agent" && tool.scope === "admin") continue

    pi.registerTool({
      name: tool.name,
      label: tool.name,
      description: tool.description,
      promptSnippet: tool.promptSnippet,
      promptGuidelines: tool.promptGuidelines,
      parameters: engramToolSchemas[tool.name],
      async execute(_toolCallId, params, _signal, _onUpdate, _ctx) {
        return execute(tool.name, (params ?? {}) as Record<string, unknown>)
      },
    })
  }
}
