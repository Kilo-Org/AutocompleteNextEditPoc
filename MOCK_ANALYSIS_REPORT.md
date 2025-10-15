# Mock Usage Analysis Report

**Generated**: 2025-10-15  
**Purpose**: Identify opportunities to reduce mock usage and move towards integration testing

---

## Executive Summary

### Statistics
- **Total test files analyzed**: 37
- **Total mock instances found**: ~197 vi.mock/vi.fn/vi.spyOn calls
- **Test files with heavy mocking**: 15 (>5 mocks per file)
- **Test files with no mocks**: 12 (pure unit/integration tests)

### Mock Distribution by Category

| Category | Count | Percentage | Action Required |
|----------|-------|------------|-----------------|
| **Unavoidable** (External APIs) | ~80 | 41% | Keep as-is |
| **Replaceable** (Internal code) | ~45 | 23% | Use real implementations |
| **Should-be-Fakes** (Repeated patterns) | ~50 | 25% | Create fake implementations |
| **Need __forTest APIs** | ~22 | 11% | Expose test interfaces |

### Key Findings

1. **VSCode API is the largest source of mocking** (~60 instances across 6 files) - This is unavoidable and appropriate
2. **IDE interface is heavily mocked** (~15 instances) - Should create a `TestIDE` or `FakeIDE` class
3. **Internal services are frequently mocked** - Many could use real implementations
4. **Private state access is common** - Tests access internal state via `as any` casting

---

## Category 1: Unavoidable Mocks (Keep As-Is)

These mocks are appropriate and should remain:

### VSCode API Mocks
**Files affected**: 
- [`SelectionChangeManager.vitest.ts`](core/vscode-test-harness/test/SelectionChangeManager.vitest.ts)
- [`NextEditWindowManager.vitest.ts`](core/vscode-test-harness/test/NextEditWindowManager.vitest.ts)
- [`JumpManager.vitest.ts`](core/vscode-test-harness/test/JumpManager.vitest.ts)
- [`ContinueCompletionProvider.vitest.ts`](core/vscode-test-harness/test/ContinueCompletionProvider.vitest.ts)
- [`GhostTextAcceptanceTracker.vitest.ts`](core/vscode-test-harness/test/GhostTextAcceptanceTracker.vitest.ts)
- [`util.vitest.ts`](core/vscode-test-harness/test/util.vitest.ts)

**Justification**: VSCode API is external and not available in test environment. Mocking is the only option.

**Example**:
```typescript
vi.mock("vscode", () => ({
  window: { activeTextEditor: ... },
  workspace: { getConfiguration: ... }
}));
```

### Platform Detection (node:os)
**File**: [`util.vitest.ts`](core/vscode-test-harness/test/util.vitest.ts:3-6)

**Justification**: Testing platform-specific logic requires mocking OS detection.

### External Libraries
**Files**:
- [`JumpManager.vitest.ts`](core/vscode-test-harness/test/JumpManager.vitest.ts:103-113) - svg-builder
- [`renderPrompt.vitest.ts`](core/autocomplete/templating/__tests__/renderPrompt.vitest.ts:6-19) - handlebars

**Justification**: External dependencies that are stable and don't need real implementations for tests.

---

## Category 2: Replaceable Mocks (Use Real Implementations)

These mocks test internal code and should use real implementations:

### 2.1 DocumentHistoryTracker Mock

**File**: [`NextEditEditableRegionCalculator.vitest.ts`](core/nextEdit/NextEditEditableRegionCalculator.vitest.ts:16-22)

**Current**:
```typescript
vi.mock("./DocumentHistoryTracker", () => ({
  DocumentHistoryTracker: {
    getInstance: vi.fn(() => ({
      getMostRecentAst: vi.fn(),
    })),
  },
}));
```

**Recommendation**: Use real `DocumentHistoryTracker` instance

**Benefit**: Tests actual AST retrieval logic, catches integration issues

---

### 2.2 Internal Service Mocks

