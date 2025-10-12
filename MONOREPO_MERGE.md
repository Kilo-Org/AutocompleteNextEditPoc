# Monorepo Merge Summary — Final Phase 8

## Overview

The repository is now a truly flat monorepo with a single package manifest at the root. All runtime and dev dependencies are consolidated in [package.json](package.json). Child package.json and package-lock.json files were removed. All code locations are unchanged; only package structure and configuration were simplified.

## Phase History

- Phase 1: Baseline (commit 7fcb7f48) — Established baseline with all tests passing.
- Phase 2: Configuration Alignment (commit d660df92) — Shared ESLint config, upgraded TypeScript tooling versions.
- Phase 3: Tree-sitter Consolidation (commit cfa5686c) — Moved tag queries to [tree-sitter/tag-queries](tree-sitter/tag-queries).
- Phase 4: Dependency Consolidation (commit e81f8320) — Hoisted shared devDependencies to root.
- Phase 5: Script Consolidation (commit 1d335e91) — Unified npm scripts at root.
- Phase 6: TypeScript Project References (commit da7c26e8) — Enabled project references and incremental builds.
- Phase 7: Single package.json (commit <finalize-packages>) — Merged all package manifests into root [package.json](package.json); removed package.json files from core and harness.
- Phase 8: Final tsconfig consolidation (this commit) — Minimal tsconfig set retained; documentation finalized.

## Final tsconfig structure

The minimal set kept to support development, typechecking, incremental builds, and harness tests:

- Root workspace: [tsconfig.json](tsconfig.json) — contains only project references to:
  - [core/](core) (core dev/test)
  - [core/vscode-test-harness/tsconfig.json](core/vscode-test-harness/tsconfig.json) (harness)
- Core (development/test): [core/tsconfig.json](core/tsconfig.json)
  - Strict settings, noEmit, composite/incremental for IDE speed and tsc --build graph.
- VS Code Test Harness: [core/vscode-test-harness/tsconfig.json](core/vscode-test-harness/tsconfig.json)
  - Extends core dev config; uses path mappings to consume core types.

## Rationale

- Production build configuration was intentionally removed to enable a ground-up redesign of the build/publish process.
- A single root tsconfig without project references would lose incremental, multi-project correctness. Keeping a tiny root with references preserves tsc --build and editor navigation.
- The harness remains an isolated project with its own [tsconfig.json](core/vscode-test-harness/tsconfig.json) due to its VS Code type environment.

## Developer workflow (root)

- Install: npm install
- Typecheck: npm run typecheck
- Test (all): npm test
- Incremental typecheck/build graph: npx tsc --build
- Lint: npm run lint
- Format: npm run format

## File layout (key items)

- [package.json](package.json) — single manifest with all dependencies and scripts
- [tsconfig.json](tsconfig.json) — root references
- [core/](core)
  - [tsconfig.json](core/tsconfig.json) — dev/test
  - [vscode-test-harness/](core/vscode-test-harness)
    - [tsconfig.json](core/vscode-test-harness/tsconfig.json)
- [tree-sitter/tag-queries/](tree-sitter/tag-queries) — consolidated tag queries

## Verification

The flat structure is validated end-to-end:
- TypeScript compilation: npm run typecheck and npx tsc --build both succeed.
- Tests: npm test — 707 tests passing (621 core + 86 harness).
- Editor support: project references provide correct navigation and incremental checking.

## Notes

- Only configuration changed; source code and directory locations are unchanged.
- Autocomplete and NextEdit functionality fully preserved.
- Tree-sitter configuration working under [tree-sitter/](tree-sitter).
- The repository now has a single [package.json](package.json) and a single lockfile at the root.

## Change log (Phase 8)

- Removed [core/tsconfig.npm.json](core/tsconfig.npm.json) and all references to it.
- Updated [tsconfig.json](tsconfig.json) to reference [core/](core) and [core/vscode-test-harness/tsconfig.json](core/vscode-test-harness/tsconfig.json) directly.
- Updated documentation to reflect the simplified, development-only TypeScript setup.