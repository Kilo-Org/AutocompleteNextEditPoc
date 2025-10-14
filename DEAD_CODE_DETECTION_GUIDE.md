# Dead Code Detection Guide

This guide explains how to **FIND** unused/dead code in the codebase. The aim is to iteratively and in small steps delete dead code.
There's no need to find ALL dead code up front. Once you've identified any dead code dead code, delegate removal (in small batches) to a [`CODE_CLEANUP_INSTRUCTIONS.md`](CODE_CLEANUP_INSTRUCTIONS.md) following subtask to safely remove it.

## Quick Start: How to Find Dead Code

### Step 1: Find Unused Internal Code

Run these commands to find unused functions, variables, and parameters within files:

```bash
npm run typecheck  # TypeScript compiler reports unused locals
npm run lint       # ESLint reports same issues with real-time feedback
```

**Example output:**

```
core/vscode-test-harness/src/util/vscode.ts(9,16): error TS6133: 'getNonce' is declared but its value is never read.
```

This tells you:

- **File**: `core/vscode-test-harness/src/util/vscode.ts`
- **Line**: 9, Column 16
- **What's unused**: `getNonce` function
- **Action**: Can be safely removed (see CODE_CLEANUP_INSTRUCTIONS.md)

### Step 2: Find Unused Exports and Dependencies

Run this command to find unused exports, dependencies, and unreachable files:

```bash
npx knip  # Analyzes module graph for unused exports
```

Knip will list:

- Exported functions/classes/types that nothing imports
- Files not reachable from entry points
- Dependencies in package.json that aren't used

### Step 3: Remove Found Code Safely

Once you've identified unused code, follow [`CODE_CLEANUP_INSTRUCTIONS.md`](CODE_CLEANUP_INSTRUCTIONS.md) for the safe removal process.

---

## Detailed Workflows

### For Daily Development

Catch unused code as you work:

```bash
npm run lint          # Real-time in editor + command line
npm run typecheck     # Catches unused locals, functions, parameters
```

Both commands show warnings for unused code. Fix them before committing.

### For Systematic Cleanup

Find ALL dead code in the project:

```bash
# Step 1: Find unused internal code
npm run typecheck     # Lists all unused locals, functions, parameters
npm run lint          # Confirms same issues

# Step 2: Find unused exports and dependencies
npx knip              # Lists unused exports, unreachable files, unused dependencies
```

### For Weekly/Monthly Audits

Run a comprehensive scan:

```bash
npm run typecheck && npm run lint && npx knip
```

Review all warnings and create a list of removal candidates.

## Understanding Tool Output

### TypeCheck/Lint Warnings

**Format:**

```
<file>(<line>,<column>): error TS6133: '<name>' is declared but its value is never read.
```

**Meaning:**

- `'functionName' is declared but its value is never read` → Unused internal function
- `'variableName' is declared but its value is never read` → Unused local variable
- `'_paramName' is declared but its value is never read` → Unused parameter (prefixed with `_` to intentionally ignore)

**Examples:**

```
core/util/helpers.ts(42,10): error TS6133: 'formatData' is declared but its value is never read.
```

→ Function `formatData` at line 42 in `core/util/helpers.ts` is unused

```
core/autocomplete/util.ts(15,7): error TS6133: 'tempVar' is declared but its value is never read.
```

→ Variable `tempVar` at line 15 in `core/autocomplete/util.ts` is unused

### Knip Output

Knip groups results by category:

**Unused exports:**

```
Unused exports (2)
  core/util/helpers.ts
    - formatData
    - processItem
```

→ These exported functions aren't imported anywhere

**Unused files:**

```
Unused files (1)
  core/old-feature/handler.ts
```

→ This file isn't imported from any entry point

**Unused dependencies:**

```
Unused dependencies (1)
  package.json
    - old-library
```

→ This package.json dependency isn't used in code

## Tool Comparison

| Tool                    | Detects                                           | Command             | Best For                                                    |
| ----------------------- | ------------------------------------------------- | ------------------- | ----------------------------------------------------------- |
| **TypeScript Compiler** | Unused locals, functions, parameters within files | `npm run typecheck` | Internal unused code; Parameter usage; Local variables      |
| **ESLint**              | Unused variables, functions, parameters           | `npm run lint`      | Real-time editor feedback; Same detection as TypeScript     |
| **Knip**                | Unused exports, dependencies, unreachable files   | `npx knip`          | Module-level analysis; Unused exports; Package.json cleanup |

