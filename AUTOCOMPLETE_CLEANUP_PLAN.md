# Autocomplete+nextEdit-Only Repository Cleanup Plan

This plan outlines the incremental removal of non-autocomplete code from the Continue repository, keeping only tab autocomplete and NextEdit functionality covered by tests.

## 🎯 Goal

Transform this repo into an autocomplete+nextEdit-only codebase that:

- Retains all tab autocomplete functionality tested by `test-autocomplete.sh`
- Retains NextEdit feature (has test coverage)
- Keeps necessary dependencies (LLM, config, utilities)
- Removes features without test coverage
- Works with VSCode extension only

## 📋 Procedure

IMPORTANT(1): After each step, verify with:

```bash
./test-autocomplete.sh
```

IMPORTANT(2): After each step in which tests pass, perform a git commit with a clear message.

Use many small steps; where it's reasonable, use multiple steps (i.e. subtasks) per phase. If something goes wrong, it's much easier to recover a small failing step than understand what's problematic in a larger failing step.

---

## Phase 1: Remove Top-Level Non-Autocomplete Directories

**Goal**: Remove entire directories that have no relation to autocomplete

### Step 1.1: Remove GUI and Other Extensions

```bash
git rm -rf gui/
git rm -rf extensions/intellij/
git rm -rf binary/
```

**Commit**: "Remove GUI, IntelliJ extension, and binary packaging"

### Step 1.2: Remove Development/Testing Helpers

```bash
git rm -rf manual-testing-sandbox/
git rm -rf eval/
git rm -rf actions/
```

**Commit**: "Remove manual testing sandbox, eval scripts, and GitHub actions"

### Step 1.3: Remove Sync and Documentation

```bash
git rm -rf sync/
git rm -rf docs/
```

**Keep**: README.md (will update later)
**Commit**: "Remove sync functionality and documentation"

### Step 1.4: Remove Media (Keep Only Essentials)

```bash
# Keep only essential icons for VSCode extension
mkdir -p media_backup
cp media/icon.png media_backup/ 2>/dev/null || true
git rm -rf media/
mkdir -p media
mv media_backup/icon.png media/ 2>/dev/null || true
rm -rf media_backup
```

**Commit**: "Remove non-essential media files"

**Verification**: Run `./test-autocomplete.sh` after each commit

---

## Phase 2: Clean Up Core Directory

**Goal**: Remove non-autocomplete features from core/ while keeping dependencies

### Step 2.1: Identify Core Dependencies

Autocomplete (`core/autocomplete/`) and NextEdit (`core/nextEdit/`) import from:

- `core/config/` - ConfigHandler (KEEP)
- `core/llm/` - LLM interfaces and implementations (KEEP)
- `core/indexing/` - ignore patterns, security (KEEP)
- `core/util/` - utilities (KEEP)
- `core/utils/` - markdown utilities (KEEP)
- `core/diff/` - diff utilities (KEEP)
- `core/data/` - logging (KEEP)
- `core/test/` - test fixtures (KEEP)
- `core/nextEdit/` - NextEdit feature (KEEP - has test coverage)

### Step 2.2: Remove Core Feature Directories

```bash
git rm -rf core/commands/
git rm -rf core/context/
git rm -rf core/edit/
git rm -rf core/codeRenderer/
git rm -rf core/continueServer/
git rm -rf core/control-plane/
git rm -rf core/deploy/
git rm -rf core/promptFiles/
git rm -rf core/tools/
```

**Commit**: "Remove non-autocomplete core features (keeping NextEdit)"

### Step 2.3: Clean Up Core Protocol

Review `core/protocol/` to see if any types are needed by autocomplete.
If only `core/protocol/core.ts` types are needed for autocomplete, keep it.
Otherwise, extract needed types to autocomplete and remove.

**Action**: Review imports, extract if needed, then:

```bash
# If not needed:
git rm -rf core/protocol/
```

**Commit**: "Remove protocol definitions (or extract needed types)"

### Step 2.4: Clean Up Core Root Files

Remove `core/core.ts` - this is the main orchestrator that autocomplete doesn't need directly.
Autocomplete uses `CompletionProvider` directly.

```bash
git rm core/core.ts
```

**Commit**: "Remove core orchestrator (not needed for autocomplete)"

### Step 2.5: Update core/package.json Dependencies

Remove dependencies not needed by autocomplete:

