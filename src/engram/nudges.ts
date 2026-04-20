import type { PiEngramConfig } from "../config"
import type { PiEngramRuntimeState } from "./state"

export function recordToolActivity(state: PiEngramRuntimeState): void {
  state.toolCount += 1
}

export function shouldNudgeForSave(state: PiEngramRuntimeState, config: PiEngramConfig, now = Date.now()): boolean {
  const lastSave = state.lastMemSaveAt ?? 0
  const stale = now - lastSave >= config.saveNudgeMinutes * 60 * 1000
  return state.toolCount >= 5 && stale
}

export function markSaveNudge(state: PiEngramRuntimeState): void {
  state.pendingSaveNudge = true
}

export function clearSaveNudge(state: PiEngramRuntimeState): void {
  state.pendingSaveNudge = false
}