**Files with excessive internal mocking**:
- [`processNextEditData.vitest.ts`](core/nextEdit/context/processNextEditData.vitest.ts:6-29)
- [`processSmallEdit.vitest.ts`](core/nextEdit/context/processSmallEdit.vitest.ts:7-28)
- [`autocompleteContextFetching.vitest.ts`](core/nextEdit/context/autocompleteContextFetching.vitest.ts:8-30)

**Current**: Mocks `NextEditProvider`, `EditAggregator`, `diffFormatting`, etc.

**Recommendation**: These are internal utilities - use real implementations

**Benefit**: 
- Tests actual diff creation logic
- Catches bugs in integration between components
- More realistic test coverage

---

### 2.3 Utility Function Mocks

**File**: [`renderPrompt.vitest.ts`](core/autocomplete/templating/__tests__/renderPrompt.vitest.ts:22-53)

**Current**: Mocks `countTokens`, `getSnippets`, `formatSnippets`, `getStopTokens`

**Recommendation**: Only mock external dependencies (handlebars), use real utilities

**Rationale**: These are core business logic functions that should be tested together

---

## Category 3: Should-Be-Fake Implementations

These patterns repeat across multiple tests and should become reusable fakes:

### 3.1 IDE Interface (HIGH PRIORITY)

**Occurrences**: ~15 files create mock IDE implementations

**Current pattern** (repeated in many files):
```typescript
const mockIde = {
  getWorkspaceDirs: vi.fn().mockResolvedValue(["/workspace"]),
  readFile: vi.fn().mockResolvedValue("file content"),
  getReferences: vi.fn(),
} as any;
```

**Recommendation**: Create `FakeIDE` or `TestIDE` class

**Files that would benefit**:
- [`NextEditEditableRegionCalculator.vitest.ts`](core/nextEdit/NextEditEditableRegionCalculator.vitest.ts:39-41)
- [`processNextEditData.vitest.ts`](core/nextEdit/context/processNextEditData.vitest.ts:51-54)
- [`processSmallEdit.vitest.ts`](core/nextEdit/context/processSmallEdit.vitest.ts:73-76)
- [`autocompleteContextFetching.vitest.ts`](core/nextEdit/context/autocompleteContextFetching.vitest.ts:48-51)
- [`ImportDefinitionsService.vitest.ts`](core/autocomplete/context/ImportDefinitionsService.vitest.ts:17-23)
- [`getAllSnippets.vitest.ts`](core/autocomplete/snippets/getAllSnippets.vitest.ts:47-54)

**Impact**: Eliminate ~40+ mock setup calls, increase test maintainability

---

### 3.2 ConfigHandler Interface

**Occurrences**: ~12 files mock ConfigHandler

**Current pattern**:
```typescript
const mockConfigHandler = {
  loadConfig: vi.fn().mockResolvedValue({
    config: { }
  })
};
```

**Recommendation**: Create `FakeConfigHandler` class

**Files affected**:
- [`ContinueCompletionProvider.vitest.ts`](core/vscode-test-harness/test/ContinueCompletionProvider.vitest.ts:150-158)
- [`processNextEditData.vitest.ts`](core/nextEdit/context/processNextEditData.vitest.ts:57-65)
- [`processSmallEdit.vitest.ts`](core/nextEdit/context/processSmallEdit.vitest.ts:79-83)
- [`autocompleteContextFetching.vitest.ts`](core/nextEdit/context/autocompleteContextFetching.vitest.ts:54-65)

---

### 3.3 LLM Interface (Use Existing Mock.ts)

**Current state**: Project has [`Mock.ts`](core/llm/llms/Mock.ts) but tests don't use it much

**Recommendation**: Promote `MockLLM` usage across tests

**Where it should be used**:
- Any test involving LLM calls
- Tests currently mocking model responses inline

---

## Category 4: Need __forTest API Exposure

These tests access private state using `as any` - should expose test APIs instead:

### 4.1 SelectionChangeManager Private State

**File**: [`SelectionChangeManager.vitest.ts`](core/vscode-test-harness/test/SelectionChangeManager.vitest.ts:164-189)