- Remove MCP-related packages
- Remove browser/GUI packages (puppeteer, jsdom, etc.)
- Remove Sentry if not used in autocomplete
- Keep: LLM providers, tree-sitter, core utilities

**Action**: Manual edit of `core/package.json`
**Commit**: "Clean up core dependencies for autocomplete+nextEdit-only"

**Verification**: Run `./test-autocomplete.sh` after each commit

---

## Phase 3: Clean Up VSCode Extension

**Goal**: Keep only autocomplete features in the VSCode extension

### Step 3.1: Identify Extension Dependencies

VSCode autocomplete needs:

- `extensions/vscode/src/autocomplete/` - autocomplete implementation (KEEP)
- `extensions/vscode/src/extension.ts` - entry point (MODIFY)
- `extensions/vscode/src/VsCodeIde.ts` - IDE interface (KEEP parts)
- Some utilities in `extensions/vscode/src/util/` (REVIEW)

### Step 3.2: Remove Non-Autocomplete Extension Features

```bash
git rm -rf extensions/vscode/src/apply/
git rm -rf extensions/vscode/src/debug/
git rm -rf extensions/vscode/src/diff/
git rm -rf extensions/vscode/src/quickEdit/
git rm -rf extensions/vscode/src/terminal/
git rm -rf extensions/vscode/src/stubs/
git rm -rf extensions/vscode/src/lang-server/
git rm -rf extensions/vscode/src/otherExtensions/
git rm extensions/vscode/src/ContinueGUIWebviewViewProvider.ts
git rm extensions/vscode/src/ContinueConsoleWebviewViewProvider.ts
```

**Commit**: "Remove non-autocomplete VSCode extension features"

### Step 3.3: Update extension.ts

Modify `extensions/vscode/src/extension.ts` to:

- Remove GUI webview initialization
- Remove command registrations except autocomplete-related
- Keep only autocomplete activation
- Remove console webview

**Action**: Manual edit
**Commit**: "Update extension.ts for autocomplete+nextEdit-only"

### Step 3.4: Update package.json Commands

Edit `extensions/vscode/package.json`:

- Remove non-autocomplete commands
- Keep autocomplete and NextEdit commands:
  - `continue.toggleTabAutocompleteEnabled`
  - `continue.forceAutocomplete`
  - `continue.toggleNextEditEnabled`
  - `continue.forceNextEdit`
  - `continue.nextEditWindow.*` commands
- Remove GUI views
- Remove keybindings for removed commands (except autocomplete/NextEdit)
- Clean up activation events

**Action**: Manual edit
**Commit**: "Update VSCode package.json for autocomplete+nextEdit-only"

### Step 3.5: Update extension/VsCodeExtension.ts

If this file exists and orchestrates features, update it to only handle autocomplete.

**Action**: Review and modify
**Commit**: "Update VsCodeExtension for autocomplete+nextEdit-only"

### Step 3.6: Clean Extension Scripts

Review `extensions/vscode/scripts/`:

- Keep build scripts (esbuild.js, prepackage.js, package.js)
- Remove e2e test scripts if they test non-autocomplete features

**Action**: Manual review and removal
**Commit**: "Clean up extension scripts"

**Verification**: Run `./test-autocomplete.sh`

---

## Phase 4: Clean Up Packages Directory

**Goal**: Keep only packages needed by autocomplete

### Step 4.1: Identify Required Packages

Review `packages/` and dependencies:

- `packages/llm-info/` - LIKELY KEEP (LLM information)
- `packages/config-yaml/` - REVIEW (config parsing)
- `packages/fetch/` - REVIEW (HTTP utilities)
- `packages/openai-adapters/` - REVIEW (OpenAI adapters)
- `packages/terminal-security/` - REMOVE (terminal only)
- `packages/continue-sdk/` - REVIEW (SDK)
- `packages/hub/` - REMOVE (hub integration)

### Step 4.2: Remove Unnecessary Packages

```bash
git rm -rf packages/terminal-security/
git rm -rf packages/hub/
# Add others as identified
```

**Commit**: "Remove non-autocomplete packages"

### Step 4.3: Update Package References

Update `core/package.json` to remove references to deleted packages.

**Action**: Manual edit
**Commit**: "Update package references"

**Verification**: Run `./test-autocomplete.sh`

---

## Phase 5: Update Build Configuration

**Goal**: Clean up build scripts and configs for autocomplete+nextEdit-only repo

### Step 5.1: Update Root package.json

Edit `package.json`:

