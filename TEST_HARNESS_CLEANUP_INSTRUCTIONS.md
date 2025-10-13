# Test Harness Cleanup Instructions

## Objective
Review and remove unnecessary code from the vscode-test-harness that isn't essential for testing autocomplete, NextEdit, and tree-sitter functionality.

## Process for Each Subtask

You will be given a specific code location (file path and line numbers) containing a method call, registration, or feature that is suspected to be unnecessary.

### Steps to Follow:

1. **Analyze the Code**
   - Read the target file and understand what the code does
   - Check if it's directly related to autocomplete, NextEdit, or tree-sitter
   - Trace dependencies to see what depends on this code

2. **Test Removal (Be Thorough!)**
   - Remove or comment out the suspicious code
   - **Look for cascading deletions** - see "Scope of Thorough Removal" section below
   - Run `npm run typecheck` to check for type errors
   - Run `npm test` to verify tests still pass
   - If there are compilation errors, make minimal cleanup to fix them (remove unused imports, etc.)

3. **Determine if Removal is Safe**
   - If typecheck AND tests pass: the code can be removed safely
   - If either fails: the code is necessary, restore it

4. **Take Action**
   - **If removal is safe**:
     - Clean up any resulting unused imports, type imports, and variables
     - **Double-check for any remaining unused code** (see "Scope of Thorough Removal" below)
     - Create a git commit with message: `Remove unnecessary {feature-name} from test harness`
     - Use attempt_completion with result describing what was removed and why it's safe
   
   - **If removal breaks things**:
     - Reset/restore the changes (git checkout or revert edits)
     - Use attempt_completion with result explaining why the code is necessary

5. **Report Results**
   - Always use attempt_completion to report whether:
     - Code was successfully removed (include commit sha)
     - Code is necessary and was kept (explain why)

## Scope of Thorough Removal

**Being thorough is valued and encouraged!** When removing a feature, don't just remove the obvious implementation - look for all related code that becomes unused. The goal is maximum cleanup while maintaining test coverage.

### What to Remove

When you remove a feature or method, you should look for and remove:

1. **The Implementation**
   - Method implementation in [`VsCodeIde.ts`](core/vscode-test-harness/src/VsCodeIde.ts)
   - Any other classes implementing the same interface (e.g., [`FileSystemIde`](core/util/filesystem.ts))

2. **Interface Declarations**
   - Method declaration in the IDE interface in [`core/index.d.ts`](core/index.d.ts)
   - This is critical - if you remove an implementation, remove the interface method too!

3. **Type Definitions and Exports**
   - Custom type definitions used only by the removed feature
   - Type exports from modules
   - Enum definitions that are no longer referenced
   - Interface definitions used only by the removed feature

4. **Helper Functions and Utilities**
   - Helper functions used exclusively by the removed feature
   - Utility functions that have no remaining callers
   - Private methods that supported the removed functionality

5. **Imports and Dependencies**
   - Regular imports that are no longer used
   - Type-only imports (`import type`) that are no longer needed
   - Re-exports of unused types

6. **Cascading Deletions**
   - After removing a feature, check what else becomes unused
   - Run typecheck and look for "unused" warnings
   - A removal often enables further cleanup opportunities

### Removal Checklist

When removing a feature, systematically check:

- [ ] Implementation removed from [`VsCodeIde.ts`](core/vscode-test-harness/src/VsCodeIde.ts)
- [ ] Implementation removed from [`FileSystemIde`](core/util/filesystem.ts) (if applicable)
- [ ] Interface method removed from [`core/index.d.ts`](core/index.d.ts)
- [ ] Type definitions removed (if unused)
- [ ] Helper functions removed (if no longer called)
- [ ] Imports cleaned up (both regular and type imports)
- [ ] No compilation errors (`npm run typecheck`)
- [ ] All tests pass (`npm test`)

### Examples of Thorough Removal

**Example 1: Removing a Handler Method**

When removing `subprocess` handler:
- ✅ Remove `subprocess()` implementation from [`VsCodeIde.ts`](core/vscode-test-harness/src/VsCodeIde.ts)
- ✅ Remove `subprocess()` method from IDE interface in [`core/index.d.ts`](core/index.d.ts)
- ✅ Remove `subprocess()` implementation from [`FileSystemIde`](core/util/filesystem.ts)
- ✅ Remove any `SubprocessOptions` type if it's no longer used
- ✅ Remove helper functions like `executeSubprocess()` if they exist and are unused
- ✅ Remove imports related to subprocess functionality

**Example 2: Removing a Feature with Types**

When removing a feature that has custom types:
- ✅ Remove the feature implementation
- ✅ Remove the interface method declaration
- ✅ Remove the type definition (e.g., `interface FeatureConfig { ... }`)
- ✅ Remove type exports (e.g., `export type { FeatureConfig }`)
- ✅ Check for and remove any utility types used only by this feature
- ✅ Remove enum definitions if they're only used by this feature

**Example 3: Finding Cascading Deletions**

After removing a primary feature:
1. Run `npm run typecheck` - look for unused variable/import warnings
2. Search for helper functions that may now be unused
3. Check if removing the feature made any utility modules completely unused
4. Remove any configuration types that are no longer referenced

### Key Principle

**Think in layers:** A feature is often more than just one method - it's an implementation + interface declaration + types + helpers + imports. Be thorough in identifying all layers and removing them together.

## Important Notes

- Only remove code that is NOT related to autocomplete, NextEdit, or tree-sitter
- Each removal should be a separate, atomic commit (but should include ALL related deletions)
- Always verify with both typecheck and tests before committing
- **Be thorough** - remove all related code, not just the obvious parts
- If unsure whether something is used, keep it (better to have unnecessary code than break functionality)
- But if you're confident after checking, be aggressive in cleanup!

## Context
The goal is to strip down the test harness to only what's needed for realistic testing of autocomplete/NextEdit/tree-sitter functionality. Features like session sharing, webview messaging about unrelated topics, and other VS Code extension features that don't support the core testing purpose should be removed. When removing these features, remove them completely - implementations, interfaces, types, and helpers.