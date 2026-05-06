import type { EngramToolName } from "./tool-schemas"
import { engramToolSchemas } from "./tool-schemas"

export interface EngramToolDefinition {
  name: EngramToolName
  description: string
  scope?: "agent" | "admin"
  promptSnippet?: string
  promptGuidelines?: string[]
}

export const engramTools: EngramToolDefinition[] = [
  {
    name: "mem_save",
    description: "Save a structured memory observation into Engram",
    promptSnippet: "Save a memory observation with a title, optional type, and structured content",
    promptGuidelines: [
      "Use mem_save after a fix, decision, discovery, or preference change.",
      "Use mem_current_project first if you need to confirm the active project before writing.",
    ],
  },
  { name: "mem_update", description: "Update an existing memory observation" },
  { name: "mem_delete", description: "Delete a memory observation", scope: "admin" },
  { name: "mem_suggest_topic_key", description: "Suggest a stable topic key for an evolving memory topic" },
  {
    name: "mem_search",
    description: "Search memories in Engram",
    promptSnippet: "Search Engram memory for prior work or context",
    promptGuidelines: ["Use mem_search when the user asks to recall something or when prior work may exist."],
  },
  { name: "mem_context", description: "Retrieve recent context for a project" },
  { name: "mem_timeline", description: "Retrieve chronological context around a memory" },
  { name: "mem_get_observation", description: "Retrieve a full memory observation" },
  { name: "mem_session_start", description: "Register a new Engram session" },
  { name: "mem_session_end", description: "Mark an Engram session as ended" },
  {
    name: "mem_session_summary",
    description: "Save a session summary for compaction or shutdown",
    promptSnippet: "Save the session summary so the next turn can recover the work",
  },
  { name: "mem_save_prompt", description: "Save an important user prompt for later context" },
  { name: "mem_stats", description: "Show Engram memory statistics", scope: "admin" },
  { name: "mem_capture_passive", description: "Save passive learnings from a long tool output" },
  { name: "mem_merge_projects", description: "Merge two project names in Engram", scope: "admin" },
  { name: "mem_current_project", description: "Detect the current project from the working directory" },
  { name: "mem_judge", description: "Record a verdict on a pending memory conflict" },
  { name: "mem_doctor", description: "Run read-only operational diagnostics on Engram" },
  { name: "mem_compare", description: "Persist a semantic verdict on two observations into Engram" },
]

export function getEngramToolSchema(name: EngramToolName) {
  return engramToolSchemas[name]
}
