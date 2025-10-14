import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { processNextEditData } from "./processNextEditData";
import { Position } from "../..";

// Mock all dependencies
vi.mock("./autocompleteContextFetching", () => ({
  getAutocompleteContext: vi.fn(),
}));

vi.mock("../NextEditProvider", () => ({
  NextEditProvider: {
    getInstance: vi.fn(),
  },
}));

vi.mock("../../util/log", () => ({
  DataLogger: {
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
  let mockConfigHandler: any;
  let mockGetDefinitionsFromLsp: any;
  let mockNextEditProvider: any;
  let mockDataLogger: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock IDE
    mockIde = {
      getWorkspaceDirs: vi.fn().mockResolvedValue(["/workspace"]),
      readFile: vi.fn().mockResolvedValue("file content"),
    };

    // Setup mock config handler
    mockConfigHandler = {
      loadConfig: vi.fn().mockResolvedValue({
        config: {
          selectedModelByRole: {
            autocomplete: { model: "test-model" },
          },
        },
      }),
    };

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

  const baseParams = {
    filePath: "file:///workspace/test.ts",
    beforeContent: "const a = 1;",
    afterContent: "const a = 2;",
    cursorPosBeforeEdit: mockPosition,
    cursorPosAfterPrevEdit: mockPosition,
    ide: mockIde,
    configHandler: mockConfigHandler,
    getDefinitionsFromLsp: mockGetDefinitionsFromLsp,
    recentlyEditedRanges: [],
    recentlyVisitedRanges: [],
    workspaceDir: "file:///workspace",
  };

  describe("basic functionality", () => {
    it("should fetch autocomplete context", async () => {
      await processNextEditData(baseParams);

      expect(getAutocompleteContext).toHaveBeenCalledWith(
        baseParams.filePath,
        baseParams.cursorPosBeforeEdit,
        baseParams.ide,
        baseParams.configHandler,
        baseParams.getDefinitionsFromLsp,
        baseParams.recentlyEditedRanges,
        baseParams.recentlyVisitedRanges,
        expect.any(Number), // maxPromptTokens is randomized
        baseParams.beforeContent,
        "Codestral",
      );
    });

    it("should add context to NextEditProvider", async () => {
      await processNextEditData(baseParams);

      expect(mockNextEditProvider.addAutocompleteContext).toHaveBeenCalledWith(
        "test autocomplete context",
      );
    });

    it("should store current edit in cache", async () => {
      await processNextEditData(baseParams);

      expect(setPrevEdit).toHaveBeenCalledWith({
        unidiff: expect.any(String),
        fileUri: baseParams.filePath,
        workspaceUri: baseParams.workspaceDir,
        timestamp: expect.any(Number),
      });
    });

    it("should create diff with 25 context lines", async () => {
      await processNextEditData(baseParams);

      expect(createDiff).toHaveBeenCalledWith({
        beforeContent: baseParams.beforeContent,
        afterContent: baseParams.afterContent,
        filePath: baseParams.filePath,
        diffType: "Unified",
        contextLines: 25,
        workspaceDir: baseParams.workspaceDir,
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

      await processNextEditData(baseParams);

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

      await processNextEditData(baseParams);

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

      await processNextEditData(baseParams);

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

      await processNextEditData(baseParams);

      expect(prevEditLruCache.clear).not.toHaveBeenCalled();
    });
  });

  describe("data logging", () => {
    it("should log data when previous edits exist", async () => {
      const mockPrevEdit = {
        unidiff:
          "--- file:///workspace/prev.ts\n+++ file:///workspace/prev.ts\n@@ -1,1 +1,1 @@\n@@ -2,2 +2,2 @@\n-old\n+new",
        fileUri: "file:///workspace/prev.ts",
        workspaceUri: "file:///workspace",
        timestamp: Date.now() - 1000,
      };

      (getPrevEditsDescending as any).mockReturnValue([mockPrevEdit]);

      await processNextEditData(baseParams);

      expect(mockDataLogger.logDevData).toHaveBeenCalledWith({
        name: "nextEditWithHistory",
        data: expect.objectContaining({
          previousEdits: expect.arrayContaining([
            expect.objectContaining({
              filename: expect.any(String),
              diff: expect.any(String),
            }),
          ]),
          fileURI: baseParams.filePath,
          workspaceDirURI: baseParams.workspaceDir,
          beforeContent: baseParams.beforeContent,
          afterContent: baseParams.afterContent,
          beforeCursorPos: baseParams.cursorPosBeforeEdit,
          afterCursorPos: baseParams.cursorPosAfterPrevEdit,
          context: "test autocomplete context",
          modelProvider: "mistral",
          modelName: "Codestral",
          modelTitle: "Codestral",
        }),
      });
    });

    it("should not log when no previous edits exist", async () => {
      (getPrevEditsDescending as any).mockReturnValue([]);

      await processNextEditData(baseParams);

      expect(mockDataLogger.logDevData).not.toHaveBeenCalled();
    });

    it("should format filenames relative to workspace", async () => {
      (getPrevEditsDescending as any).mockReturnValue([
        {
          unidiff: "--- test\n+++ test\nheader3\nheader4\n-old\n+new",
          fileUri: "file:///workspace/src/test.ts",
          workspaceUri: "file:///workspace",
          timestamp: Date.now() - 1000,
        },
      ]);

      await processNextEditData(baseParams);

      const logCall = mockDataLogger.logDevData.mock.calls[0][0];
      expect(logCall.data.previousEdits[0].filename).toBe("src/test.ts");
    });

    it("should strip first 4 lines from diff in logged data", async () => {
      (getPrevEditsDescending as any).mockReturnValue([
        {
          unidiff: "line1\nline2\nline3\nline4\nline5\nline6",
          fileUri: "file:///workspace/test.ts",
          workspaceUri: "file:///workspace",
          timestamp: Date.now() - 1000,
        },
      ]);

      await processNextEditData(baseParams);

      const logCall = mockDataLogger.logDevData.mock.calls[0][0];
      expect(logCall.data.previousEdits[0].diff).toBe("line5\nline6");
    });
  });

  describe("maxPromptTokens randomization", () => {
    it("should use random maxPromptTokens between 500 and 12000", async () => {
      (getAutocompleteContext as any).mockClear();

      await processNextEditData(baseParams);

      const maxPromptTokens = (getAutocompleteContext as any).mock.calls[0][7];

      expect(maxPromptTokens).toBeGreaterThanOrEqual(500);
      expect(maxPromptTokens).toBeLessThanOrEqual(12000);
    });
  });

  describe("edge cases", () => {
    it("should handle empty previous edits array", async () => {
      (getPrevEditsDescending as any).mockReturnValue([]);

      await expect(processNextEditData(baseParams)).resolves.not.toThrow();
    });

    it("should handle multiple previous edits", async () => {
      const mockEdits = [
        {
          unidiff: "--- a\n+++ b\nheader\nheader\n-old1\n+new1",
          fileUri: "file:///workspace/test1.ts",
          workspaceUri: "file:///workspace",
          timestamp: Date.now() - 1000,
        },
        {
          unidiff: "--- a\n+++ b\nheader\nheader\n-old2\n+new2",
          fileUri: "file:///workspace/test2.ts",
          workspaceUri: "file:///workspace",
          timestamp: Date.now() - 2000,
        },
      ];

      (getPrevEditsDescending as any).mockReturnValue(mockEdits);

      await processNextEditData(baseParams);

      expect(mockDataLogger.logDevData).toHaveBeenCalled();
      const logCall = mockDataLogger.logDevData.mock.calls[0][0];
      expect(logCall.data.previousEdits).toHaveLength(2);
    });

    it("should handle undefined model name", async () => {
      await expect(
        processNextEditData({
          ...baseParams,
          modelNameOrInstance: undefined,
        }),
      ).resolves.not.toThrow();
    });
  });
});
