export interface PiEngramConfig {
  engramBin: string
  engramPort: number
  engramUrl: string
  engramMcpArgs: string[]
  summaryModel?: string
  capturePrompts: boolean
  passiveCapture: boolean
  managedDaemon: boolean
  saveNudgeMinutes: number
  toolProfile: "all" | "agent" | "admin"
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value == null) return fallback
  return !["0", "false", "no", "off"].includes(value.toLowerCase())
}

function parseNumber(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

function parseList(value: string | undefined): string[] {
  if (!value) return []
  return value
    .split(/[\s,]+/)
    .map((part) => part.trim())
    .filter(Boolean)
}

export function loadPiEngramConfig(env: NodeJS.ProcessEnv = process.env): PiEngramConfig {
  const engramPort = parseNumber(env.ENGRAM_PORT, 7437)

  return {
    engramBin: env.ENGRAM_BIN?.trim() || "engram",
    engramPort,
    engramUrl: `http://127.0.0.1:${engramPort}`,
    engramMcpArgs: parseList(env.ENGRAM_MCP_ARGS),
    summaryModel: env.PI_ENGRAM_SUMMARY_MODEL?.trim() || undefined,
    capturePrompts: !parseBoolean(env.PI_ENGRAM_DISABLE_PROMPT_CAPTURE, false),
    passiveCapture: !parseBoolean(env.PI_ENGRAM_DISABLE_PASSIVE_CAPTURE, false),
    managedDaemon: parseBoolean(env.PI_ENGRAM_MANAGED_DAEMON, false),
    saveNudgeMinutes: parseNumber(env.PI_ENGRAM_SAVE_NUDGE_MINUTES, 20),
    toolProfile: (env.PI_ENGRAM_TOOL_PROFILE as PiEngramConfig["toolProfile"]) ?? "all",
  }
}
