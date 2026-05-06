import { Type } from "typebox"

export const engramToolSchemas = {
  mem_search: Type.Object(
    {
      query: Type.String(),
      type: Type.Optional(Type.String()),
      project: Type.Optional(Type.String()),
      scope: Type.Optional(Type.String()),
      limit: Type.Optional(Type.Number()),
    },
    { additionalProperties: false },
  ),
  mem_save: Type.Object(
    {
      title: Type.String(),
      content: Type.String(),
      type: Type.Optional(Type.String()),
      session_id: Type.Optional(Type.String()),
      scope: Type.Optional(Type.String()),
      topic_key: Type.Optional(Type.String()),
      capture_prompt: Type.Optional(Type.Boolean()),
    },
    { additionalProperties: false },
  ),
  mem_update: Type.Object(
    {
      id: Type.Number(),
      title: Type.Optional(Type.String()),
      content: Type.Optional(Type.String()),
      type: Type.Optional(Type.String()),
      scope: Type.Optional(Type.String()),
      topic_key: Type.Optional(Type.String()),
    },
    { additionalProperties: false },
  ),
  mem_delete: Type.Object(
    {
      id: Type.Number(),
      hard_delete: Type.Optional(Type.Boolean()),
    },
    { additionalProperties: false },
  ),
  mem_suggest_topic_key: Type.Object(
    {
      type: Type.Optional(Type.String()),
      title: Type.Optional(Type.String()),
      content: Type.Optional(Type.String()),
    },
    { additionalProperties: false },
  ),
  mem_context: Type.Object(
    {
      project: Type.Optional(Type.String()),
      scope: Type.Optional(Type.String()),
    },
    { additionalProperties: false },
  ),
  mem_timeline: Type.Object(
    {
      observation_id: Type.Number(),
      before: Type.Optional(Type.Number()),
      after: Type.Optional(Type.Number()),
    },
    { additionalProperties: false },
  ),
  mem_get_observation: Type.Object(
    {
      id: Type.Number(),
    },
    { additionalProperties: false },
  ),
  mem_session_summary: Type.Object(
    {
      content: Type.String(),
      session_id: Type.Optional(Type.String()),
    },
    { additionalProperties: false },
  ),
  mem_session_start: Type.Object(
    {
      id: Type.String(),
      directory: Type.Optional(Type.String()),
    },
    { additionalProperties: false },
  ),
  mem_session_end: Type.Object(
    {
      id: Type.String(),
      summary: Type.Optional(Type.String()),
    },
    { additionalProperties: false },
  ),
  mem_capture_passive: Type.Object(
    {
      content: Type.String(),
      session_id: Type.Optional(Type.String()),
    },
    { additionalProperties: false },
  ),
  mem_save_prompt: Type.Object(
    {
      content: Type.String(),
      session_id: Type.Optional(Type.String()),
    },
    { additionalProperties: false },
  ),
  mem_merge_projects: Type.Object(
    {
      from: Type.String(),
      to: Type.String(),
    },
    { additionalProperties: false },
  ),
  mem_current_project: Type.Object(
    {},
    { additionalProperties: false },
  ),
  mem_judge: Type.Object(
    {
      judgment_id: Type.String(),
      relation: Type.String(),
      reason: Type.Optional(Type.String()),
      evidence: Type.Optional(Type.String()),
      confidence: Type.Optional(Type.Number()),
      session_id: Type.Optional(Type.String()),
    },
    { additionalProperties: false },
  ),
  mem_stats: Type.Object(
    {
      project: Type.Optional(Type.String()),
    },
    { additionalProperties: false },
  ),
  mem_doctor: Type.Object(
    {
      project: Type.Optional(Type.String()),
      check: Type.Optional(Type.String()),
    },
    { additionalProperties: false },
  ),
  mem_compare: Type.Object(
    {
      memory_id_a: Type.Number(),
      memory_id_b: Type.Number(),
      relation: Type.String(),
      confidence: Type.Number(),
      reasoning: Type.String(),
      model: Type.Optional(Type.String()),
    },
    { additionalProperties: false },
  ),
} as const

export type EngramToolName = keyof typeof engramToolSchemas
