# pi-engram

`pi-engram` is a pi extension that integrates [Engram](https://github.com/Gentleman-Programming/engram) persistent memory into pi.

## What it does

- exposes Engram memory operations as native pi tools
- uses pi lifecycle hooks to manage Engram sessions automatically
- injects Engram’s Memory Protocol into the active system prompt
- preserves useful session context across compaction and shutdown
- redacts `<private>...</private>` content before persistence
- adds status and recovery commands for manual control

## Status

This project is under active implementation.

## Compatibility

- Requires pi 0.69.0 or newer.
- Uses TypeBox 1.x via the `typebox` package.
- The extension is kept current with the latest pi hook and SDK changes as they land.

## Package install

This repository is a pi extension that is loaded through the global auto-discovery shim in `~/.pi/agent/extensions/pi-engram/`.

The recommended install flow is:

```bash
./install.sh
```

That will refresh the global shim and remove any conflicting package registration for this repo.

For development-only reloads, use:

```bash
./dev.sh
```

For quick local development you can still use the one-off extension loader:

```bash
pi -e ./src/index.ts
```

### Helper scripts

- `./install.sh` — refresh the global auto-discovery shim and clear conflicting package registration
- `./dev.sh` — create/update only the local auto-discovery shim in `~/.pi/agent/extensions/pi-engram/`
- `./uninstall.sh` — remove any package entry and clean up the dev shim

## Requirements

- pi 0.69.0 or newer
- the `engram` binary available on your PATH, or configured via environment variables
- a local Engram data directory

## Environment variables

- `ENGRAM_BIN` — path to the Engram binary, default: `engram`
- `ENGRAM_PORT` — local HTTP port, default: `7437`
- `ENGRAM_MCP_ARGS` — extra arguments for the MCP server
- `PI_ENGRAM_SUMMARY_MODEL` — optional model override for summaries
- `PI_ENGRAM_DISABLE_PASSIVE_CAPTURE` — set to `1` to disable passive capture
- `PI_ENGRAM_DISABLE_PROMPT_CAPTURE` — set to `1` to disable prompt capture
- `PI_ENGRAM_MANAGED_DAEMON` — set to `1` to allow the extension to stop a daemon it started

## Planned layout

- `src/` — extension code
- `openspec/` — proposal, design, and tasks for the change
- `plan.md` — implementation plan used to bootstrap the work

## Notes

Engram already provides:

- an HTTP API
- an MCP server
- CLI commands for memory search and session management

`pi-engram` adapts those capabilities into pi’s extension system so they work through pi hooks and native tools.
