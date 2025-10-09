#!/bin/bash
set -e  # Exit on first error

echo "🧪 Running Core Jest tests..."
cd core && npm test -- autocomplete

echo "🧪 Running Core Vitest tests..."
npm run vitest -- autocomplete

echo "🧪 Running VSCode unit tests..."
cd ../extensions/vscode && npm test

#echo "🧪 Running E2E autocomplete tests..."
#TEST_FILE='./e2e/_output/tests/Autocomplete.test.js' npm run e2e:quick

echo "✅ All autocomplete tests passed!"
