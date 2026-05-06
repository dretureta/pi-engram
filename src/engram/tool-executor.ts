import { redactPrivateContentDeep } from "./privacy"
import type { EngramMcpBridge } from "./mcp-bridge"

function textContent(text: string) {
  return [{ type: "text" as const, text }]
}

function toText(result: unknown): string {
  if (typeof result === "string") return result
  if (result && typeof result === "object") {
    const value = result as Record<string, unknown>
    if (typeof value.text === "string") return value.text
    if (typeof value.message === "string") return value.message
    if (Array.isArray(value.content)) {
      return value.content
        .map((part) => {
          if (typeof part === "string") return part
          if (part && typeof part === "object" && "text" in part) {
            return String((part as Record<string, unknown>).text ?? "")
          }
          return JSON.stringify(part)
        })
        .join("\n")
    }
  }
  return JSON.stringify(result, null, 2)
}

function normalizeToolArgs(params: Record<string, unknown>) {
  const normalized = { ...params }
  const scope = normalized.scope
  if (typeof scope === "string") {
    const value = scope.trim().toLowerCase()
    if (value === "project" || value === "personal") {
      normalized.scope = value
    } else {
      delete normalized.scope
    }
  }
  return normalized
}

export function createEngramToolExecutor(bridge: EngramMcpBridge) {
  return async function executeEngramTool(toolName: string, params: Record<string, unknown>) {
    try {
      const result = await bridge.callTool(toolName, redactPrivateContentDeep(normalizeToolArgs(params)))
      if (result && typeof result === "object" && "isError" in result && (result as { isError?: boolean }).isError) {
        const r = result as Record<string, unknown>
        let message = toText(result)
        if (r.ambiguous_project === true) {
          const projects = Array.isArray(r.available_projects) ? (r.available_projects as string[]).join(", ") : ""
          message += projects
            ? `\n\nEngram matched multiple projects: ${projects}. Add a .engram/config.json with {"project_name": "<name>"} to pin the project for this repo.`
            : "\n\nAdd a .engram/config.json with {\"project_name\": \"<name>\"} to pin the project for this repo."
        }
        return {
          content: textContent(message),
          isError: true,
          details: result,
        }
      }

      return {
        content: textContent(toText(result)),
        details: result,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return {
        content: textContent(message),
        isError: true,
        details: { error: message },
      }
    }
  }
}