- Remove GUI scripts (`tsc:watch:gui`)
- Remove binary scripts (`tsc:watch:binary`)
- Keep core and vscode scripts
- Update repository description

**Action**: Manual edit
**Commit**: "Update root package.json for autocomplete+nextEdit-only"

### Step 5.2: Update VSCode Build Scripts

Review `extensions/vscode/scripts/esbuild.js`:

- Ensure it doesn't reference GUI
- Remove GUI bundling

**Action**: Manual review and edit
**Commit**: "Update VSCode build scripts"

### Step 5.3: Clean Up Git Hooks

Review `.husky/` pre-commit hooks:

- Ensure they still work with reduced codebase

**Action**: Review
**Commit**: "Update git hooks if needed"

**Verification**: Run `./test-autocomplete.sh`

---

## Phase 6: Final Cleanup and Verification

**Goal**: Remove remaining cruft and verify everything works

### Step 6.1: Remove Unused Utilities

Scan `core/util/` and `core/utils/` for files not imported by autocomplete:

```bash
# This requires careful analysis of imports
# Create a script or manually check
```

**Action**: Analyze imports, remove unused
**Commit**: "Remove unused utilities"

### Step 6.2: Clean Up Indexing Code

Review `core/indexing/` - keep only what's needed:

- Keep: `ignore.js` (isSecurityConcern)
- Keep: `refreshIndex.js` (for autocomplete cache)
- Remove: Other indexing features if not used

**Action**: Review and remove
**Commit**: "Clean up indexing code"

### Step 6.3: Clean Up LLM Directory

Review `core/llm/`:

- Keep: LLM interfaces, provider implementations
- Keep: Token counting utilities
- Remove: Test mocks not used by autocomplete tests

**Action**: Review carefully
**Commit**: "Clean up LLM directory"

### Step 6.4: Update .gitignore and .continueignore

Update ignore files to reflect new structure.

**Action**: Manual edit
**Commit**: "Update ignore files"

### Step 6.5: Final Test Run

```bash
./test-autocomplete.sh
```

If passing, proceed. If failing, debug and fix.

### Step 6.6: Check for Dead Code

Use TypeScript compiler or a tool to find unused exports:

```bash
cd core && npx ts-prune
```

Remove any dead code found.

**Commit**: "Remove dead code"

**Verification**: Run `./test-autocomplete.sh` one final time

---

## Phase 7: Documentation

**Goal**: Document the new autocomplete+nextEdit-only repository

### Step 7.1: Create New README.md

Replace README.md with autocomplete-focused documentation:

- What this repo does (tab autocomplete for VSCode)
- How to build and test
- Architecture overview
- Contributing guidelines

**Action**: Write new README
**Commit**: "Add autocomplete+nextEdit-only README"

### Step 7.2: Add Architecture Documentation

Create `ARCHITECTURE.md` explaining:

- Autocomplete flow
- Key components (CompletionProvider, ContextRetrieval, etc.)
- How tests work
- Extension points

**Action**: Write architecture doc
**Commit**: "Add architecture documentation"

### Step 7.3: Update CONTRIBUTING.md

Update contribution guidelines for autocomplete+nextEdit-only focus.

**Action**: Update or create new file
**Commit**: "Update contributing guidelines"

---

## 🎯 Success Criteria

After all phases, the repository should:

1. ✅ Pass all tests in `test-autocomplete.sh`
2. ✅ Build successfully: `cd core && npm run build`
3. ✅ VSCode extension packages: `cd extensions/vscode && npm run package`
4. ✅ No broken imports or missing dependencies
5. ✅ Clear documentation of what remains
6. ✅ Significantly smaller repository size
7. ✅ Only autocomplete-related code and its dependencies

---

## 📊 Estimated Impact

**Directories to Remove**: ~15-20 top-level directories
**Core Features to Remove**: ~10 feature directories (excluding NextEdit)
**Expected Size Reduction**: 60-80% of codebase
**Test Coverage**: Autocomplete + NextEdit tests (both with coverage)

---

## ⚠️ Important Notes

1. **Never remove** `core/autocomplete/`, `core/nextEdit/`, or `extensions/vscode/src/autocomplete/`
2. **Always run tests** after each commit to catch breakage early
3. **Git commits** are your safety net - commit frequently
4. **Review imports** before deleting shared utilities (both autocomplete and NextEdit depend on them)

After each step, verify and commit. If tests fail, investigate before proceeding.
