export function buildMemoryProtocol(project: string): string {
  return `## Engram Persistent Memory — ACTIVE PROTOCOL

You have access to Engram persistent memory via native pi tools.

### Core rules
- Call \`mem_save\` after a bugfix, design decision, non-obvious discovery, convention, configuration change, or user preference.
- Call \`mem_search\` or \`mem_context\` when you need prior work or a reminder of what happened before.
- Use \`mem_session_summary\` before ending a meaningful session.
- After compaction or a context reset, recover state before continuing.

### Privacy
- Treat \`<private>...</private>\` blocks as sensitive.
- Do not persist them in raw form.

### Project
- Current project: ${project}
- Prefer project-scoped memory unless the memory is clearly personal.

### Behavior
- Save proactively. Do not wait to be asked.
- Keep memory structured and searchable.
- Prefer concise summaries with What / Why / Where / Learned.
`
}
