# Code Cleanup Instructions

## Objective

Safely remove unnecessary code that isn't essential for running or testing autocomplete, NextEdit, and tree-sitter functionality.

## Prerequisites

You have found dead code. These instructions assume you have already found dead code, e.g. by following [`DEAD_CODE_DETECTION_GUIDE.md`](DEAD_CODE_DETECTION_GUIDE.md). This document does not describe how to find it; just how to remove it CLEANLY.

---

## Process for Each Removal

You will be given a specific code location (file path and line numbers) containing a method, function, or feature that is confirmed to be unnecessary.

### Steps to Follow:

#### 1. Analyze the Code

- Read the target file and understand what the code does
- Check if it's directly related to autocomplete, NextEdit, or tree-sitter
- Trace dependencies to see what depends on this code
- If unsure whether it's used, keep it (better safe than broken)

#### 2. Establish Baseline

**Before making ANY changes:**

```bash
npm run typecheck    # Note the warning/error count
npm run lint         # Note the warning/error count
```

Write down these counts. Your removal must NOT increase them.

#### 3. Remove the Code

- Remove or comment out the target code
- **Look for cascading deletions** - see "Scope of Thorough Removal" section below

#### 4. Verify Safety

Run verification commands:

```bash
npm run typecheck    # Must NOT increase warnings/errors
npm run lint         # Must NOT increase warnings/errors
npm test             # Must pass
```

**A removal is safe if ALL of these conditions are met:**

- ✅ Tests pass (`npm test`), and all tests are present (40 files, 772 tests)
- ✅ Typecheck warnings/errors did NOT increase (stayed same or decreased)
- ✅ ESLint warnings/errors did NOT increase (stayed same or decreased)

**If typecheck or lint warnings increased:**

- NEW unused code warnings appeared (good - they point to cascading deletions)
- Remove the newly unused code too (preferred approach)
- OR revert your change if the newly unused code is actually needed

**If typecheck errors appeared:**

- The code is actually used somewhere
- Restore the removed code immediately

**If tests fail:**

- The code is necessary for functionality
- Restore the removed code immediately

#### 5. Clean Up Cascading Deletions

After the initial removal, check what else became unused:

```bash
npm run typecheck    # Look for NEW unused warnings
npm run lint         # Look for NEW unused warnings
```

Remove each newly unused item and repeat until no new warnings appear. This is the natural cleanup cascade.

**Example:**

```
Initial removal → typecheck shows helper function Y is now unused
Remove helper Y → typecheck shows type Z is now unused
Remove type Z → typecheck shows no new warnings ✅ Done!
```

#### 6. Final Verification

Before committing, run the full suite:

```bash
npm run typecheck    # No increase in warnings/errors
npm run lint         # No increase in warnings/errors
npm test             # All tests pass
```

If any fail, restore changes and investigate.

#### 7. Commit

Create a git commit with a message describing:

- What was removed
- Why it's safe to remove
- Any caveats or concerns
- What cascading deletions were included

#### 8. Report Results

Use attempt_completion to report:

- **Success**: What was removed, commit SHA, why it's safe
- **Failure**: Why the code is necessary and was kept

---

## Scope of Thorough Removal

**Being thorough is valued!** When removing a feature, don't just remove the obvious implementation - remove ALL related code that becomes unused.

### What to Remove

When you remove a feature or method, systematically look for and remove:

#### 1. The Implementation

- Method implementation
- Any other classes implementing the same interface (situational)

#### 2. Interface Declarations

- Method declaration in interface (e.g., IDE in [`core/index.d.ts`](core/index.d.ts))

#### 3. Type Definitions and Exports

- Custom type definitions used only by the removed feature
- Type exports from modules
- Enum definitions that are no longer referenced
- Interface definitions used only by the removed feature

#### 4. Helper Functions and Utilities

- Helper functions used exclusively by the removed feature
- Utility functions that have no remaining callers
- Private methods that supported the removed functionality

#### 5. Imports and Dependencies

- Regular imports that are no longer used
- Type-only imports (`import type`) that are no longer needed
- Re-exports of unused types

#### 6. Cascading Deletions

Use `npm run typecheck` and `npm run lint` as your discovery tools:

- Run after the initial removal
- Look for NEW warnings: `'helperFunction' is declared but its value is never read`
- These warnings point directly to cascading deletions
- Remove each newly unused item
- Repeat until no new warnings appear

**The process:**

```
Remove feature X
  → typecheck/lint shows helper function Y is now unused
  → Remove helper Y
    → typecheck/lint shows type definition Z is now unused
    → Remove type Z
      → typecheck/lint shows no new unused warnings ✅
```

### Removal Checklist

Systematically verify:

- [ ] Imports cleaned up (both regular and type imports)
- [ ] If you changes package.json: `npm install`
- [ ] `npm run typecheck` - no increase in warnings/errors
- [ ] `npm run lint` - no increase in warnings/errors
- [ ] `npm test` - all tests pass (40 files, 772 tests)
- [ ] Check typecheck/lint output for NEW unused warnings OTHER than newly unused code.
- [ ] Remove cascading unused code if warnings appeared
- [ ] Repeat check until no new warnings

### Key Principles

**Think in layers:** A feature is often more than just one method - it's an implementation + interface declaration + types + helpers + imports. Be thorough in identifying all layers and removing them together. On the other hand, when in doubt; it's nevertheless better to leave behind leftovers for a later iteration of removal than to break code.

**Use typecheck & lint as your guide:** Don't guess what's unused - let `npm run typecheck` and `npm run lint` tell you definitively what became unused after each removal.

**One removal at a time:** Complete the entire cascade for one feature before moving to the next.

---

## Safety Guidelines

### Do Remove

- Code unrelated to autocomplete, NextEdit, or tree-sitter
- All cascading unused code in the same commit
- Unused imports and type imports

### Do NOT Remove

- Code part of autocomplete, NextEdit, or tree-sitter
- Code directly supporting autocomplete, NextEdit, or tree-sitter
- Code when removal causes test failures
- Code when that removal causes typecheck errors to appear (other than other newly unused code).

### When in Doubt

- Keep it (better unnecessary code than broken functionality)
- But if confident after checking, be aggressive in cleanup

### Commit Guidelines

- Each removal = separate atomic commit
- Include ALL cascading deletions in the same commit as long as that's safe to do.
- Clear commit message describing what was removed (e.g. what you think the code did) and why it's unrelated to autocomplete, NextEdit, or tree-sitter

### When something unexpected happens

IMPORTANT: If any of the safety verification fails in a way you cannot easily solve, restore the code (e.g. via git reset) and report failure to the parent task.

---

## Context

The goal is to strip down the project to only what's needed for realistic usage and testing of autocomplete/NextEdit/tree-sitter functionality.

Features like session sharing, webview messaging about unrelated topics, and other VS Code extension features that don't support the core purpose should be removed completely - implementations, interfaces, types, and helpers.
