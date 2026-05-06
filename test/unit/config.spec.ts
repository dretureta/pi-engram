import { describe, expect, it } from "vitest"

import { loadPiEngramConfig } from "../../src/config"

describe("config loading", () => {
  it("uses defaults when env vars are not set", () => {
    const config = loadPiEngramConfig({} as NodeJS.ProcessEnv)
    expect(config.engramBin).toBe("engram")
    expect(config.engramPort).toBe(7437)
    expect(config.capturePrompts).toBe(true)
    expect(config.passiveCapture).toBe(true)
  })
})
