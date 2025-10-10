#!/bin/bash
set -e  # Exit on first error

pushd core
echo "🧪 Running Core Vitest tests (autocomplete & nextEdit)..."
npm run vitest -- autocomplete nextEdit
popd

echo "🧪 Running VSCode Integration tests (new location)..."
pushd core/vscode-test-harness
npm test
popd

echo "✅ All autocomplete and NextEdit tests passed!"