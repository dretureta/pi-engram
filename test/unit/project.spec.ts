import { mkdtempSync } from "node:fs"
import { mkdirSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { spawnSync } from "node:child_process"

import { describe, expect, it } from "vitest"

import { detectProjectName } from "../../src/engram/project"

describe("project detection", () => {
  it("falls back to the directory basename when git metadata is unavailable", () => {
    const dir = mkdtempSync(join(tmpdir(), "pi-engram-"))
    expect(detectProjectName(dir)).toBe(dir.split(/[\\/]/).pop()?.toLowerCase())
  })

  it("uses the remote repository name when git metadata is available", () => {
    const dir = mkdtempSync(join(tmpdir(), "pi-engram-git-"))
    spawnSync("git", ["init"], { cwd: dir, stdio: "ignore" })
    mkdirSync(join(dir, "src"), { recursive: true })
    spawnSync("git", ["config", "user.email", "test@example.com"], { cwd: dir, stdio: "ignore" })
    spawnSync("git", ["config", "user.name", "Test"], { cwd: dir, stdio: "ignore" })
    spawnSync("git", ["remote", "add", "origin", "git@github.com:demo/Sample--Project.git"], { cwd: dir, stdio: "ignore" })
    expect(detectProjectName(dir)).toBe("sample-project")
  })
})
