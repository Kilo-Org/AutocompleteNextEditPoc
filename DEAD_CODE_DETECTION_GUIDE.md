# Dead Code Detection Strategy

## Problem Analysis

The `getNonce()` function in [`core/vscode-test-harness/src/util/vscode.ts:9-16`](core/vscode-test-harness/src/util/vscode.ts:9) is not detected by knip even though the file IS being analyzed.

### Why Knip Misses It

**The Import Chain (knip IS analyzing this code):**

```
core/**/*.vitest.ts (entry point)
  → SelectionChangeManager.vitest.ts
    → VsCodeIde.ts
      → ideUtils.ts
        → vscode.ts ✓ (File IS analyzed!)
```

**But knip still doesn't catch `getNonce()` because:**

Knip has a **fundamental limitation**: it cannot detect **internal** (non-exported) unused functions within files that ARE imported.

In [`vscode.ts`](core/vscode-test-harness/src/util/vscode.ts:1), the file exports:

- ✅ `getExtensionUri()` - USED by other code
- ✅ `openEditorAndRevealRange()` - USED by ideUtils.ts
- ✅ `getUniqueId()` - USED by ideUtils.ts
- ❌ `getNonce()` - **NOT exported, NOT used** ← Knip can't detect this!

Since the file is imported (for the exported functions that ARE used), knip considers the entire file "in use" and doesn't analyze internal function usage.

## Knip's Capabilities and Limitations

### What Knip DOES Detect:

- ✅ Unused exported functions, classes, and variables
- ✅ Unused dependencies in package.json
- ✅ Unreachable files (not imported from any entry point)
- ✅ Unused exports from modules

### What Knip DOES NOT Detect:

- ❌ **Internal (non-exported) unused functions within imported files** ← Your issue
- ❌ Unused code within a function body
- ❌ Dead code after return statements
- ❌ Unreachable conditional branches

## The Solution: Multi-Tool Approach

To catch ALL types of dead code, you need complementary tools:

### 1. TypeScript Compiler with `noUnusedLocals` ⭐ **BEST FOR YOUR CASE**

**This will catch `getNonce()` immediately!**

Add to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "noUnusedLocals": true, // ✅ Catches getNonce() and similar
    "noUnusedParameters": true, // Catches unused function parameters
    "noUnusedPrivateMembers": true // TypeScript 5.0+ - unused private class members
  }
}
```

**Run:**

```bash
npm run typecheck
# or
tsc --noEmit
```

**What it detects:**

- ✅ Unused local variables
- ✅ Unused parameters
- ✅ **Unused internal functions** (like `getNonce()`)
- ✅ Unused private class members

This is the ONLY tool that will reliably catch internal unused functions.

### 2. Knip (For Unused Exports & Dependencies)

Your current [`knip.json`](knip.json:1) is already correctly configured:

```json
{
  "$schema": "https://unpkg.com/knip@latest/schema.json",
  "entry": [
    "core/autocomplete/CompletionProvider.ts",
    "core/nextEdit/NextEditProvider.ts",
    "core/**/*.vitest.ts" // ✅ This already covers VsCodeIde.ts via tests
  ],
  "ignoreDependencies": ["@types/*"],
  "ignore": ["**/__fixtures__/**", "**/__test-cases__/**"]
}
```

**No changes needed** - the test entry points already analyze VsCodeIde and its imports.

**Run:**

```bash
npx knip
```

**What it detects:**

- ✅ Unused exported functions, classes, types
- ✅ Unreachable files
- ✅ Unused dependencies
- ❌ Internal unused functions (not its purpose)

### 3. ESLint with `@typescript-eslint/no-unused-vars`

Add to `.eslintrc.shared.json`:

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

**Run:**

```bash
npm run lint
```

**What it detects:**

- Unused variables, functions, and parameters
- Real-time warnings during development

### 4. ts-prune (Alternative Export Checker)

**Install:**

```bash
npm install -D ts-prune
```

**Add to package.json:**

```json
{
  "scripts": {
    "deadcode:exports": "ts-prune"
  }
}
```

**What it detects:**

- All unused exports across the codebase
- Complementary to knip for export-focused analysis
- ❌ Cannot detect internal unused functions

## Recommended Workflow

### Immediate Action (Catches getNonce())

1. **Add TypeScript unused checks** to your existing tsconfig:

```json
{
  "compilerOptions": {
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

2. **Run typecheck**:

```bash
npm run typecheck
```

This will immediately flag `getNonce()` as unused!

### Daily Development

```bash
npm run lint          # ESLint catches unused vars/functions
npm run typecheck     # TypeScript catches unused locals
```

### Pre-commit Hooks

Your `.husky/pre-commit` should include:

```bash
#!/bin/sh
npm run lint
npm run typecheck
```

### Weekly/Monthly Maintenance

```bash
# Comprehensive dead code scan
npx knip                  # Unused exports & dependencies
npm run deadcode:exports  # ts-prune for exports (optional)
npm run typecheck         # TypeScript unused checks
```

## Tool Comparison

| Tool                              | Detects Internal Unused Functions | Best For                                        |
| --------------------------------- | --------------------------------- | ----------------------------------------------- |
| **TypeScript (`noUnusedLocals`)** | ✅ **YES**                        | Internal functions, local variables, parameters |
| **Knip**                          | ❌ No                             | Unused exports, dependencies, unreachable files |
| **ESLint**                        | ✅ Yes                            | Development-time warnings                       |
| **ts-prune**                      | ❌ No                             | Alternative to knip for exports                 |

## Summary

**Your knip configuration is already correct** - the test entry points ensure all code is analyzed. The issue is that **knip cannot detect internal unused functions by design**.

**The solution**: Use TypeScript's `noUnusedLocals` compiler option. This is the standard tool for catching internal unused code and will immediately flag `getNonce()` and similar functions.

### Quick Fix

```bash
# 1. Enable in tsconfig.json
{
  "compilerOptions": {
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}

# 2. Run typecheck
npm run typecheck

# 3. Fix all unused code warnings
```

This combination gives you complete dead code coverage:

- **Knip**: Unused exports and dependencies
- **TypeScript**: Internal unused functions (your case)
- **ESLint**: Real-time development warnings
