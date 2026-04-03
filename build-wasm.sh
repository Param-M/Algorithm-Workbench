#!/usr/bin/env bash
# build-wasm.sh — compiles Go → WebAssembly
set -e
echo "🔨 Building Go → WebAssembly..."
cd wasm
command -v go >/dev/null 2>&1 || { echo "❌  Go not found. Install from https://go.dev/dl/"; exit 1; }
echo "   Go $(go version)"
GOOS=js GOARCH=wasm go build -o ../public/engine.wasm main.go
echo "   ✓ engine.wasm ($(du -sh ../public/engine.wasm | cut -f1))"
GOROOT=$(go env GOROOT)
if [ -f "$GOROOT/misc/wasm/wasm_exec.js" ]; then
  cp "$GOROOT/misc/wasm/wasm_exec.js" ../public/wasm_exec.js
  echo "   ✓ wasm_exec.js"
fi
cd ..
echo "✅  Done. Run: npm run dev"
