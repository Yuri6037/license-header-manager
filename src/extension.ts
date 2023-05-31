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

import * as vscode from 'vscode';
import { registerCommand, registerEditorCommand } from './util';
import { LTFCompletionProvider } from './completion';
import { addAllLicenseHeaders, addLicenseHeader, addTemplate, removeAllLicenseHeaders, removeLicenseHeader } from './commands';

export function activate(context: vscode.ExtensionContext) {
    console.log('Activating "license-header-manager"...');

    context.subscriptions.push(registerEditorCommand("add-license-header", addLicenseHeader));
    context.subscriptions.push(registerEditorCommand("remove-license-header", removeLicenseHeader));

    context.subscriptions.push(registerEditorCommand("add-template", addTemplate));

    context.subscriptions.push(registerCommand("global.add-license-header", addAllLicenseHeaders));
    context.subscriptions.push(registerCommand("global.remove-license-header", removeAllLicenseHeaders));

    context.subscriptions.push(vscode.workspace.onWillSaveTextDocument((e) => {
        const config = vscode.workspace.getConfiguration("license-header-manager", e.document.uri);
        const update = config.get<boolean>("autoUpdate");
        if (!update) {
            //Auto-update is disabled.
            return;
        }
        vscode.commands.executeCommand("license-header-manager.add-license-header");
    }));

    context.subscriptions.push(vscode.languages.registerCompletionItemProvider("ltf", new LTFCompletionProvider()));
}

export function deactivate() {}
