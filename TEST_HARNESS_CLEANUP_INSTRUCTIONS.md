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

2. **Test Removal**
   - Remove or comment out the suspicious code
   - Run `npm run typecheck` to check for type errors
   - Run `npm test` to verify tests still pass
   - If there are compilation errors, make minimal cleanup to fix them (remove unused imports, etc.)

3. **Determine if Removal is Safe**
   - If typecheck AND tests pass: the code can be removed safely
   - If either fails: the code is necessary, restore it

4. **Take Action**
   - **If removal is safe**: 
     - Clean up any resulting unused imports or variables
     - Create a git commit with message: `Remove unnecessary {feature-name} from test harness`
     - Use attempt_completion with result describing what was removed and why it's safe
   
   - **If removal breaks things**:
     - Reset/restore the changes (git checkout or revert edits)
     - Use attempt_completion with result explaining why the code is necessary

5. **Report Results**
   - Always use attempt_completion to report whether:
     - Code was successfully removed (include commit sha)
     - Code is necessary and was kept (explain why)

## Important Notes

- Only remove code that is NOT related to autocomplete, NextEdit, or tree-sitter
- Each removal should be a separate, atomic commit
- Always verify with both typecheck and tests before committing
- Keep changes minimal - only remove what's specified
- If unsure, keep the code (better to have unnecessary code than break functionality)

## Context
The goal is to strip down the test harness to only what's needed for realistic testing of autocomplete/NextEdit/tree-sitter functionality. Features like session sharing, webview messaging about unrelated topics, and other VS Code extension features that don't support the core testing purpose should be removed.