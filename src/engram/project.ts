import { spawnSync } from "node:child_process"
import { basename } from "node:path"

function tryGitCommand(cwd: string, args: string[]): string | undefined {
  const result = spawnSync("git", ["-C", cwd, ...args], { encoding: "utf8" })
  if (result.status !== 0) return undefined
  const output = String(result.stdout ?? "").trim()
  return output || undefined
}

function normalizeProjectName(project: string): string {
  let normalized = project.trim().toLowerCase()
  while (normalized.includes("--")) {
    normalized = normalized.replaceAll("--", "-")
  }
  while (normalized.includes("__")) {
    normalized = normalized.replaceAll("__", "_")
  }
  return normalized
}

export function detectProjectName(cwd: string): string {
  const remote = tryGitCommand(cwd, ["remote", "get-url", "origin"])
  if (remote) {
    const cleaned = remote.replace(/\.git$/, "")
    const parts = cleaned.split(/[/:]/)
    const name = parts[parts.length - 1]
    if (name) return normalizeProjectName(name)
  }

  const topLevel = tryGitCommand(cwd, ["rev-parse", "--show-toplevel"])
  if (topLevel) {
    return normalizeProjectName(basename(topLevel))
  }

  return normalizeProjectName(basename(cwd) || "unknown")
}
