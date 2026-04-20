import { describe, expect, it } from "vitest"

import { redactPrivateContent, redactPrivateContentDeep } from "../../src/engram/privacy"

describe("privacy redaction", () => {
  it("redacts private blocks in strings", () => {
    expect(redactPrivateContent("hello <private>secret</private> world")).toBe("hello [REDACTED] world")
  })

  it("redacts nested objects", () => {
    expect(
      redactPrivateContentDeep({
        note: "a <private>b</private> c",
        nested: ["x", "<private>y</private>"],
      }),
    ).toEqual({ note: "a [REDACTED] c", nested: ["x", "[REDACTED]"] })
  })
})
