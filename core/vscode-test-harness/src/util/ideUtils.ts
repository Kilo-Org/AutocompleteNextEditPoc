import * as URI from "uri-js";
import * as vscode from "vscode";
import { getUniqueId, openEditorAndRevealRange } from "./vscode";

const NO_FS_PROVIDER_ERROR = "ENOPRO";
const UNSUPPORTED_SCHEMES: Set<string> = new Set();

export class VsCodeIdeUtils {
  visibleMessages: Set<string> = new Set();

  async gotoDefinition(
    uri: vscode.Uri,
    position: vscode.Position,
  ): Promise<vscode.Location[]> {
    const locations: vscode.Location[] = await vscode.commands.executeCommand(
      "vscode.executeDefinitionProvider",
      uri,
      position,
    );
    return locations;
  }

  async documentSymbol(uri: vscode.Uri): Promise<vscode.DocumentSymbol[]> {
    return await vscode.commands.executeCommand(
      "vscode.executeDocumentSymbolProvider",
      uri,
    );
  }

  async references(
    uri: vscode.Uri,
    position: vscode.Position,
  ): Promise<vscode.Location[]> {
    return await vscode.commands.executeCommand(
      "vscode.executeReferenceProvider",
      uri,
      position,
    );
  }

  async foldingRanges(uri: vscode.Uri): Promise<vscode.FoldingRange[]> {
    return await vscode.commands.executeCommand(
      "vscode.executeFoldingRangeProvider",
      uri,
    );
  }

  private _workspaceDirectories: vscode.Uri[] | undefined = undefined;
  getWorkspaceDirectories(): vscode.Uri[] {
    if (this._workspaceDirectories === undefined) {
      this._workspaceDirectories =
        vscode.workspace.workspaceFolders?.map((folder) => folder.uri) || [];
    }

    return this._workspaceDirectories;
  }

  setWokspaceDirectories(dirs: vscode.Uri[] | undefined): void {
    this._workspaceDirectories = dirs;
  }

  getUniqueId() {
    return getUniqueId();
  }

  async openFile(uri: vscode.Uri, range?: vscode.Range) {
    // vscode has a builtin open/get open files
    return await openEditorAndRevealRange(
      uri,
      range,
      vscode.ViewColumn.One,
      false,
    );
  }

  async fileExists(uri: vscode.Uri): Promise<boolean> {
    try {
      return (await this.stat(uri)) !== null;
    } catch {
      return false;
    }
  }

  /**
   * Read the entire contents of a file from the given URI.
   * If there are unsaved changes in an open editor, returns those instead of the file on disk.
   *
   * @param uri - The URI of the file to read.
   * @param ignoreMissingProviders - Optional flag to ignore missing file system providers for unsupported schemes.
   *                                 Defaults to `true`.
   * @returns A promise that resolves to the file content as a `Uint8Array`, or `null` if the scheme is unsupported
   *          or the provider is missing and `ignoreMissingProviders` is `true`.
   *          If `ignoreMissingProviders` is `false`, it will throw an error for unsupported schemes or missing providers.
   * @throws Will rethrow any error that is not related to missing providers or unsupported schemes.
   */
  async readFile(
    uri: vscode.Uri,
    ignoreMissingProviders: boolean = true,
  ): Promise<Uint8Array | null> {
    // First check if there's an open document with this URI that might have unsaved changes.
    const openDocuments = vscode.workspace.textDocuments;
    for (const document of openDocuments) {
      if (document.uri.toString() === uri.toString()) {
        // Found an open document with this URI.
        // Return its current content (including any unsaved changes) as Uint8Array.
        const docText = document.getText();
        return new Uint8Array(Buffer.from(docText, "utf8"));
      }
    }

    // If no open document found or if it's not dirty, fall back to reading from disk.
    return await this.fsOperation(
      uri,
      async (u) => {
        return await vscode.workspace.fs.readFile(u);
      },
      ignoreMissingProviders,
    );
  }

  /**
   * Retrieve metadata about a file from the given URI.
   *
   * @param uri - The URI of the file or directory to retrieve metadata about.
   * @param ignoreMissingProviders - Optional. If `true`, missing file system providers will be ignored. Defaults to `true`.
   * @returns A promise that resolves to a `vscode.FileStat` object containing the file metadata,
   *          or `null` if the scheme is unsupported or the provider is missing and `ignoreMissingProviders` is `true`.
   */
  async stat(
    uri: vscode.Uri,
    ignoreMissingProviders: boolean = true,
  ): Promise<vscode.FileStat | null> {
    return await this.fsOperation(
      uri,
      async (u) => {
        return await vscode.workspace.fs.stat(uri);
      },
      ignoreMissingProviders,
    );
  }

