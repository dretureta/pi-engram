import { extractFileHints, extractRecentBullets } from "./shared"

function bullets(items: string[]): string {
  if (items.length === 0) return "- No notable entries captured yet."
  return items.map((item) => `- ${item.replace(/\n+/g, " ")}`).join("\n")
}

export function buildSessionSummary(entries: unknown[], project: string): string {
  const recent = extractRecentBullets(entries, 6)
  const files = extractFileHints(entries)

  return [
    "## Goal",
    recent[0] ?? `Continue work in ${project}.`,
    "",
    "## Instructions",
    "- Use Engram memory tools proactively.",
    "- Recover recent context with mem_context when needed.",
    "",
    "## Discoveries",
    bullets(recent.filter((item) => /discover|decision|learn|gotcha|found/i.test(item))),
    "",
    "## Accomplished",
    bullets(recent),
    "",
    "## Next Steps",
    "- Resume from the latest state and record any new durable memories.",
    "",
    "## Relevant Files",
    bullets(files.length > 0 ? files : ["No specific files extracted from the current branch."]),
  ].join("\n")
}
