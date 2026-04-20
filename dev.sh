#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PI_DIR="${PI_DEV_EXTENSION_DIR:-$HOME/.pi/agent/extensions/pi-engram}"
SHIM_FILE="$PI_DIR/index.ts"

mkdir -p "$PI_DIR"
cat > "$SHIM_FILE" <<EOF
export { default } from '$ROOT_DIR/src/index.ts'
EOF

echo "pi-engram dev shim updated at: $SHIM_FILE"
echo "Run pi and then /reload if it is already open."
