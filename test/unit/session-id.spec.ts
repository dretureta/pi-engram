import { describe, expect, it } from "vitest"

import { deriveEngramSessionId } from "../../src/engram/session-id"

describe("session id derivation", () => {
  it("is stable for the same inputs", () => {
    const first = deriveEngramSessionId({ cwd: "/tmp/work", project: "demo", sessionFile: "/tmp/session.jsonl" })
    const second = deriveEngramSessionId({ cwd: "/tmp/work", project: "demo", sessionFile: "/tmp/session.jsonl" })
    expect(first).toBe(second)
  })
})
