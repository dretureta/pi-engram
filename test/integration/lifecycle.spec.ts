import { describe, expect, it } from "vitest"

import { createRuntimeState, snapshotRuntimeState } from "../../src/engram/state"
import { buildMemoryProtocol } from "../../src/engram/memory-protocol"

describe("lifecycle helpers", () => {
  it("snapshots runtime state", () => {
    const runtime = createRuntimeState({ project: "demo", promptCount: 2 })
    const snapshot = snapshotRuntimeState(runtime)
    expect(snapshot.project).toBe("demo")
    expect(snapshot.promptCount).toBe(2)
  })

  it("builds a memory protocol for a project", () => {
    const protocol = buildMemoryProtocol("demo")
    expect(protocol).toContain("Engram Persistent Memory")
    expect(protocol).toContain("demo")
  })
})
