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

export function createEngramToolExecutor(bridge: EngramMcpBridge) {
  return async function executeEngramTool(toolName: string, params: Record<string, unknown>) {
    try {
      const result = await bridge.callTool(toolName, redactPrivateContentDeep(params))
      if (result && typeof result === "object" && "isError" in result && (result as { isError?: boolean }).isError) {
        return {
          content: textContent(toText(result)),
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
