export const PI_ENGRAM_STATE_TYPE = "pi-engram-state"

export interface PiEngramRuntimeState {
  project?: string
  sessionId?: string
  engramSessionId?: string
  promptCount: number
  toolCount: number
  lastMemSaveAt?: number
  summarySavedAt?: number
  needsCompactionRecovery: boolean
  pendingSaveNudge: boolean
  daemonStartedByExtension: boolean
  cachedContext?: string
  lastPrompt?: string
}

export function createRuntimeState(initial: Partial<PiEngramRuntimeState> = {}): PiEngramRuntimeState {
  return {
    promptCount: 0,
    toolCount: 0,
    needsCompactionRecovery: false,
    pendingSaveNudge: false,
    daemonStartedByExtension: false,
    ...initial,
  }
}

export function snapshotRuntimeState(state: PiEngramRuntimeState): Record<string, unknown> {
  return {
    project: state.project,
    sessionId: state.sessionId,
    engramSessionId: state.engramSessionId,
    promptCount: state.promptCount,
    toolCount: state.toolCount,
    lastMemSaveAt: state.lastMemSaveAt,
    summarySavedAt: state.summarySavedAt,
    needsCompactionRecovery: state.needsCompactionRecovery,
    pendingSaveNudge: state.pendingSaveNudge,
    daemonStartedByExtension: state.daemonStartedByExtension,
    cachedContext: state.cachedContext,
    lastPrompt: state.lastPrompt,
  }
}

export function restoreRuntimeState(entries: Array<{ type?: string; customType?: string; data?: unknown }>): Partial<PiEngramRuntimeState> {
  const customEntries = entries.filter((entry) => entry.type === "custom" && entry.customType === PI_ENGRAM_STATE_TYPE)
  const latest = customEntries[customEntries.length - 1]
  if (!latest || !latest.data || typeof latest.data !== "object") return {}
  return latest.data as Partial<PiEngramRuntimeState>
}

export function persistRuntimeState(pi: { appendEntry: (type: string, data?: unknown) => void }, state: PiEngramRuntimeState): void {
  pi.appendEntry(PI_ENGRAM_STATE_TYPE, snapshotRuntimeState(state))
}
