import { spawn, type ChildProcess } from "node:child_process"
import { setTimeout as delay } from "node:timers/promises"

import type { PiEngramConfig } from "../config"
import { redactPrivateContentDeep } from "./privacy"

export class EngramHttpDaemon {
  private child?: ChildProcess
  private startedByExtension = false

  constructor(private readonly config: PiEngramConfig) {}

  get wasStartedByExtension(): boolean {
    return this.startedByExtension
  }

  get pid(): number | undefined {
    return this.child?.pid
  }

  async isHealthy(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.engramUrl}/health`, {
        signal: AbortSignal.timeout(750),
      })
      return response.ok
    } catch {
      return false
    }
  }

  async ensureRunning(): Promise<boolean> {
    if (await this.isHealthy()) return true

    if (!this.child) {
      this.start()
    }

    for (let attempt = 0; attempt < 12; attempt += 1) {
      if (await this.isHealthy()) return true
      await delay(250)
    }

    return false
  }

  start(): void {
    if (this.child) return

    const args = ["serve"]
    if (this.config.engramPort !== 7437) {
      args.push(String(this.config.engramPort))
    }

    const child = spawn(this.config.engramBin, args, {
      stdio: "ignore",
      detached: true,
    })
    child.unref()
    this.child = child
    this.startedByExtension = true
  }

  async requestJson(path: string, init: RequestInit = {}): Promise<unknown> {
    const response = await fetch(`${this.config.engramUrl}${path}`, {
      ...init,
      headers: {
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(init.headers ?? {}),
      },
    })

    const text = await response.text()
    if (!text) return null
    try {
      return JSON.parse(text) as unknown
    } catch {
      return text
    }
  }

  async getContext(project: string): Promise<string | undefined> {
    try {
      const value = (await this.requestJson(`/context?project=${encodeURIComponent(project)}`)) as { context?: string } | string | null
      if (typeof value === "string") return value
      return value?.context
    } catch {
      return undefined
    }
  }

  async createSession(body: Record<string, unknown>): Promise<void> {
    try {
      await this.requestJson("/sessions", {
        method: "POST",
        body: JSON.stringify(redactPrivateContentDeep(body)),
      })
    } catch {
      // best effort
    }
  }

  async endSession(sessionId: string): Promise<void> {
    try {
      await this.requestJson(`/sessions/${encodeURIComponent(sessionId)}/end`, {
        method: "POST",
        body: JSON.stringify({}),
      })
    } catch {
      // best effort
    }
  }

  async savePrompt(body: Record<string, unknown>): Promise<void> {
    try {
      await this.requestJson("/prompts", {
        method: "POST",
        body: JSON.stringify(redactPrivateContentDeep(body)),
      })
    } catch {
      // best effort
    }
  }

  async capturePassive(body: Record<string, unknown>): Promise<void> {
    try {
      await this.requestJson("/observations/passive", {
        method: "POST",
        body: JSON.stringify(redactPrivateContentDeep(body)),
      })
    } catch {
      // best effort
    }
  }

  async migrateProject(oldProject: string, newProject: string): Promise<void> {
    try {
      await this.requestJson("/projects/migrate", {
        method: "POST",
        body: JSON.stringify({ old_project: oldProject, new_project: newProject }),
      })
    } catch {
      // best effort
    }
  }

  async shutdown(): Promise<void> {
    if (!this.child || !this.startedByExtension || !this.config.managedDaemon) return
    try {
      this.child.kill("SIGTERM")
    } catch {
      // ignore
    }
  }
}
