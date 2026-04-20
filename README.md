# pi-engram

`pi-engram` is a planned pi extension that integrates [Engram](https://github.com/Gentleman-Programming/engram) with pi.

## Goal

The extension will add Engram-backed persistent memory to pi by:

- exposing Engram memory actions as native pi tools
- using pi lifecycle hooks to manage sessions automatically
- injecting Engram’s Memory Protocol into the active prompt
- preserving useful session context across compaction and shutdown
- redacting `<private>...</private>` content before persistence

## Status

This repository is in early setup. The implementation has not started yet.

## Planned structure

- `openspec/` — proposal, design, and implementation tasks
- `plan.md` — implementation plan for the extension

## Notes

Engram runs as a local service and provides:

- an HTTP API
- an MCP server
- CLI utilities for memory search and session management

`pi-engram` will adapt those capabilities into pi’s extension system.
