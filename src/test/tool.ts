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

import * as assert from 'assert';
import * as vscode from 'vscode';
import util = require("util");
import fs = require("fs");
import path = require("path");
import { TEST_TEMPLATE_TEXT } from './samples';

const readdir = util.promisify(fs.readdir);
const rm = util.promisify(fs.rm);
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);

export class TestTool {
    private dir: string;

    constructor() {
        this.dir = "";
    }

    async setup() {
        this.dir = path.join(path.resolve(__dirname, "..", ".."), "test-workspace");
        await this.cleanup();
    }

    async cleanup() {
        const files = await readdir(this.dir);
        for (const file of files) {
            if (file !== ".gitkeep") {
                await rm(this.getPath(file), { recursive: true });
            }
        }
    }

    getPath(p: string): string {
        return path.join(this.dir, p);
    }

    getUri(p: string): vscode.Uri {
        return vscode.Uri.file(this.getPath(p));
    }

    async writeFile(p: string, data: string) {
        await writeFile(this.getPath(p), data);
    }

    async readFile(p: string): Promise<string> {
        return await readFile(this.getPath(p), "utf8");
    }

    async writeTemplate(p: string) {
        await vscode.commands.executeCommand("vscode.open", this.getUri(p));
		await vscode.commands.executeCommand("yuri-license-header-manager.add-template");
		assert.notStrictEqual(vscode.window.activeTextEditor, undefined);
        await writeFile(vscode.window.activeTextEditor!.document.uri.fsPath, TEST_TEMPLATE_TEXT);
    }

    async writeHeader(p: string): Promise<string> {
        await vscode.commands.executeCommand("vscode.open", this.getUri(p));
		await vscode.commands.executeCommand("yuri-license-header-manager.add-license-header");
		await vscode.commands.executeCommand("workbench.action.files.saveAll");
        return await readFile(this.getPath(p), "utf8");
    }

    async removeHeader(p: string): Promise<string> {
        await vscode.commands.executeCommand("vscode.open", this.getUri(p));
		await vscode.commands.executeCommand("yuri-license-header-manager.remove-license-header");
		await vscode.commands.executeCommand("workbench.action.files.saveAll");
        return await readFile(this.getPath(p), "utf8");
    }
}

export function addSuite(name: string, callback: (tool: TestTool) => void) {
    suite(name, () => {
        const tool = new TestTool();

        setup(async () => {
            await tool.setup();
        });

        teardown(async () => {
            await tool.cleanup();
        });

        callback(tool);
    });
}