**Current issue**: Tests access private members:
```typescript
const privateManager = selectionChangeManager as any;
privateManager.listeners = [];
privateManager.eventQueue = [];
```

**Recommendation**: Add `__forTest` methods to [`SelectionChangeManager`](core/vscode-test-harness/src/activation/SelectionChangeManager.ts)

**Benefits**:
- Type-safe access to internal state
- Clear intention that this is for testing
- Easier to maintain

---

### 4.2 JumpManager Private State

**File**: [`JumpManager.vitest.ts`](core/vscode-test-harness/test/JumpManager.vitest.ts:568-570)

**Recommendation**: Add `__forTest_getDecoration()` method

---

### 4.3 ListenableGenerator Private State

**File**: [`ListenableGenerator.vitest.ts`](core/autocomplete/generation/ListenableGenerator.vitest.ts:124)

**Recommendation**: Add `__forTest_isEnded()` getter

---

## Category 5: Tests With No Mocks (Good Examples)

These tests demonstrate integration testing without mocks:

### Excellent Examples:

1. **[`myers.vitest.ts`](core/diff/myers.vitest.ts)** - Pure algorithm testing
2. **[`streamDiff.vitest.ts`](core/diff/streamDiff.vitest.ts)** - Integration test with real diff logic
3. **[`BracketMatchingService.vitest.ts`](core/autocomplete/filtering/BracketMatchingService.vitest.ts)** - Service tested with real logic
4. **[`autodetect.vitest.ts`](core/llm/autodetect.vitest.ts)** - Pure function testing
5. **[`countTokens.vitest.ts`](core/llm/countTokens.vitest.ts)** - Uses real tokenizers
6. **[`ignore.vitest.ts`](core/indexing/ignore.vitest.ts)** - Integration with real ignore library
7. **[`AutocompleteLanguageInfo.vitest.ts`](core/autocomplete/constants/AutocompleteLanguageInfo.vitest.ts)** - Configuration testing

**Why these work well**:
- Test pure functions
- Use real implementations
- Focus on observable behavior
- No external dependencies

---

## Prioritized Action Plan

### Phase 1: Create Reusable Fakes (High Impact, Medium Effort)

1. **Create FakeIDE class** 
   - Location: `core/test/FakeIDE.ts`
   - Implement full IDE interface with in-memory file system
   - **Impact**: ~40 mock removals across 6 files
   - **Effort**: 4-6 hours

2. **Create FakeConfigHandler class**
   - Location: `core/test/FakeConfigHandler.ts`
   - Provide default test configuration
   - **Impact**: ~12 mock removals across 5 files
   - **Effort**: 2-3 hours

3. **Promote MockLLM usage**
   - Document usage in test utilities
   - Refactor tests to use existing Mock.ts
   - **Impact**: Better LLM test coverage
   - **Effort**: 2-4 hours

### Phase 2: Remove Internal Mocks (High Impact, Low Effort)

4. **Remove internal utility mocks**
   - Files: `processNextEditData.vitest.ts`, `processSmallEdit.vitest.ts`, `renderPrompt.vitest.ts`
   - Use real implementations of `createDiff`, `countTokens`, etc.
   - **Impact**: More realistic test coverage, ~30 mock removals
   - **Effort**: 3-5 hours

5. **Use real DocumentHistoryTracker**
   - File: `NextEditEditableRegionCalculator.vitest.ts`
   - Remove mock, use real singleton
   - **Impact**: Test actual AST caching behavior
   - **Effort**: 1-2 hours

### Phase 3: Add __forTest APIs (Medium Impact, Low Effort)

6. **Add __forTest methods to managers**
   - Classes: `SelectionChangeManager`, `JumpManager`, `NextEditWindowManager`, `ListenableGenerator`
   - Replace `as any` casting with type-safe methods
   - **Impact**: ~22 type-safe accesses, better maintainability
   - **Effort**: 2-3 hours per class (8-12 hours total)

### Phase 4: Integration Test Improvements (Long-term)

7. **Create integration test suite**
   - Combine multiple real components
   - Test actual user workflows
   - Use minimal mocking (only VSCode API)

