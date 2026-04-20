const PRIVATE_TAG_RE = /<private>[\s\S]*?<\/private>/gi

export function redactPrivateContent(value: string): string {
  if (!value) return ""
  return value.replace(PRIVATE_TAG_RE, "[REDACTED]").trim()
}

export function redactPrivateContentDeep<T>(value: T): T {
  if (typeof value === "string") {
    return redactPrivateContent(value) as T
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactPrivateContentDeep(item)) as T
  }

  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {}
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      out[key] = redactPrivateContentDeep(entry)
    }
    return out as T
  }

  return value
}
