#!/bin/bash
set -e  # Exit on first error

pushd core 
echo "🧪 Running Core Vitest tests..."
npm run vitest -- autocomplete
popd

echo "🧪 Running VSCode unit tests..."
pushd extensions/vscode 
npm test
popd

echo "✅ All autocomplete tests passed!"
