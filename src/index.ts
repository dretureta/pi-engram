import type { ExtensionAPI } from "@mariozechner/pi-coding-agent"

import { loadPiEngramConfig } from "./config"
import { registerEngramCommands } from "./commands"
import { EngramHttpDaemon } from "./engram/http-daemon"
import { EngramMcpBridge } from "./engram/mcp-bridge"
import { createRuntimeState } from "./engram/state"
import { registerEngramTools } from "./engram/register-tools"
import { registerCompactionLifecycle } from "./hooks/compaction"
import { registerPromptLifecycle } from "./hooks/prompt-lifecycle"
import { registerSessionLifecycle } from "./hooks/session-lifecycle"
import { registerToolObserver } from "./hooks/tool-observer"

export default function (pi: ExtensionAPI) {
  const config = loadPiEngramConfig()
  const runtime = createRuntimeState()
  const http = new EngramHttpDaemon(config)
  const bridge = new EngramMcpBridge(config)

  registerEngramTools(pi, bridge, config)
  registerSessionLifecycle(pi, { config, runtime, http, bridge })
  registerPromptLifecycle(pi, { config, runtime, http })
  registerToolObserver(pi, { config, runtime, http })
  registerCompactionLifecycle(pi, { config, runtime, http, bridge })
  registerEngramCommands(pi, { config, runtime, http, bridge })
}
