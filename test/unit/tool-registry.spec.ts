import { describe, expect, it } from "vitest"

import { engramTools } from "../../src/engram/tool-registry"

describe("engram tool registry", () => {
  it("includes the core Engram tools", () => {
    expect(engramTools.map((tool) => tool.name)).toEqual(
      expect.arrayContaining([
        "mem_save",
        "mem_search",
        "mem_context",
        "mem_session_summary",
        "mem_merge_projects",
      ]),
    )
  })
})
