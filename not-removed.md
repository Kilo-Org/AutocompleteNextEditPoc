# Files and Dependencies That Cannot Be Removed

This file documents items flagged by knip as unused but are actually required.

## Test Fixtures
The following test fixture files are required by RootPathContextService tests:
- `core/autocomplete/context/root-path-context/__fixtures__/files/typescript/arrowFunctions.ts` - Used by arrow_function tests
- `core/autocomplete/context/root-path-context/__fixtures__/files/typescript/classes.ts` - Used by class_declaration tests  
- `core/autocomplete/context/root-path-context/__fixtures__/files/typescript/classMethods.ts` - Used by method_declaration tests
- `core/autocomplete/context/root-path-context/__fixtures__/files/typescript/functions.ts` - Used by function_declaration tests
- `core/autocomplete/context/root-path-context/__fixtures__/files/typescript/generators.ts` - Used by generator function tests

These files are loaded at runtime by tests and not directly imported in TypeScript code.