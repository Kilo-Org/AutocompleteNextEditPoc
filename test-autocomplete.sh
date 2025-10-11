#!/bin/bash
set -e  # Exit on first error

pushd core
echo "🧪 Running Core Vitest tests (autocomplete & nextEdit)..."
npm test -- autocomplete nextEdit vscode-test-harness
popd

echo "✅ All autocomplete and NextEdit tests passed!"