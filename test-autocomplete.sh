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
#echo "🧪 Running E2E autocomplete tests..."
#TEST_FILE='./e2e/_output/tests/Autocomplete.test.js' npm run e2e:quick

echo "✅ All autocomplete tests passed!"
