import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process"

import type { PiEngramConfig } from "../config"
import { redactPrivateContentDeep } from "./privacy"

interface JsonRpcRequest {
  jsonrpc: "2.0"
  id: number
  method: string
  params?: unknown
}

interface JsonRpcResponse {
  jsonrpc?: "2.0"
  id?: number
  result?: unknown
  error?: { code: number; message: string; data?: unknown }
}

type Pending = {
  resolve: (value: unknown) => void
  reject: (error: Error) => void
}

export class EngramMcpBridge {
  private child?: ChildProcessWithoutNullStreams
  private buffer = ""
  private nextId = 1
  private initialized = false
  private supportedTools: string[] = []
  private pending = new Map<number, Pending>()

  constructor(private readonly config: PiEngramConfig) {}

  get healthy(): boolean {
    return this.initialized && !!this.child && !this.child.killed
  }

  get toolNames(): string[] {
    return [...this.supportedTools]
  }

  async ensureReady(): Promise<void> {
    if (this.healthy) return
    if (!this.child || this.child.killed) {
      this.spawn()
    }
    await this.initialize()
  }

  private spawn(): void {
    const args = ["mcp", ...this.config.engramMcpArgs]
    const child = spawn(this.config.engramBin, args, {
      stdio: ["pipe", "pipe", "pipe"],
    })
    this.child = child
    this.initialized = false
    this.supportedTools = []
    this.buffer = ""

    child.stdout.on("data", (chunk: Buffer) => {
      this.buffer += chunk.toString("utf8")
      let newlineIndex = this.buffer.indexOf("\n")
      while (newlineIndex >= 0) {
        const line = this.buffer.slice(0, newlineIndex).trim()
        this.buffer = this.buffer.slice(newlineIndex + 1)
        if (line) this.handleLine(line)
        newlineIndex = this.buffer.indexOf("\n")
      }
    })

    child.stderr.on("data", () => {
      // keep stderr quiet by default; the process may still be healthy
    })

    child.on("exit", () => {
      this.initialized = false
      for (const [id, pending] of this.pending) {
        pending.reject(new Error(`Engram MCP bridge exited before resolving request ${id}`))
      }
      this.pending.clear()
      this.child = undefined
      this.supportedTools = []
    })
  }

  private handleLine(line: string): void {
    let message: JsonRpcResponse
    try {
      message = JSON.parse(line) as JsonRpcResponse
    } catch {
      return
    }

    if (typeof message.id !== "number") {
      return
    }

    const pending = this.pending.get(message.id)
    if (!pending) return
    this.pending.delete(message.id)

    if (message.error) {
      pending.reject(new Error(message.error.message))
      return
    }

    pending.resolve(message.result)
  }

  private async initialize(): Promise<void> {
    const result = await this.request("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: {
        name: "pi-engram",
        version: "0.1.0",
      },
    })

    this.send({ jsonrpc: "2.0", method: "notifications/initialized" } as unknown as JsonRpcRequest)
    this.initialized = true

    try {
      const tools = (await this.request("tools/list", {})) as { tools?: Array<{ name: string }> }
      this.supportedTools = tools?.tools?.map((tool) => tool.name) ?? []
    } catch {
      this.supportedTools = []
    }

    void result
  }

  private send(message: JsonRpcRequest | Record<string, unknown>): void {
    if (!this.child?.stdin.writable) {
      throw new Error("Engram MCP bridge is not running")
    }
    this.child.stdin.write(`${JSON.stringify(message)}\n`)
  }

  private request(method: string, params: unknown): Promise<unknown> {
    if (!this.child) {
      return Promise.reject(new Error("Engram MCP bridge is not running"))
    }

    const id = this.nextId++
    const request: JsonRpcRequest = {
      jsonrpc: "2.0",
      id,
      method,
      params: redactPrivateContentDeep(params),
    }

    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      try {
        this.send(request)
      } catch (error) {
        this.pending.delete(id)
        reject(error instanceof Error ? error : new Error(String(error)))
      }
    })
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    await this.ensureReady()
    return this.request("tools/call", { name, arguments: redactPrivateContentDeep(args) })
  }

  async close(): Promise<void> {
    if (!this.child) return
    try {
      this.child.kill("SIGTERM")
    } catch {
      // ignore
    }
    this.child = undefined
    this.initialized = false
    this.supportedTools = []
    this.pending.clear()
  }
}
