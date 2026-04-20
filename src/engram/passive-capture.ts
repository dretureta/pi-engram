import { redactPrivateContent } from "./privacy"

export function shouldCapturePassiveOutput(toolName: string, content: string, enabled = true): boolean {
  if (!enabled) return false
  if (toolName.startsWith("mem_")) return false
  return /^(Task|subagent|delegate)$/i.test(toolName) || content.length >= 800
}

export function buildPassiveCaptureContent(toolName: string, content: unknown): string {
  const text = typeof content === "string" ? content : JSON.stringify(content, null, 2)
  return redactPrivateContent(`Tool: ${toolName}\n${text}`)
}
