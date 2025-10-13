import * as fs from "node:fs";

import { fileURLToPath } from "node:url";
import {
  DocumentSymbol,
  FileStatsMap,
  FileType,
  IDE,
  IdeInfo,
  IdeSettings,
  IndexTag,
  Location,
  Problem,
  Range,
  RangeInFile,
  SignatureHelp,
  Thread,
  ToastType,
} from "../index.js";

class FileSystemIde implements IDE {
  constructor(private readonly workspaceDir: string) {}

  fileExists(fileUri: string): Promise<boolean> {
    const filepath = fileURLToPath(fileUri);
    return Promise.resolve(fs.existsSync(filepath));
  }

  gotoDefinition(location: Location): Promise<RangeInFile[]> {
    return Promise.resolve([]);
  }

  gotoTypeDefinition(location: Location): Promise<RangeInFile[]> {
    return Promise.resolve([]);
  }

  getSignatureHelp(location: Location): Promise<SignatureHelp | null> {
    return Promise.resolve(null);
  }

  getReferences(location: Location): Promise<RangeInFile[]> {
    return Promise.resolve([]);
  }

  getDocumentSymbols(fileUri: string): Promise<DocumentSymbol[]> {
    return Promise.resolve([]);
  }

  onDidChangeActiveTextEditor(callback: (fileUri: string) => void): void {
    return;
  }

  async getFileStats(fileUris: string[]): Promise<FileStatsMap> {
    const result: FileStatsMap = {};
    for (const uri of fileUris) {
      try {
        const filepath = fileURLToPath(uri);
        const stats = fs.statSync(filepath);
        result[uri] = {
          lastModified: stats.mtimeMs,
          size: stats.size,
        };
      } catch (error) {
        console.error(`Error getting last modified time for ${uri}:`, error);
      }
    }
    return result;
  }

  getIdeInfo(): Promise<IdeInfo> {
    return Promise.resolve({
      ideType: "vscode",
      name: "na",
      version: "0.1",
      remoteName: "na",
      extensionVersion: "na",
      isPrerelease: false,
    });
  }

  readRangeInFile(fileUri: string, range: Range): Promise<string> {
    return Promise.resolve("");
  }

  getUniqueId(): Promise<string> {
    return Promise.resolve("NOT_UNIQUE");
  }

  getClipboardContent(): Promise<{ text: string; copiedAt: string }> {
    return Promise.resolve({ text: "", copiedAt: new Date().toISOString() });
  }
  getWorkspaceDirs(): Promise<string[]> {
    return Promise.resolve([this.workspaceDir]);
  }

  writeFile(fileUri: string, contents: string): Promise<void> {
    const filepath = fileURLToPath(fileUri);
    return new Promise((resolve, reject) => {
      fs.writeFile(filepath, contents, (err) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }

  saveFile(fileUri: string): Promise<void> {
    return Promise.resolve();
  }

  readFile(fileUri: string): Promise<string> {
    const filepath = fileURLToPath(fileUri);
    return new Promise((resolve, reject) => {
      fs.readFile(filepath, "utf8", (err, contents) => {
        if (err) {
          reject(err);
        }
        resolve(contents);
      });
    });
  }

  getCurrentFile(): Promise<undefined> {
    return Promise.resolve(undefined);
  }
  getOpenFiles(): Promise<string[]> {
    return Promise.resolve([]);
  }
}

export { FileSystemIde };
