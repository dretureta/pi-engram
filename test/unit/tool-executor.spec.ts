import { describe, expect, it, vi } from "vitest"

import { createEngramToolExecutor } from "../../src/engram/tool-executor"

describe("engram tool executor", () => {
  it("normalizes scope before forwarding tool calls", async () => {
    const callTool = vi.fn().mockResolvedValue({ text: "ok" })
    const executor = createEngramToolExecutor({ callTool } as never)

    await executor("mem_save", {
      title: "Example",
      content: "**What**: test",
      scope: "Project",
    })

    expect(callTool).toHaveBeenCalledWith(
      "mem_save",
      expect.objectContaining({ scope: "project" }),
    )
  })

  it("drops invalid scope values before forwarding tool calls", async () => {
    const callTool = vi.fn().mockResolvedValue({ text: "ok" })
    const executor = createEngramToolExecutor({ callTool } as never)

    await executor("mem_save", {
      title: "Example",
      content: "**What**: test",
      scope: "workspace",
    })

    expect(callTool.mock.calls[0]?.[1]).not.toHaveProperty("scope")
  })
})
