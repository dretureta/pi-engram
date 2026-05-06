# AGENTS.md — pi-engram

pi extension that wraps the Engram persistent-memory system as native pi tools and lifecycle hooks.

## Commands

```bash
npm test              # run all tests (vitest run)
npm run test:watch    # vitest in watch mode
npm run lint          # typecheck only (tsc --noEmit) — no separate lint tool
```

No build step — the extension runs directly from TypeScript source via pi's bundler.

## Install / dev flow

```bash
./install.sh    # refresh global auto-discovery shim at ~/.pi/agent/extensions/pi-engram/
./dev.sh        # update dev shim only (no pi remove, no conflict cleanup)
./uninstall.sh  # remove package registration and dev shim
pi -e ./src/index.ts  # one-off load, useful for quick smoke tests
```

After running any of these, restart pi or run `/reload` inside an open session.

The shim writes a single `index.ts` that re-exports from the absolute path of `src/index.ts` — the extension never gets compiled to a `dist/` folder.

## Architecture

Entrypoint: `src/index.ts` — registers four hook modules and one command module:

| Module | File | What it does |
|---|---|---|
| `EngramHttpDaemon` | `src/engram/http-daemon.ts` | Spawns/checks `engram serve`, makes HTTP calls to Engram API |
| `EngramMcpBridge` | `src/engram/mcp-bridge.ts` | Spawns `engram mcp`, proxies JSON-RPC/MCP stdio calls |
| `registerEngramTools` | `src/engram/register-tools.ts` | Registers `mem_*` tools via `pi.registerTool()` |
| Hook modules | `src/hooks/*.ts` | `session-lifecycle`, `prompt-lifecycle`, `tool-observer`, `compaction` |
| Commands | `src/commands.ts` | `/engram-status`, `/engram-restart`, `/engram-context`, `/engram-save-summary` |

The HTTP daemon and the MCP bridge are two separate processes — `engram serve` for HTTP and `engram mcp` for tool dispatch. Both are lazily started and can be restarted independently.

## Tool profiles

`PI_ENGRAM_TOOL_PROFILE` controls which tools are registered:
- `all` (default) — all tools including admin-scoped ones
- `agent` — skips tools with `scope: "admin"` (mem_delete, mem_stats, mem_merge_projects)
- `admin` — not used by the filter; same as `all`

## Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `ENGRAM_BIN` | `engram` | Path to Engram binary |
| `ENGRAM_PORT` | `7437` | HTTP port for `engram serve` |
| `ENGRAM_MCP_ARGS` | `` | Extra args passed to `engram mcp` |
| `PI_ENGRAM_SUMMARY_MODEL` | `` | Model override for session summaries |
| `PI_ENGRAM_DISABLE_PASSIVE_CAPTURE` | `0` | Set `1` to skip passive captures |
| `PI_ENGRAM_DISABLE_PROMPT_CAPTURE` | `0` | Set `1` to skip prompt saves |
| `PI_ENGRAM_MANAGED_DAEMON` | `0` | Set `1` to let extension SIGTERM the daemon it started |
| `PI_ENGRAM_SAVE_NUDGE_MINUTES` | `20` | Minutes of inactivity before the save nudge fires |
| `PI_ENGRAM_TOOL_PROFILE` | `all` | Tool visibility profile (see above) |

## Privacy

`<private>...</private>` blocks in any string are replaced with `[REDACTED]` before anything is sent to Engram — both HTTP requests and MCP args. This happens in `redactPrivateContentDeep` (`src/engram/privacy.ts`) and runs on every outgoing payload.

## Testing

- Unit tests: `test/unit/` — pure logic, no external processes required
- Integration tests: `test/integration/` — currently test only in-process helpers (state, memory-protocol); no live Engram daemon needed
- Test framework: Vitest with `vitest/globals` types; no setup file required

## Source layout

```
src/
  index.ts              # extension entrypoint
  config.ts             # env-var loading → PiEngramConfig
  commands.ts           # pi commands: engram-status, engram-restart, engram-context, engram-save-summary
  engram/
    http-daemon.ts      # EngramHttpDaemon (HTTP API client + process manager)
    mcp-bridge.ts       # EngramMcpBridge (JSON-RPC stdio bridge to engram mcp)
    tool-registry.ts    # engramTools array with names, descriptions, scopes
    tool-schemas.ts     # TypeBox schemas for all mem_* tools
    tool-executor.ts    # dispatch mem_* calls through the bridge
    register-tools.ts   # iterates engramTools and calls pi.registerTool()
    memory-protocol.ts  # builds the Memory Protocol text injected into the system prompt
    passive-capture.ts  # passive observation extraction from tool output
    privacy.ts          # <private> redaction
    project.ts          # project detection from working directory
    session-id.ts       # session ID helpers
    state.ts            # PiEngramRuntimeState — mutable runtime bag
    status.ts           # status snapshot builder and formatter
    nudges.ts           # save nudge timer
  hooks/
    session-lifecycle.ts  # session_start / session_shutdown
    prompt-lifecycle.ts   # input hook — prompt capture + context injection
    tool-observer.ts      # tool_result hook — passive capture trigger
    compaction.ts         # session_before_compact hook — compaction summary
  summary/
    session-summary.ts    # builds the session summary from conversation branch
    compaction-summary.ts # builds the compaction summary
    shared.ts             # shared summary helpers
```

## Spec / planning

`openspec/` holds SDD (Spec-Driven Development) artifacts. `plan.md` is the original bootstrap plan. Neither is source code; changes to behavior should be reflected in `src/`.

## Known gotchas

- **No compile step**: `main` in `package.json` points at `src/index.ts`. The extension is not publishable to npm as-is; it relies on pi's TypeScript bundler.
- **`managedDaemon` is opt-in**: The extension will start `engram serve` if the daemon is not already running, but it will only SIGTERM that process on shutdown if `PI_ENGRAM_MANAGED_DAEMON=1`. Default is to leave the daemon running after pi exits.
- **MCP bridge is lazy**: `EngramMcpBridge.ensureReady()` is called on first tool use, not at session start. A cold call adds MCP init latency.
- **`npm run lint` is typecheck only**: There is no ESLint/Biome config. Linting means `tsc --noEmit`.
- **Vitest globals**: Types for `describe`, `it`, `expect` come from `vitest/globals` in `tsconfig.json`. Do not import them explicitly in test files.
