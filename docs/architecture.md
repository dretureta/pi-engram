# Architecture

`pi-engram` integrates Engram as a local dependency rather than reimplementing memory storage inside pi.

## Main pieces

- **HTTP daemon manager**: starts or checks `engram serve` for health, session creation, prompt capture, and context lookup.
- **MCP bridge**: spawns `engram mcp` and proxies `mem_*` calls through a standard JSON-RPC/MCP stdio client.
- **Native tools**: registers Engram operations as `pi.registerTool()` tools so they are visible to the model.
- **Lifecycle hooks**: uses pi hooks for `session_start`, `input`, `before_agent_start`, `tool_result`, `session_before_compact`, and `session_shutdown`.
- **Summaries and redaction**: generates compact summaries and removes `<private>` blocks before persistence.

## Design goals

- keep the extension small and adapter-like
- preserve Engram’s memory semantics
- avoid Claude/OpenCode-specific hook files
- make failures recoverable with commands and status views

## Rollout

1. Scaffold package and shared helpers
2. Add process management and native tools
3. Wire lifecycle hooks
4. Add compaction/shutdown summaries
5. Add commands, tests, and CI