**Key Point:** These tools are complementary:

- **TypeScript/ESLint**: Internal code within files (what knip CAN'T detect)
- **Knip**: Module-level exports and dependencies (different scope)

Use ALL THREE for complete coverage.

## Why Knip Misses Internal Unused Functions

**Example Problem:**

In [`core/vscode-test-harness/src/util/vscode.ts`](core/vscode-test-harness/src/util/vscode.ts):

```typescript
// Exported - USED elsewhere
export function getExtensionUri() { ... }
export function getUniqueId() { ... }

// Internal - NOT USED anywhere
function getNonce() { ... }  // ← Knip doesn't detect this!
```

**Why:**

Knip analyzes the module graph: "Is this FILE imported?" Since the file IS imported (for the exported functions), knip considers it "in use" and doesn't analyze internal function usage.

**The Import Chain:**

```
core/**/*.vitest.ts (entry point)
  → VsCodeIde.ts
    → ideUtils.ts
      → vscode.ts ✓ (File IS analyzed by knip!)
        → getExtensionUri() ✓ (Used)
        → getUniqueId() ✓ (Used)
        → getNonce() ❌ (Knip can't detect internal unused functions)
```

**Solution:** Use TypeScript compiler or ESLint, which analyze function-level usage within files.

## What Each Tool Detects

### TypeScript Compiler (`noUnusedLocals`, `noUnusedParameters`)

**✅ DOES Detect:**

- Unused local variables
- Unused parameters
- **Unused internal functions** (like `getNonce()`)
- Unused private class members

**❌ DOES NOT Detect:**

- Unused exports (use Knip)
- Unused dependencies (use Knip)
- Dead code after return statements
- Unreachable conditional branches

### ESLint (`@typescript-eslint/no-unused-vars`)

**✅ DOES Detect:**

- Unused variables, functions, and parameters
- Real-time warnings during development
- Same as TypeScript compiler

**❌ DOES NOT Detect:**

- Unused exports (use Knip)
- Unused dependencies (use Knip)

**Configuration:**

Already configured in `.eslintrc.shared.json`:

```json
{
  "rules": {
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }
    ]
  }
}
```

### Knip

**✅ DOES Detect:**

- Unused exported functions, classes, types
- Unreachable files
- Unused dependencies in package.json
- Unused exports from modules

**❌ DOES NOT Detect:**

- Internal (non-exported) unused functions
- Unused local variables
- Unused parameters

**Configuration:**

Already configured in `knip.json`:

```json
{
  "$schema": "https://unpkg.com/knip@latest/schema.json",
  "entry": ["core/autocomplete/CompletionProvider.ts", "core/nextEdit/NextEditProvider.ts", "core/**/*.vitest.ts"],
  "ignoreDependencies": ["@types/*"],
  "ignore": ["**/__fixtures__/**", "**/__test-cases__/**"]
}
```

## Summary: Complete Dead Code Detection

**Use all three tools for comprehensive coverage:**

| What You Want to Find                           | Tool to Use         | Command                              |
| ----------------------------------------------- | ------------------- | ------------------------------------ |
| Unused internal functions, locals, parameters   | TypeScript + ESLint | `npm run typecheck` + `npm run lint` |
| Unused exports, dependencies, unreachable files | Knip                | `npx knip`                           |
| Everything                                      | All three           | Run all commands                     |

## Next Steps: Removing Dead Code

Once you've identified unused code with these tools, it should be removed.
Do so bit by bit; i.e. don't try to remove everything at once, but small chunks at a time,
so that unforeseen implicit usages can be granularly caught by trial and error. To remove dead code,
start a subprocess that follows [`CODE_CLEANUP_INSTRUCTIONS.md`](CODE_CLEANUP_INSTRUCTIONS.md)
That document explains:

- How to safely remove code without breaking tests
- How to handle cascading deletions (removing one thing makes others unused)
- How to verify removals are safe
- What to include in each removal (implementations, interfaces, types, helpers)
- How to commit removals properly

**The detection tools (this guide) tell you WHAT to remove. The cleanup instructions tell you HOW to remove it safely.**
