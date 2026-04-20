#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PI_DIR="${PI_DIR:-$HOME/.pi/agent/extensions/pi-engram}"
SHIM_FILE="$PI_DIR/index.ts"

if ! command -v pi >/dev/null 2>&1; then
  echo "pi is required to install pi-engram." >&2
  exit 1
fi

# If the old dev shim points at this repository, remove it to avoid duplicate loads.
if [ -f "$SHIM_FILE" ] && grep -q "$ROOT_DIR/src/index.ts" "$SHIM_FILE" 2>/dev/null; then
  rm -rf "$PI_DIR"
fi

pi install "$ROOT_DIR"

echo "pi-engram installed as a pi package from: $ROOT_DIR"
echo "If you previously used the global shim, restart pi or run /reload."
