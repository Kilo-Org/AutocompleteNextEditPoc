// Minimal stub for removed codeRenderer functionality
import type { DiffLine, DiffChar } from "../index.js";
export class CodeRenderer {
  private static instance: CodeRenderer;

  static getInstance(): CodeRenderer {
    if (!CodeRenderer.instance) {
      CodeRenderer.instance = new CodeRenderer();
    }
    return CodeRenderer.instance;
  }

  async setTheme(theme: string): Promise<void> {
    // No-op stub
  }

  async getDataUri(
    text: string,
    languageId: string,
    options: {
      imageType: "svg";
      fontSize: number;
      fontFamily: string;
      dimensions: { width: number; height: number };
      lineHeight: number;
    },
    currLineOffsetFromTop: number,
    newDiffLines: DiffLine[],
    diffChars: DiffChar[],
  ): Promise<string> {
    // Return empty data URI as stub
    return "data:image/svg+xml;base64,";
  }
}