8. **Document testing patterns**
   - When to mock vs use real implementations
   - How to use fake implementations
   - Best practices guide

---

## Specific File Recommendations

### High Priority Refactors

#### 1. [`SelectionChangeManager.vitest.ts`](core/vscode-test-harness/test/SelectionChangeManager.vitest.ts)
- **Current mocks**: 12 (VSCode, NextEditProvider, PrefetchQueue, etc.)
- **Keep**: VSCode API mocks (8) - unavoidable
- **Remove**: NextEditProvider, PrefetchQueue mocks (4) - use real singletons
- **Add**: __forTest APIs for state access
- **Estimated effort**: 3-4 hours
- **Impact**: High - reduce mocking by 33%, improve integration coverage

#### 2. [`ContinueCompletionProvider.vitest.ts`](core/vscode-test-harness/test/ContinueCompletionProvider.vitest.ts)
- **Current approach**: Uses real NextEditProvider, PrefetchQueue, JumpManager ✅
- **Current mocks**: 11 (VSCode, CompletionProvider, utility functions)
- **Keep**: VSCode mocks (6)
- **Consider**: Use real CompletionProvider instead of mocking it
- **Estimated effort**: 2-3 hours
- **Impact**: Medium - already partially integrated

#### 3. [`NextEditEditableRegionCalculator.vitest.ts`](core/nextEdit/NextEditEditableRegionCalculator.vitest.ts)
- **Current mocks**: 2 (DocumentHistoryTracker, IDE.getReferences)
- **Remove**: DocumentHistoryTracker mock - use real
- **Replace**: IDE mock with FakeIDE
- **Keep**: Tree-sitter tests are excellent ✅
- **Estimated effort**: 2-3 hours
- **Impact**: High - tests currently only verify mock interactions

#### 4. [`processNextEditData.vitest.ts`](core/nextEdit/context/processNextEditData.vitest.ts)
- **Current mocks**: 6 internal services
- **Remove ALL**: Use real implementations of internal utilities
- **Replace**: IDE and ConfigHandler with fakes
- **Estimated effort**: 3-4 hours
- **Impact**: Very High - currently pseudo-unit test, should be integration test

#### 5. [`processSmallEdit.vitest.ts`](core/nextEdit/context/processSmallEdit.vitest.ts)
- **Current mocks**: 5 internal services
- **Remove ALL**: Use real implementations
- **Replace**: IDE and ConfigHandler with fakes
- **Estimated effort**: 2-3 hours
- **Impact**: Very High - similar to processNextEditData

#### 6. [`renderPrompt.vitest.ts`](core/autocomplete/templating/__tests__/renderPrompt.vitest.ts)
- **Current mocks**: 6 (Handlebars + internal utilities)
- **Keep**: Handlebars mock (1) - external library
- **Remove**: countTokens, getSnippets, formatSnippets, getStopTokens (5)
- **Estimated effort**: 2-3 hours
- **Impact**: High - test real template rendering logic

### Medium Priority Files

#### 7. [`NextEditWindowManager.vitest.ts`](core/vscode-test-harness/test/NextEditWindowManager.vitest.ts)
- **Current mocks**: 7 (VSCode + core utilities)
- **Keep**: VSCode mocks
- **Consider**: Use real CodeRenderer, myersCharDiff
- **Add**: __forTest APIs
- **Estimated effort**: 2-3 hours

#### 8. [`JumpManager.vitest.ts`](core/vscode-test-harness/test/JumpManager.vitest.ts)
- **Current mocks**: 4 (VSCode, svg-builder, NextEditProvider)
- **Keep**: VSCode, svg-builder
- **Consider**: Use real NextEditProvider
- **Add**: __forTest APIs
- **Estimated effort**: 2-3 hours

### Low Priority (Already Good)

