import { extractFileHints, extractRecentBullets, extractEntryText } from "./shared"

function bulletLines(items: string[]): string {
  if (items.length === 0) return "- No notable entries captured yet."
  return items.map((item) => `- ${item.replace(/\n+/g, " ")}`).join("\n")
}

export function buildCompactionSummary(entries: unknown[], project: string): string {
  const recent = extractRecentBullets(entries, 6)
  const files = extractFileHints(entries)
  const allText = entries.map(extractEntryText).filter(Boolean)
  const goal = recent[0] ?? `Continue work in ${project}.`

  return [
    "FIRST ACTION REQUIRED: Call mem_session_summary with the content of this compacted summary. This preserves what was accomplished before compaction. Do this BEFORE any other work.",
    "",
    "## Goal",
    goal,
    "",
    "## Instructions",
    "- Recover state with mem_context if needed.",
    "- Save new memories proactively after meaningful progress.",
    "",
    "## Discoveries",
    bulletLines(allText.filter((line) => /discover|decision|learn|found|gotcha/i.test(line)).slice(-4)),
    "",
    "## Accomplished",
    bulletLines(recent),
    "",
    "## Next Steps",
    "- Continue from the compacted summary and persist any new durable decisions.",
    "",
    "## Relevant Files",
    bulletLines(files.length > 0 ? files : ["No specific files extracted from the current branch."]),
  ].join("\n")
}
