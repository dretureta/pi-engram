import { describe, expect, it } from "vitest"

import { buildCompactionSummary } from "../../src/summary/compaction-summary"
import { buildSessionSummary } from "../../src/summary/session-summary"

describe("summary builders", () => {
  it("builds a session summary with the required sections", () => {
    const summary = buildSessionSummary([{ message: { content: "Fixed issue in src/app.ts" } }], "demo")
    expect(summary).toContain("## Goal")
    expect(summary).toContain("## Relevant Files")
  })

  it("builds a compaction summary with the first action instruction", () => {
    const summary = buildCompactionSummary([{ message: { content: "Implemented feature in src/app.ts" } }], "demo")
    expect(summary).toContain("FIRST ACTION REQUIRED")
    expect(summary).toContain("## Accomplished")
  })
})
