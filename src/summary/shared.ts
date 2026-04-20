function stringifyPart(part: unknown): string {
  if (typeof part === "string") return part
  if (part && typeof part === "object") {
    const value = part as Record<string, unknown>
    if (typeof value.text === "string") return value.text
    if (typeof value.content === "string") return value.content
  }
  return ""
}

export function extractEntryText(entry: unknown): string {
  if (!entry || typeof entry !== "object") return ""

  const value = entry as Record<string, unknown>
  if (typeof value.content === "string") return value.content
  if (typeof value.text === "string") return value.text

  const message = (value.message as Record<string, unknown> | undefined) ?? undefined
  if (message) {
    if (typeof message.content === "string") return message.content
    if (Array.isArray(message.content)) return message.content.map(stringifyPart).filter(Boolean).join("\n")
    if (typeof message.summary === "object" && message.summary) {
      const summary = message.summary as Record<string, unknown>
      return [summary.title, summary.body].filter((part) => typeof part === "string" && part.trim()).join("\n")
    }
  }

  if (Array.isArray(value.parts)) {
    return value.parts.map(stringifyPart).filter(Boolean).join("\n")
  }

  return ""
}

export function extractFileHints(entries: unknown[]): string[] {
  const hints = new Set<string>()
  const pathPattern = /(?:[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-\/]+\.(?:ts|tsx|js|jsx|md|json|yml|yaml|sh|go|rs|py|toml|xml))/g

  for (const entry of entries) {
    const text = extractEntryText(entry)
    for (const match of text.match(pathPattern) ?? []) {
      hints.add(match)
    }
  }

  return [...hints].slice(0, 8)
}

export function extractRecentBullets(entries: unknown[], count = 5): string[] {
  const bullets = entries
    .map(extractEntryText)
    .map((text) => text.trim())
    .filter(Boolean)
    .slice(-count)

  return bullets
}
