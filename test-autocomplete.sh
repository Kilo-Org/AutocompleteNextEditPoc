#!/bin/bash

pushd core
npm test -- autocomplete nextEdit vscode-test-harness diff llm/autodetect indexing/ignore util/LruCache
popd
