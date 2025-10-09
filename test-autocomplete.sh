#!/bin/bash
set -e  # Exit on first error

pushd core 
echo "🧪 Running Core Vitest tests..."
npm run vitest -- autocomplete
echo "🧪 Running NextEdit Vitest tests..."
npm run vitest -- nextEdit
popd

echo "🧪 Running VSCode unit tests..."
pushd extensions/vscode 
npm test
popd

echo "✅ All autocomplete and NextEdit tests passed!"