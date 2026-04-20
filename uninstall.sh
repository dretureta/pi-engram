#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PI_DIR="${PI_DEV_EXTENSION_DIR:-$HOME/.pi/agent/extensions/pi-engram}"
SHIM_FILE="$PI_DIR/index.ts"

if command -v pi >/dev/null 2>&1; then
  pi remove "$ROOT_DIR" >/dev/null 2>&1 || true
fi

if [ -f "$SHIM_FILE" ] && grep -q "$ROOT_DIR/src/index.ts" "$SHIM_FILE" 2>/dev/null; then
  rm -rf "$PI_DIR"
fi

echo "pi-engram uninstalled from pi settings (if present)"
echo "Removed dev shim if it pointed at this repository"