  /**
   * Retrieve all entries of a directory from the given URI.
   *
   * @param uri - The URI of the directory to read.
   * @param ignoreMissingProviders - Optional. If `true`, missing file system providers will be ignored. Defaults to `true`.
   * @returns A promise that resolves to an array of tuples, where each tuple contains the name of a directory entry
   *          and its type (`vscode.FileType`), or `null` if the scheme is unsupported or the provider is missing and `ignoreMissingProviders` is `true`.
   */
  async readDirectory(
    uri: vscode.Uri,
    ignoreMissingProviders: boolean = true,
  ): Promise<[string, vscode.FileType][] | null> {
    return await this.fsOperation(
      uri,
      async (u) => {
        return await vscode.workspace.fs.readDirectory(uri);
      },
      ignoreMissingProviders,
    );
  }

  /**
   * Performs a file system operation on the given URI using the provided delegate function.
   *
   * @template T The type of the result returned by the delegate function.
   * @param uri The URI on which the file system operation is to be performed.
   * @param delegate A function that performs the desired operation on the given URI.
   * @param ignoreMissingProviders Whether to ignore errors caused by missing file system providers. Defaults to `true`.
   * @returns A promise that resolves to the result of the delegate function, or `null` if the operation is skipped due to unsupported schemes or missing providers.
   * @throws Re-throws any error encountered during the operation, except for missing provider errors when `ignoreMissingProviders` is `true`.
   */
  private async fsOperation<T>(
    uri: vscode.Uri,
    delegate: (uri: vscode.Uri) => T,
    ignoreMissingProviders: boolean = true,
  ): Promise<T | null> {
    const scheme = uri.scheme;
    if (ignoreMissingProviders && UNSUPPORTED_SCHEMES.has(scheme)) {
      return null;
    }
    try {
      return await delegate(uri);
    } catch (err: any) {
      if (
        ignoreMissingProviders &&
        //see https://github.com/microsoft/vscode/blob/c9c54f9e775e5f57d97bef796797b5bc670c8150/src/vs/workbench/api/common/extHostFileSystemConsumer.ts#L230
        (err.name === NO_FS_PROVIDER_ERROR ||
          err.message?.includes(NO_FS_PROVIDER_ERROR))
      ) {
        UNSUPPORTED_SCHEMES.add(scheme);
        console.log(`Ignoring missing provider error:`, err.message);
        return null;
      }
      throw err;
    }
  }

  // ------------------------------------ //
  // Respond to request

  // Checks to see if the editor is a code editor.
  // In some cases vscode.window.visibleTextEditors can return non-code editors
  // e.g. terminal editors in side-by-side mode
  private documentIsCode(uri: vscode.Uri) {
    return uri.scheme === "file" || uri.scheme === "vscode-remote";
  }

  getOpenFiles(): vscode.Uri[] {
    return vscode.window.tabGroups.all
      .flatMap((group) => group.tabs)
      .filter(
        (tab) =>
          tab.input instanceof vscode.TabInputText &&
          this.documentIsCode((tab.input as vscode.TabInputText).uri),
      )
      .map((tab) => (tab.input as vscode.TabInputText).uri);
  }

  saveFile(uri: vscode.Uri) {
    vscode.window.visibleTextEditors
      .filter((editor) => this.documentIsCode(editor.document.uri))
      .forEach((editor) => {
        if (URI.equal(editor.document.uri.toString(), uri.toString())) {
          editor.document.save();
        }
      });
  }

  async readRangeInFile(uri: vscode.Uri, range: vscode.Range): Promise<string> {
    const buffer = await this.readFile(uri);
    if (buffer === null) {
      return "";
    }
    const contents = new TextDecoder().decode(buffer);
    const lines = contents.split("\n");
    return `${lines.slice(range.start.line, range.end.line).join("\n")}\n${lines[
      range.end.line < lines.length - 1 ? range.end.line : lines.length - 1
    ].slice(0, range.end.character)}`;
  }
}
