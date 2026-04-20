import { createHash } from "node:crypto"

export interface SessionIdentityInput {
  cwd: string
  project: string
  sessionFile?: string | null
  leafId?: string | null
  branchId?: string | null
}

export function deriveEngramSessionId(input: SessionIdentityInput): string {
  const material = [
    input.project,
    input.cwd,
    input.sessionFile ?? "",
    input.leafId ?? "",
    input.branchId ?? "",
  ].join("|")

  const digest = createHash("sha1").update(material).digest("hex")
  return `pi-engram:${digest.slice(0, 16)}`
}
