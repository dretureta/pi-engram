import type { PiEngramConfig } from "../config"
import type { PiEngramRuntimeState } from "./state"

export interface EngramHealthSnapshot {
  http: boolean
  mcp: boolean
  syncPhase?: string
}

export interface EngramStatusSnapshot {
  project?: string
  sessionId?: string
  engramSessionId?: string
  promptCount: number
  toolCount: number
  lastMemSaveAt?: number
  summarySavedAt?: number
  needsCompactionRecovery: boolean
  daemonStartedByExtension: boolean
  managedDaemon: boolean
  httpHealthy: boolean
  mcpHealthy: boolean
  syncPhase?: string
  engramUrl: string
  engramBin: string
  saveNudgeMinutes: number
}

export function buildStatusSnapshot(
  state: PiEngramRuntimeState,
  config: PiEngramConfig,
  health: EngramHealthSnapshot,
): EngramStatusSnapshot {
  return {
    project: state.project,
    sessionId: state.sessionId,
    engramSessionId: state.engramSessionId,
    promptCount: state.promptCount,
    toolCount: state.toolCount,
    lastMemSaveAt: state.lastMemSaveAt,
    summarySavedAt: state.summarySavedAt,
    needsCompactionRecovery: state.needsCompactionRecovery,
    daemonStartedByExtension: state.daemonStartedByExtension,
    managedDaemon: config.managedDaemon,
    httpHealthy: health.http,
    mcpHealthy: health.mcp,
    syncPhase: health.syncPhase,
    engramUrl: config.engramUrl,
    engramBin: config.engramBin,
    saveNudgeMinutes: config.saveNudgeMinutes,
  }
}

export function formatStatusSnapshot(snapshot: EngramStatusSnapshot): string[] {
  return [
    `project: ${snapshot.project ?? "unknown"}`,
    `session: ${snapshot.sessionId ?? "unknown"}`,
    `engram session: ${snapshot.engramSessionId ?? "unknown"}`,
    `http healthy: ${snapshot.httpHealthy ? "yes" : "no"}`,
    `mcp healthy: ${snapshot.mcpHealthy ? "yes" : "no"}`,
    ...(snapshot.syncPhase ? [`sync: ${snapshot.syncPhase}`] : []),
    `daemon started by extension: ${snapshot.daemonStartedByExtension ? "yes" : "no"}`,
    `pending recovery: ${snapshot.needsCompactionRecovery ? "yes" : "no"}`,
    `tool count: ${snapshot.toolCount}`,
    `prompt count: ${snapshot.promptCount}`,
  ]
}
