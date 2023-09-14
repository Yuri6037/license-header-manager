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

import path = require("path");
import util = require("util");
import fs = require("fs");
import os = require("os");
import { EndOfLine, Uri, workspace } from "vscode";

const mkdir = util.promisify(fs.mkdir);
const lstat = util.promisify(fs.lstat);
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);
const readdir = util.promisify(fs.readdir);

export type FileInfo = {
    eol: EndOfLine,
    filePath: string
};

const DEFAULT_TEMPLATE = `This is the default license template.

File: {File}
Author: {Username}
Copyright (c) {CurrentYear} {Username}`;

/**
 * License Template File Manager
 */
export class LTFManager {
    private templateRoot: string;

    /**
     * Constructs a new LTFManager for the given URI.
     * @param uri the URI of a file in the workspace.
     */
    constructor(uri: Uri) {
        const folder = workspace.getWorkspaceFolder(uri);
        if (!folder) {
            throw new Error("No workspace folder");
        }
        const p = folder.uri.fsPath;
        this.templateRoot = path.join(p, ".vscode", "templates");
    }

    async createDirectory() {
        try {
            await lstat(this.templateRoot);
        } catch {
            await mkdir(this.templateRoot, { recursive: true });
        }
    }

    async newTemplate(ext: string): Promise<string> {
        await this.createDirectory();
        const p = this.getTemplatePath(ext);
        if (await this.hasTemplate(ext)) {
            return p;
        }
        await writeFile(p, DEFAULT_TEMPLATE);
        return p;
    }

    getTemplatePath(ext: string): string {
        return path.join(this.templateRoot, ext + ".ltf");
    }

    getTemplateExt(p: string): string | null {
        const pp = path.parse(p);
        if (!pp) {
            return null;
        }
        //NodeJS definition of ext is wrong: ext means extension not the '.' character followed by the extension!!!
        const correctedExt = pp.ext.substring(1);
        if (correctedExt === "ltf") {
            return null;
        }
        return correctedExt;
    }

    async loadTemplate(ext: string, info: FileInfo): Promise<string[]> {
        let text = await readFile(this.getTemplatePath(ext), "utf-8");
        const stat = await lstat(info.filePath);
        const creationDate = stat.birthtime;
        const date = new Date();
        const replacements = {
            ["File"]: path.basename(info.filePath),
            ["Path"]: info.filePath,
            ["CurrentYear"]: date.getFullYear().toString(),
            ["CurrentMonth"]: date.getMonth().toString(),
            ["CurrentDay"]: date.getDate().toString(),
            ["CurrentDate"]: date.toString(),
            ["CreationYear"]: creationDate.getFullYear().toString(),
            ["CreationMonth"]: (creationDate.getMonth() + 1).toString(),
            ["CreationDay"]: creationDate.getDate().toString(),
            ["CreationDate"]: creationDate.toString(),
            ["Username"]: os.userInfo().username
        };
        for (var [key, value] of Object.entries(replacements)) {
            text = text.replace(new RegExp("{" + key + "}", "gm"), value);
        }
        switch (info.eol) {
            case EndOfLine.LF:
                return text.split("\n");
            case EndOfLine.CRLF:
                return text.split("\r\n");
        }
    }

    async hasTemplate(ext: string): Promise<boolean> {
        try {
            const s = await lstat(this.getTemplatePath(ext));
            return s.isFile();
        } catch {
            return false;
        }
    }

    async listSupportedExtensions(): Promise<string[]> {
        const arr = [];
        const files = await readdir(this.templateRoot);
        for (const f of files) {
            if (f.endsWith(".ltf")) {
                const ext = f.substring(0, f.lastIndexOf("."));
                arr.push(ext);
            }
        }
        return arr;
    }
}
