import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { processNextEditData } from "./processNextEditData";
import { Position } from "../..";
import { FakeConfigHandler } from "../../test/FakeConfigHandler";

// Mock all dependencies
vi.mock("./autocompleteContextFetching", () => ({
  getAutocompleteContext: vi.fn(),
}));

vi.mock("../NextEditProvider", () => ({
  NextEditProvider: {
    getInstance: vi.fn(),
  },
}));

vi.mock("./diffFormatting", () => ({
  createDiff: vi.fn(),
  DiffFormatType: {
    Unified: "Unified",
  },
}));

vi.mock("./prevEditLruCache", () => ({
  getPrevEditsDescending: vi.fn(),
  setPrevEdit: vi.fn(),
  prevEditLruCache: {
    clear: vi.fn(),
  },
}));

// Import mocked modules
import { getAutocompleteContext } from "./autocompleteContextFetching";
import { NextEditProvider } from "../NextEditProvider";
import { createDiff } from "./diffFormatting";
import {
  getPrevEditsDescending,
  setPrevEdit,
  prevEditLruCache,
} from "./prevEditLruCache";

describe("processNextEditData", () => {
  let mockIde: any;
  let mockConfigHandler: FakeConfigHandler;
  let mockGetDefinitionsFromLsp: any;
  let mockNextEditProvider: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock IDE
    mockIde = {
      getWorkspaceDirs: vi.fn().mockResolvedValue(["/workspace"]),
      readFile: vi.fn().mockResolvedValue("file content"),
    };

    // Setup mock config handler
    mockConfigHandler = new FakeConfigHandler({
      autocompleteModel: {
        model: "test-model"
      } as any,
    });

    // Setup mock LSP function
    mockGetDefinitionsFromLsp = vi.fn().mockResolvedValue([]);

    // Setup mock NextEditProvider
    mockNextEditProvider = {
      addAutocompleteContext: vi.fn(),
    };
    (NextEditProvider.getInstance as any).mockReturnValue(mockNextEditProvider);

    // Setup mock getAutocompleteContext
    (getAutocompleteContext as any).mockResolvedValue(
      "test autocomplete context",
    );

    // Setup mock createDiff
    (createDiff as any).mockReturnValue(
      "--- test.ts\n+++ test.ts\n@@ -1,1 +1,1 @@\n-old\n+new",
    );

    // Setup mock prevEditLruCache functions
    (getPrevEditsDescending as any).mockReturnValue([]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockPosition: Position = { line: 10, character: 5 };

  const getBaseParams = () => ({
    filePath: "file:///workspace/test.ts",
    beforeContent: "const a = 1;",
    afterContent: "const a = 2;",
    cursorPosBeforeEdit: mockPosition,
    cursorPosAfterPrevEdit: mockPosition,
    ide: mockIde,
    configHandler: mockConfigHandler as any,
    getDefinitionsFromLsp: mockGetDefinitionsFromLsp,
    recentlyEditedRanges: [],
    recentlyVisitedRanges: [],
    workspaceDir: "file:///workspace",
  });

  describe("basic functionality", () => {
    it("should fetch autocomplete context", async () => {
      await processNextEditData(getBaseParams());

      expect(getAutocompleteContext).toHaveBeenCalledWith(
        getBaseParams().filePath,
        getBaseParams().cursorPosBeforeEdit,
        getBaseParams().ide,
        getBaseParams().configHandler,
        getBaseParams().getDefinitionsFromLsp,
        getBaseParams().recentlyEditedRanges,
        getBaseParams().recentlyVisitedRanges,
        expect.any(Number), // maxPromptTokens is randomized
        getBaseParams().beforeContent,
        "Codestral",
      );
    });

    it("should add context to NextEditProvider", async () => {
      await processNextEditData(getBaseParams());

      expect(mockNextEditProvider.addAutocompleteContext).toHaveBeenCalledWith(
        "test autocomplete context",
      );
    });

    it("should store current edit in cache", async () => {
      await processNextEditData(getBaseParams());

      expect(setPrevEdit).toHaveBeenCalledWith({
        unidiff: expect.any(String),
        fileUri: getBaseParams().filePath,
        workspaceUri: getBaseParams().workspaceDir,
        timestamp: expect.any(Number),
      });
    });

    it("should create diff with 25 context lines", async () => {
      await processNextEditData(getBaseParams());

      expect(createDiff).toHaveBeenCalledWith({
        beforeContent: getBaseParams().beforeContent,
        afterContent: getBaseParams().afterContent,
        filePath: getBaseParams().filePath,
        diffType: "Unified",
        contextLines: 25,
        workspaceDir: getBaseParams().workspaceDir,
      });
    });
  });

  describe("history timeout", () => {
    it("should clear cache when last edit was more than 10 minutes ago", async () => {
      const oldTimestamp = Date.now() - 11 * 60 * 1000; // 11 minutes ago

      (getPrevEditsDescending as any).mockReturnValue([
        {
          unidiff: "--- test\n+++ test\n@@ @@\n-old\n+new",
          fileUri: "file:///workspace/test.ts",
          workspaceUri: "file:///workspace",
          timestamp: oldTimestamp,
        },
      ]);

      await processNextEditData(getBaseParams());

      expect(prevEditLruCache.clear).toHaveBeenCalled();
    });

    it("should not clear cache when last edit was within 10 minutes", async () => {
      const recentTimestamp = Date.now() - 5 * 60 * 1000; // 5 minutes ago

      (getPrevEditsDescending as any).mockReturnValue([
        {
          unidiff: "--- test\n+++ test\n@@ @@\n-old\n+new",
          fileUri: "file:///workspace/test.ts",
          workspaceUri: "file:///workspace",
          timestamp: recentTimestamp,
        },
      ]);

      await processNextEditData(getBaseParams());

      expect(prevEditLruCache.clear).not.toHaveBeenCalled();
    });
  });

  describe("workspace change detection", () => {
    it("should clear cache when workspace changes", async () => {
      (getPrevEditsDescending as any).mockReturnValue([
        {
          unidiff: "--- test\n+++ test\n@@ @@\n-old\n+new",
          fileUri: "file:///workspace/test.ts",
          workspaceUri: "file:///different-workspace",
          timestamp: Date.now(),
        },
      ]);

      await processNextEditData(getBaseParams());

      expect(prevEditLruCache.clear).toHaveBeenCalled();
    });

    it("should not clear cache when workspace is the same", async () => {
      (getPrevEditsDescending as any).mockReturnValue([
        {
          unidiff: "--- test\n+++ test\n@@ @@\n-old\n+new",
          fileUri: "file:///workspace/test.ts",
          workspaceUri: "file:///workspace",
          timestamp: Date.now(),
        },
      ]);

      await processNextEditData(getBaseParams());

      expect(prevEditLruCache.clear).not.toHaveBeenCalled();
    });
  });

  describe("maxPromptTokens randomization", () => {
    it("should use random maxPromptTokens between 500 and 12000", async () => {
      (getAutocompleteContext as any).mockClear();

      await processNextEditData(getBaseParams());

      const maxPromptTokens = (getAutocompleteContext as any).mock.calls[0][7];

      expect(maxPromptTokens).toBeGreaterThanOrEqual(500);
      expect(maxPromptTokens).toBeLessThanOrEqual(12000);
    });
  });

  describe("edge cases", () => {
    it("should handle empty previous edits array", async () => {
      (getPrevEditsDescending as any).mockReturnValue([]);

      await expect(processNextEditData(getBaseParams())).resolves.not.toThrow();
    });

    it("should handle multiple previous edits", async () => {
      const consoleLogSpy = vi.spyOn(console, "log");
      
      const mockEdits = [
        {
          unidiff: "--- a/test1.ts\n+++ b/test1.ts\n@@ @@\nheader\n-old1\n+new1",
          fileUri: "file:///workspace/test1.ts",
          workspaceUri: "file:///workspace",
          timestamp: Date.now() - 1000,
        },
        {
          unidiff: "--- a/test2.ts\n+++ b/test2.ts\n@@ @@\nheader\n-old2\n+new2",
          fileUri: "file:///workspace/test2.ts",
          workspaceUri: "file:///workspace",
          timestamp: Date.now() - 2000,
        },
      ];

      (getPrevEditsDescending as any).mockReturnValue(mockEdits);

      await processNextEditData(getBaseParams());

      // Verify console.log was called with nextEditWithHistory
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "nextEditWithHistory",
        expect.objectContaining({
          previousEdits: [
            {
              filename: "test1.ts",
              diff: "-old1\n+new1", // diff without first 4 lines (header lines)
            },
            {
              filename: "test2.ts",
              diff: "-old2\n+new2", // diff without first 4 lines (header lines)
            },
          ],
          fileURI: getBaseParams().filePath,
          workspaceDirURI: getBaseParams().workspaceDir,
        }),
      );

      consoleLogSpy.mockRestore();
    });

    it("should handle undefined model name", async () => {
      await expect(
        processNextEditData({
          ...getBaseParams(),
          modelNameOrInstance: undefined,
        }),
      ).resolves.not.toThrow();
    });
  });
});
