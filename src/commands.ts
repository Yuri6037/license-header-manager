/*
 * Copyright 2023 Yuri6037
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy
 * of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS
 * IN THE SOFTWARE.
 */

import { ProgressLocation, RelativePattern, TextEditor, Uri, commands, window, workspace } from "vscode";
import { LTFManager } from "./ltf";
import { LangMap } from "./langmap";
import { Parser } from "./parser";
import { filter, isIgnored } from "./ignoretree";

export async function addLicenseHeader(editor: TextEditor) {
    try {
        if (await isIgnored(editor.document.uri)) {
            return;
        }
        const mgr = new LTFManager(editor.document.uri);
        const ext = mgr.getTemplateExt(editor.document.uri.fsPath);
        const info = {
            filePath: editor.document.uri.fsPath,
            eol: editor.document.eol
        };
        if (ext === null) {
            return;
        }
        const map = new LangMap(editor.document.uri);
        const config = map.getConfig(ext);
        if (config === null) { //The language has been disabled.
            return;
        }
        if (config === undefined) {
            await window.showErrorMessage(`No language configuration found for '${ext}' files`);
            return;
        }
        if (!await mgr.hasTemplate(ext)) {
            const option = await window.showInformationMessage(`No template found for '${ext}' files, would you like to create one?`, "Yes", "No");
            if (option === "Yes") {
                await commands.executeCommand("license-header-manager.add-template");
            }
            return;
        }
        const template = await mgr.loadTemplate(ext, info);
        const parser = new Parser(config, editor);
        if (parser.needsCommentBlockUpdate(template)) {
            editor.edit((edit) => {
                parser.addOrUpdateCommentBlock(edit, template);
            });
            await editor.document.save();
        }
    } catch (ex) {
        await window.showErrorMessage(`Failed to apply template: ${ex}`);
    }
}

export async function addTemplate(editor: TextEditor) {
    try {
        const mgr = new LTFManager(editor.document.uri);
        const ext = mgr.getTemplateExt(editor.document.uri.fsPath);
        if (ext === null) {
            return;
        }
        const path = await mgr.newTemplate(ext);
        await commands.executeCommand("vscode.open", Uri.file(path));
    } catch (ex) {
        await window.showErrorMessage(`Error accessing LTFManager: ${ex}`);
    }
}

export async function removeLicenseHeader(editor: TextEditor) {
    try {
        if (await isIgnored(editor.document.uri)) {
            return;
        }
        const mgr = new LTFManager(editor.document.uri);
        const ext = mgr.getTemplateExt(editor.document.uri.fsPath);
        if (ext === null) {
            return;
        }
        const map = new LangMap(editor.document.uri);
        const config = map.getConfig(ext);
        if (config === null) { //The language has been disabled.
            return;
        }
        if (config === undefined) {
            await window.showErrorMessage(`No language configuration found for '${ext}' files`);
            return;
        }
        const parser = new Parser(config, editor);
        const range = parser.getLicenseBlockRange();
        if (range) {
            editor.edit(edit => {
                edit.delete(range);
            });
        }
    } catch (ex) {
        await window.showErrorMessage(`Failed to remove license header: ${ex}`);
    }
}

async function listAllSupportedFiles(): Promise<Uri[] | null> {
    if (!workspace.workspaceFolders) {
        return null;
    }
    let arr: Uri[] = [];
    for (const folder of workspace.workspaceFolders) {
        const mgr = new LTFManager(folder.uri);
        const exts = await mgr.listSupportedExtensions();
        if (exts.length <= 0) {
            continue;
        }
        const pattern = new RelativePattern(folder, `**/*.{${exts.join(",")}}`);
        const files = await workspace.findFiles(pattern);
        arr = arr.concat(files);
    }
    return filter(arr);
}

export async function addAllLicenseHeaders() {
    await window.withProgress({ cancellable: false, title: "Add/Update All License Headers", location: ProgressLocation.Notification }, async (progress) => {
        progress.report({ message: "Loading file list...", increment: 0 });
        const files = await listAllSupportedFiles();
        if (!files) {
            progress.report({ increment: 100 });
            return;
        }
        progress.report({ message: "Updating all license headers...", increment: 0 });
        let current = 0;
        const total = files.length;
        let count = 0;
        for (const f of files) {
            const doc = await workspace.openTextDocument(f);
            const editor = await window.showTextDocument(doc);
            await addLicenseHeader(editor);
            if (await editor.document.save()) {
                await commands.executeCommand('workbench.action.closeActiveEditor');
            }
            count += 1;
            const value = count / total;
            const inc = (value - current) * 100;
            current = value;
            if (inc > 0) {
                progress.report({ message: "Updating all license headers...", increment: inc });
            }
        }
    });
}

export async function removeAllLicenseHeaders() {
    await window.withProgress({ cancellable: false, title: "Remove All License Headers", location: ProgressLocation.Notification }, async (progress) => {
        progress.report({ message: "Loading file list...", increment: 0 });
        const files = await listAllSupportedFiles();
        if (!files) {
            progress.report({ increment: 100 });
            return;
        }
        progress.report({ message: "Removing all license headers...", increment: 0 });
        let current = 0;
        const total = files.length;
        let count = 0;
        for (const f of files) {
            const doc = await workspace.openTextDocument(f);
            const editor = await window.showTextDocument(doc);
            await removeLicenseHeader(editor);
            if (await editor.document.save()) {
                await commands.executeCommand('workbench.action.closeActiveEditor');
            }
            count += 1;
            const value = count / total;
            const inc = (value - current) * 100;
            current = value;
            if (inc > 0) {
                progress.report({ message: "Removing all license headers...", increment: inc });
            }
        }
    });
}