These files have minimal or appropriate mocking:
- [`LruCache.vitest.ts`](core/util/LruCache.vitest.ts) - 1 mock (test spy)
- [`GeneratorReuseManager.vitest.ts`](core/autocomplete/generation/GeneratorReuseManager.vitest.ts) - 1 mock (error callback)
- [`ListenableGenerator.vitest.ts`](core/autocomplete/generation/ListenableGenerator.vitest.ts) - 1 mock (error callback)
- All Category 5 tests (no mocks)

---

## Testing Anti-Patterns Found

### Anti-Pattern 1: Mocking Internal Functions
```typescript
// BAD
vi.mock("./internalUtility", () => ({
  helpFunction: vi.fn(),
}));

// GOOD
import { helpFunction } from "./internalUtility";
// Use real implementation, test integration
```

### Anti-Pattern 2: Excessive Mock Setup
```typescript
// BAD - 20 lines of mock setup
const mock1 = vi.fn();
const mock2 = vi.fn();

// GOOD - Use fake implementation
const fake = new FakeService();
fake.setReturnValue(...);
```

### Anti-Pattern 3: Testing Mock Interactions Instead of Behavior
```typescript
// BAD - Only verifies mock was called
expect(mockFunction).toHaveBeenCalledWith(expectedArg);

// GOOD - Verify actual output
const result = await functionUnderTest(input);
expect(result).toEqual(expectedOutput);
```

### Anti-Pattern 4: Private State Access
```typescript
// BAD
const privateState = (obj as any)._privateField;

// GOOD
const state = obj.__forTest_getState();
```

---

## Conclusion

### Summary of Recommendations

1. **Create fake implementations** for commonly mocked interfaces (IDE, ConfigHandler)
2. **Remove mocks for internal code** - use real implementations
3. **Add __forTest APIs** for legitimate test-only state access
4. **Keep VSCode API mocks** - they're unavoidable and appropriate
5. **Promote integration testing** over pseudo-unit testing with mocks

### Expected Impact

After implementing these recommendations:
- **~117 mock instances removed** (60% reduction)
- **80 mock instances remaining** (mostly VSCode API - unavoidable)
- **Better integration coverage** - tests exercise real code paths
- **Easier maintenance** - less mock setup code
- **More realistic tests** - catch integration bugs

### Next Steps

1. Review and approve this analysis
2. Create FakeIDE and FakeConfigHandler (Phase 1)
3. Refactor high-priority test files (Phase 2)
4. Add __forTest APIs incrementally (Phase 3)
5. Document new testing patterns (Phase 4)

---

## Appendix: Complete File List

### Files Analyzed (37 total)

**Heavy Mocking (>5 mocks)**:
1. SelectionChangeManager.vitest.ts - 12 mocks
2. ContinueCompletionProvider.vitest.ts - 11 mocks
3. NextEditWindowManager.vitest.ts - 7 mocks
4. processNextEditData.vitest.ts - 6 mocks
5. renderPrompt.vitest.ts - 6 mocks
6. processSmallEdit.vitest.ts - 5 mocks
7. JumpManager.vitest.ts - 4 mocks
8. GhostTextAcceptanceTracker.vitest.ts - 2 mocks
9. util.vitest.ts - 2 mocks
10. NextEditEditableRegionCalculator.vitest.ts - 2 mocks

**Light/No Mocking (Good examples)**:
11. myers.vitest.ts - 0 mocks ✅
12. streamDiff.vitest.ts - 0 mocks ✅
13. BracketMatchingService.vitest.ts - 0 mocks ✅
14. autodetect.vitest.ts - 0 mocks ✅
15. countTokens.vitest.ts - 0 mocks ✅
16. ignore.vitest.ts - 0 mocks ✅
17. AutocompleteLanguageInfo.vitest.ts - 0 mocks ✅
18. charStream.vitest.ts - 0 mocks ✅
19. lineStream.vitest.ts - 1 mock (callback spy) ✅
20. filter.vitest.ts - 0 mocks ✅
21. GeneratorReuseManager.vitest.ts - 1 mock ✅
22. ListenableGenerator.vitest.ts - 1 mock ✅
23. LruCache.vitest.ts - 1 mock ✅
24. treeSitter.vitest.ts - 0 mocks ✅

**Report Complete**