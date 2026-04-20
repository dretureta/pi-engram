import { Type } from "@sinclair/typebox"

export const engramToolSchemas = {
  mem_save: Type.Object(
    {
      title: Type.String(),
      type: Type.String(),
      scope: Type.Optional(Type.Union([Type.Literal("project"), Type.Literal("personal")])) ,
      topic_key: Type.Optional(Type.String()),
      content: Type.String(),
      project: Type.Optional(Type.String()),
      session_id: Type.Optional(Type.String()),
    },
    { additionalProperties: false },
  ),
  mem_update: Type.Object(
    {
      id: Type.String(),
      title: Type.Optional(Type.String()),
      type: Type.Optional(Type.String()),
      content: Type.Optional(Type.String()),
      project: Type.Optional(Type.String()),
    },
    { additionalProperties: false },
  ),
  mem_delete: Type.Object(
    {
      id: Type.String(),
      hard_delete: Type.Optional(Type.Boolean()),
    },
    { additionalProperties: false },
  ),
  mem_suggest_topic_key: Type.Object(
    {
      type: Type.String(),
      title: Type.String(),
      scope: Type.Optional(Type.Union([Type.Literal("project"), Type.Literal("personal")])) ,
    },
    { additionalProperties: false },
  ),
  mem_search: Type.Object(
    {
      query: Type.String(),
      limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 20 })),
      project: Type.Optional(Type.String()),
    },
    { additionalProperties: false },
  ),
  mem_context: Type.Object(
    {
      project: Type.Optional(Type.String()),
      limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 20 })),
    },
    { additionalProperties: false },
  ),
  mem_timeline: Type.Object(
    {
      observation_id: Type.String(),
      project: Type.Optional(Type.String()),
    },
    { additionalProperties: false },
  ),
  mem_get_observation: Type.Object(
    {
      id: Type.String(),
    },
    { additionalProperties: false },
  ),
  mem_session_start: Type.Object(
    {
      session_id: Type.String(),
      project: Type.String(),
      directory: Type.String(),
    },
    { additionalProperties: false },
  ),
  mem_session_end: Type.Object(
    {
      session_id: Type.String(),
    },
    { additionalProperties: false },
  ),
  mem_session_summary: Type.Object(
    {
      session_id: Type.String(),
      project: Type.String(),
      summary: Type.String(),
    },
    { additionalProperties: false },
  ),
  mem_save_prompt: Type.Object(
    {
      session_id: Type.String(),
      project: Type.String(),
      content: Type.String(),
    },
    { additionalProperties: false },
  ),
  mem_stats: Type.Object(
    {},
    { additionalProperties: false },
  ),
  mem_capture_passive: Type.Object(
    {
      session_id: Type.String(),
      project: Type.String(),
      source: Type.String(),
      content: Type.String(),
    },
    { additionalProperties: false },
  ),
  mem_merge_projects: Type.Object(
    {
      old_project: Type.String(),
      new_project: Type.String(),
    },
    { additionalProperties: false },
  ),
} as const

export type EngramToolName = keyof typeof engramToolSchemas
