# Autocomplete & NextEdit Library

A minimal, reusable TypeScript library providing AI-powered autocomplete and NextEdit functionality, extracted from the [Continue](https://github.com/continuedev/continue) project.

## Overview

This library provides two core features for AI-assisted code editing:

- **Autocomplete**: Intelligent, context-aware code completion powered by LLMs
- **NextEdit**: Multi-location code edit predictions that understand your editing patterns

Originally part of Continue's VS Code extension, this library has been extracted into a standalone, IDE-agnostic package that can be integrated into any text editor or IDE.

## Features

### 🎯 Autocomplete

- **Context-aware completions**: Analyzes surrounding code, imports, and recently edited files
- **Multi-line support**: Generates complete code blocks, not just single lines
- **Smart filtering**: Removes invalid completions using AST analysis and bracket matching
- **Caching**: LRU cache for improved performance
- **Debouncing**: Prevents excessive LLM calls during rapid typing
- **Tree-sitter integration**: Accurate syntax-aware code analysis

### ✨ NextEdit

- **Predictive edits**: Suggests edits across multiple locations based on your changes
- **Full-file and partial-file diffs**: Flexible edit region calculation
- **Multiple model support**: Built-in support for Instinct and MercuryCoder models
- **Visual feedback**: Jump navigation between edit regions
- **Cursor positioning**: Intelligent cursor placement after edits

### 🔧 Additional Features

- **OpenAI-compatible LLM support**: Works with any OpenAI-compatible API
- **Extensible architecture**: Easy to add custom LLM providers and IDE integrations
- **Comprehensive testing**: 532 tests covering all major functionality
- **TypeScript**: Full type safety and IntelliSense support

## Installation

> **Note**: This library is not yet published to npm. Currently available as a local package.

```bash
# Clone the repository
git clone <repository-url>
cd continue

# Install dependencies
npm install

# Run tests to verify installation
./test-autocomplete.sh
```

For future npm publication:

```bash
npm install @continuedev/autocomplete-nextedit
```

## Quick Start

### Basic Autocomplete Usage

```typescript
import {
  CompletionProvider,
  MinimalConfigProvider,
} from "@continuedev/core/autocomplete";
import { IDE, ILLM } from "@continuedev/core";
import OpenAI from "@continuedev/core/llm/llms/OpenAI";

// 1. Create configuration provider
const configProvider = new MinimalConfigProvider({
  tabAutocompleteOptions: {
    debounceDelay: 150,
    maxPromptTokens: 1024,
  },
});

// 2. Implement IDE interface (simplified example)
const ide: IDE = {
  readFile: async (filepath) => {
    /* ... */
  },
  getWorkspaceDirs: async () => ["/path/to/workspace"],
  // ... implement other required methods
};

// 3. Create LLM provider
const getLlm = async (): Promise<ILLM> => {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4",
  });
};

// 4. Create completion provider
const completionProvider = new CompletionProvider(
  configProvider,
  ide,
  getLlm,
  (error) => console.error("Autocomplete error:", error),
  getDefinitionsFromLsp, // LSP integration function
);

// 5. Request completion
const outcome = await completionProvider.provideInlineCompletionItems(
  {
    filepath: "/path/to/file.ts",
    pos: { line: 10, character: 5 },
    completionId: "unique-id",
    recentlyEditedRanges: [],
    recentlyEditedFiles: new Map(),
    clipboardText: "",
  },
  abortSignal,
);

if (outcome) {
  console.log("Completion:", outcome.completion);

  // Mark as displayed
  completionProvider.markDisplayed("unique-id", outcome);

  // On user acceptance
  completionProvider.accept("unique-id");
}
```

### Basic NextEdit Usage

```typescript
import { NextEditProvider } from "@continuedev/core/nextEdit/NextEditProvider";
import { NextEditProviderFactory } from "@continuedev/core/nextEdit/NextEditProviderFactory";

// 1. Create NextEdit provider
const nextEditProvider = new NextEditProvider(
  configProvider,
  ide,
  getLlm,
  (error) => console.error("NextEdit error:", error),
);

// 2. Request next edit prediction
const outcome = await nextEditProvider.getNextEditPrediction({
  filepath: "/path/to/file.ts",
  pos: { line: 15, character: 0 },
  fileContents: currentFileContents,
  // ... other context
});

if (outcome) {
  console.log("Predicted edits:", outcome.diffLines);
  console.log("New cursor position:", outcome.finalCursorPosition);
}
```

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────┐
│         IDE Integration Layer           │
│  (VSCode, JetBrains, or Custom IDE)     │
└─────────────┬───────────────────────────┘
              │
              ├──────────────────┬─────────────────┐
              │                  │                 │
┌─────────────▼──────────┐  ┌───▼────────────┐  ┌▼─────────────┐
│  CompletionProvider    │  │ NextEditProvider│  │ MinimalConfig│
│  (Autocomplete)        │  │ (NextEdit)      │  │ Provider     │
└────────┬───────────────┘  └────┬───────────┘  └──────────────┘
         │                        │
         │  ┌─────────────────────┤
         │  │                     │
    ┌────▼──▼────┐          ┌────▼──────────┐
    │  LLM Layer │          │ Tree-sitter   │
    │  (OpenAI,  │          │ (AST parsing) │
    │   Ollama)  │          └───────────────┘
    └────────────┘
```

### Core Components

- **[`CompletionProvider`](core/autocomplete/CompletionProvider.ts)**: Main autocomplete engine
- **[`NextEditProvider`](core/nextEdit/NextEditProvider.ts)**: NextEdit prediction engine
- **[`MinimalConfigProvider`](core/autocomplete/MinimalConfig.ts)**: Configuration management
- **IDE Interface**: Abstraction for editor integration
- **ILLM Interface**: Abstraction for LLM providers

### Directory Structure

```
core/
├── autocomplete/           # Autocomplete feature
│   ├── CompletionProvider.ts
│   ├── MinimalConfig.ts
│   ├── classification/     # Multiline detection
│   ├── context/           # Context gathering
│   ├── filtering/         # Bracket matching, etc.
│   ├── generation/        # LLM completion streaming
│   ├── postprocessing/    # Clean up completions
│   ├── prefiltering/      # Early rejection
│   ├── snippets/          # Code snippet retrieval
│   ├── templating/        # Prompt construction
│   └── util/              # Helper utilities
├── nextEdit/              # NextEdit feature
│   ├── NextEditProvider.ts
│   ├── NextEditProviderFactory.ts
│   ├── providers/         # Model-specific providers
│   │   ├── BaseNextEditProvider.ts
│   │   ├── InstinctNextEditProvider.ts
│   │   └── MercuryCoderNextEditProvider.ts
│   ├── diff/              # Diff calculation
│   └── utils.ts
├── llm/                   # LLM integration
│   ├── llms/              # LLM implementations
│   │   └── OpenAI.ts
│   └── index.ts
├── diff/                  # Myers diff algorithm
├── util/                  # Shared utilities
├── indexing/              # Code indexing & ignore patterns
└── vscode-test-harness/   # VSCode integration example
    ├── src/
    │   ├── autocomplete/
    │   │   └── completionProvider.ts
    │   ├── activation/
    │   │   ├── NextEditWindowManager.ts
    │   │   ├── JumpManager.ts
    │   │   └── SelectionChangeManager.ts
    │   └── VsCodeIde.ts
    └── test/              # Integration tests (86 tests)
```

## API Reference

For detailed API documentation, see [`API_REFERENCE.md`](API_REFERENCE.md).

Quick reference for main exports:

### Autocomplete

- [`CompletionProvider`](core/autocomplete/CompletionProvider.ts) - Main autocomplete class
- [`MinimalConfigProvider`](core/autocomplete/MinimalConfig.ts) - Configuration provider
- Types: `AutocompleteInput`, `AutocompleteOutcome`, `TabAutocompleteOptions`

### NextEdit

- [`NextEditProvider`](core/nextEdit/NextEditProvider.ts) - Main NextEdit class
- [`NextEditProviderFactory`](core/nextEdit/NextEditProviderFactory.ts) - Creates model-specific providers
- Types: `NextEditOutcome`, `ModelSpecificContext`, `EditableRegion`

### Core Interfaces

- [`IDE`](core/index.d.ts) - Interface for IDE integration
- [`ILLM`](core/index.d.ts) - Interface for LLM providers
- [`Position`, `Range`, `RangeInFile`](core/index.d.ts) - Common types

## Integration

### Integrating with an IDE

To integrate this library into your IDE or text editor:

1. **Implement the IDE interface**: See [`core/index.d.ts`](core/index.d.ts) for the full interface
2. **Provide an LLM**: Use OpenAI or implement a custom LLM provider
3. **Create provider instances**: Instantiate `CompletionProvider` and/or `NextEditProvider`
4. **Handle UI**: Display completions as ghost text, handle accept/reject
5. **Reference implementation**: See [`core/vscode-test-harness/`](core/vscode-test-harness/) for a complete example

Key IDE methods to implement:

- `readFile()`, `writeFile()` - File I/O
- `getWorkspaceDirs()` - Workspace roots
- `getCurrentFile()` - Active file info
- `getCursorPosition()` - Cursor location
- `applyEdits()` - Apply code changes

### Example: VSCode Integration

See the complete VSCode integration in [`core/vscode-test-harness/`](core/vscode-test-harness/):

- [`VsCodeIde.ts`](core/vscode-test-harness/src/VsCodeIde.ts) - IDE interface implementation
- [`completionProvider.ts`](core/vscode-test-harness/src/autocomplete/completionProvider.ts) - Integration glue
- [`NextEditWindowManager.ts`](core/vscode-test-harness/src/activation/NextEditWindowManager.ts) - UI for NextEdit

## Testing

### Running Tests

```bash
# Run all tests from root (707 tests: 621 core + 86 harness)
npm test

# Run only core tests (621 tests)
npm run test:core

# Run only VSCode integration tests (86 tests)
npm run test:harness

# Watch mode for core tests
npm run test:watch

# Type checking
npm run typecheck

# Type checking in watch mode
npm run tsc:watch
```

### Test Coverage

- **Autocomplete**: ~400 unit tests covering context gathering, filtering, generation, caching
- **NextEdit**: ~46 tests covering edit prediction, diff calculation, model providers
- **Integration**: 86 tests demonstrating real-world VSCode integration

## Development

### Building

```bash
cd core
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### Type Checking

```bash
cd core
npm run tsc:check
```

### Linting

```bash
cd core
npm run lint
npm run lint:fix
```

### Contributing

This library was extracted from Continue for educational and integration purposes. If you'd like to contribute:

1. Ensure all tests pass: `./test-autocomplete.sh`
2. Add tests for new features
3. Follow existing code style
4. Update documentation as needed

## License & Credits

This library is extracted from [Continue](https://github.com/continuedev/continue), an open-source AI code assistant.

**Original Project**: https://github.com/continuedev/continue  
**Original Authors**: Continue Dev, Inc  
**License**: Apache-2.0

### Attribution

The autocomplete and NextEdit functionality in this library was developed by the Continue team. This extraction preserves the original code structure and functionality while providing a minimal, reusable package.

Key contributors to the original Continue project:

- The Continue team and community
- See the original repository for full contributor list

### Changes in This Extract

- Removed Continue-specific infrastructure (control plane, telemetry, config system)
- Replaced complex configuration with `MinimalConfigProvider`
- Consolidated into a single package for easy integration
- Added comprehensive documentation and examples
- Retained all core autocomplete and NextEdit functionality
- Kept all 532 original tests passing

## Links

- **Original Continue Project**: https://github.com/continuedev/continue
- **Continue Documentation**: https://docs.continue.dev
- **Continue Discord**: https://discord.gg/continue
- **Architecture Documentation**: [`ARCHITECTURE.md`](ARCHITECTURE.md)
- **API Reference**: [`API_REFERENCE.md`](API_REFERENCE.md)
- **Examples**: [`EXAMPLES.md`](EXAMPLES.md)

## Support

For questions about this extraction:

- Check the [`ARCHITECTURE.md`](ARCHITECTURE.md) for technical details
- Review [`EXAMPLES.md`](EXAMPLES.md) for usage patterns
- Examine the test harness in [`core/vscode-test-harness/`](core/vscode-test-harness/)

For questions about the original Continue project:

- Visit https://docs.continue.dev
- Join the Discord: https://discord.gg/continue
- Open an issue: https://github.com/continuedev/continue/issues
