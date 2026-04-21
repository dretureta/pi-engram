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

if command -v pi >/dev/null 2>&1; then
  pi remove "$ROOT_DIR" >/dev/null 2>&1 || true
fi

mkdir -p "$PI_DIR"
cat > "$SHIM_FILE" <<EOF
export { default } from '$ROOT_DIR/src/index.ts'
EOF

echo "pi-engram installed via global auto-discovery shim from: $ROOT_DIR"
echo "Shim refreshed at: $SHIM_FILE"
echo "If pi is already open, restart it or run /reload."
