import { Range } from "core";
import * as URI from "uri-js";
import * as vscode from "vscode";

import { executeGotoProvider, executeSignatureHelpProvider, executeSymbolProvider } from "./autocomplete/lsp";
import { VsCodeIdeUtils } from "./util/ideUtils";
import { VsCodeWebviewProtocol } from "./webviewProtocol";

import type { DocumentSymbol, FileStatsMap, IDE, IdeInfo, Location, RangeInFile, SignatureHelp } from "core";
import { getExtensionVersion, isExtensionPrerelease } from "./util/util";

class VsCodeIde implements IDE {
  ideUtils: VsCodeIdeUtils;

  constructor(
    private readonly vscodeWebviewProtocolPromise: Promise<VsCodeWebviewProtocol>,
    private readonly context: vscode.ExtensionContext
  ) {
    this.ideUtils = new VsCodeIdeUtils();
  }

  async fileExists(uri: string): Promise<boolean> {
    try {
      const stat = await this.ideUtils.stat(vscode.Uri.parse(uri));
      return stat !== null;
    } catch (error) {
      if (error instanceof vscode.FileSystemError) {
        return false;
      }
      throw error;
    }
  }

  async gotoDefinition(location: Location): Promise<RangeInFile[]> {
    const result = await executeGotoProvider({
      uri: vscode.Uri.parse(location.filepath),
      line: location.position.line,
      character: location.position.character,
      name: "vscode.executeDefinitionProvider",
    });

    return result;
  }

  async gotoTypeDefinition(location: Location): Promise<RangeInFile[]> {
    const result = await executeGotoProvider({
      uri: vscode.Uri.parse(location.filepath),
      line: location.position.line,
      character: location.position.character,
      name: "vscode.executeTypeDefinitionProvider",
    });

    return result;
  }

  async getSignatureHelp(location: Location): Promise<SignatureHelp | null> {
    const result = await executeSignatureHelpProvider({
      uri: vscode.Uri.parse(location.filepath),
      line: location.position.line,
      character: location.position.character,
      name: "vscode.executeSignatureHelpProvider",
    });

    return result;
  }

  async getReferences(location: Location): Promise<RangeInFile[]> {
    const result = await executeGotoProvider({
      uri: vscode.Uri.parse(location.filepath),
      line: location.position.line,
      character: location.position.character,
      name: "vscode.executeReferenceProvider",
    });

    return result;
  }

  async getDocumentSymbols(
    textDocumentIdentifier: string // uri
  ): Promise<DocumentSymbol[]> {
    const result = await executeSymbolProvider({
      uri: vscode.Uri.parse(textDocumentIdentifier),
      name: "vscode.executeDocumentSymbolProvider",
    });

    return result;
  }

  onDidChangeActiveTextEditor(callback: (uri: string) => void): void {
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        callback(editor.document.uri.toString());
      }
    });
  }

  getIdeInfo(): Promise<IdeInfo> {
    return Promise.resolve({
      ideType: "vscode",
      name: vscode.env.appName,
      version: vscode.version,
      remoteName: vscode.env.remoteName || "local",
      extensionVersion: getExtensionVersion(),
      isPrerelease: isExtensionPrerelease(),
    });
  }

  readRangeInFile(fileUri: string, range: Range): Promise<string> {
    return this.ideUtils.readRangeInFile(
      vscode.Uri.parse(fileUri),
      new vscode.Range(
        new vscode.Position(range.start.line, range.start.character),
        new vscode.Position(range.end.line, range.end.character)
      )
    );
  }

  async getFileStats(files: string[]): Promise<FileStatsMap> {
    const pathToLastModified: FileStatsMap = {};
    await Promise.all(
      files.map(async (file) => {
        const stat = await this.ideUtils.stat(vscode.Uri.parse(file), false /* No need to catch ENOPRO exceptions */);
        pathToLastModified[file] = {
          lastModified: stat!.mtime,
          size: stat!.size,
        };
      })
    );

    return pathToLastModified;
  }

  getUniqueId(): Promise<string> {
    return Promise.resolve(vscode.env.machineId);
  }

  async getClipboardContent() {
    return {
      text: await vscode.env.clipboard.readText(),
      copiedAt: new Date().toISOString(),
    };
  }

  async getWorkspaceDirs(): Promise<string[]> {
    return this.ideUtils.getWorkspaceDirectories().map((uri) => uri.toString());
  }

  async writeFile(fileUri: string, contents: string): Promise<void> {
    await vscode.workspace.fs.writeFile(vscode.Uri.parse(fileUri), new Uint8Array(Buffer.from(contents)));
  }

  async saveFile(fileUri: string): Promise<void> {
    await this.ideUtils.saveFile(vscode.Uri.parse(fileUri));
  }

  private static MAX_BYTES = 100000;

  async readFile(fileUri: string): Promise<string> {
    try {
      const uri = vscode.Uri.parse(fileUri);

      // First, check whether it's a notebook document
      // Need to iterate over the cells to get full contents
      const notebook =
        vscode.workspace.notebookDocuments.find((doc) => URI.equal(doc.uri.toString(), uri.toString())) ??
        (uri.path.endsWith("ipynb") ? await vscode.workspace.openNotebookDocument(uri) : undefined);
      if (notebook) {
        return notebook
          .getCells()
          .map((cell) => cell.document.getText())
          .join("\n\n");
      }

      // Check whether it's an open document
      const openTextDocument = vscode.workspace.textDocuments.find((doc) =>
        URI.equal(doc.uri.toString(), uri.toString())
      );
      if (openTextDocument !== undefined) {
        return openTextDocument.getText();
      }

      const fileStats = await this.ideUtils.stat(uri);
      if (fileStats === null || fileStats.size > 10 * VsCodeIde.MAX_BYTES) {
        return "";
      }

      const bytes = await this.ideUtils.readFile(uri);
      if (bytes === null) {
        return "";
      }

      // Truncate the buffer to the first MAX_BYTES
      const truncatedBytes = bytes.slice(0, VsCodeIde.MAX_BYTES);
      const contents = new TextDecoder().decode(truncatedBytes);
      return contents;
    } catch (e) {
      return "";
    }
  }

  async getOpenFiles(): Promise<string[]> {
    return this.ideUtils.getOpenFiles().map((uri) => uri.toString());
  }

  async getCurrentFile() {
    if (!vscode.window.activeTextEditor) {
      return undefined;
    }
    return {
      isUntitled: vscode.window.activeTextEditor.document.isUntitled,
      path: vscode.window.activeTextEditor.document.uri.toString(),
      contents: vscode.window.activeTextEditor.document.getText(),
    };
  }
}

export { VsCodeIde };
