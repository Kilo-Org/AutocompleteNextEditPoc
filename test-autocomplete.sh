#!/bin/bash

pushd core
npm test -- autocomplete nextEdit vscode-test-harness
popd
