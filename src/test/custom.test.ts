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

import assert = require("assert");
import { JsonLangConfig } from "../langmap";
import { addSuite } from "./tool";

const CONFIG: JsonLangConfig = {
    extensions: ["ctf"],
    startComment: "<<",
    middleComment: "| ",
    endComment: ">>",
    reserved: {
        numLines: 1,
        regex: {
            pattern: "\\(CTF!\\)",
            flags: "m"
        }
    }
};

const VSCODE_CONFIG = `{
    "license-header-manager.languages": [
        ${JSON.stringify(CONFIG)}
    ]
}`;

const EXPECTED = `(CTF!) <<
| This is the default test license template.
>>

test: 42`;

const sleep = (ms: number) => new Promise( res => setTimeout(res, ms));

addSuite("Custom", (tool) => {
    test("ctf", async () => {
        await tool.writeFile("test.ctf", "(CTF!) test: 42");
        await tool.writeTemplate("test.ctf");
        await tool.writeFile(".vscode/settings.json", VSCODE_CONFIG);
        await sleep(500); //We need a sleep otherwise somehow nodejs returns from the await before the file is completely written.
        const text = await tool.writeHeader("test.ctf");
        assert.strictEqual(text, EXPECTED);
    }).timeout(0);
});