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
import * as assert from 'assert';
import { SAMPLE_EMPTY, SAMPLE_EMPTY_FILLED, SAMPLE_RS, SAMPLE_RS_FILLED, SAMPLE_SHELL_RESERVED, SAMPLE_SHELL_RESERVED_FILLED, SAMPLE_TOML, SAMPLE_TOML_FILLED, SAMPLE_XML, SAMPLE_XML_FILLED, SAMPLE_XML_RESERVED, SAMPLE_XML_RESERVED_FILLED } from './samples';
import { addSuite } from './tool';

addSuite("Global", (tool) => {
    test("add", async () => {
        await tool.writeFile("test.rs", SAMPLE_RS);
        await tool.writeFile("test.empty.rs", SAMPLE_EMPTY);
        await tool.writeFile("test.xml", SAMPLE_XML);
        await tool.writeFile("test.reserved.xml", SAMPLE_XML_RESERVED);
        await tool.writeFile("test.toml", SAMPLE_TOML);
        await tool.writeFile("test.reserved.sh", SAMPLE_SHELL_RESERVED);
        await tool.writeTemplate("test.rs");
        await tool.writeTemplate("test.xml");
        await tool.writeTemplate("test.toml");
        await tool.writeTemplate("test.reserved.sh");
        await vscode.commands.executeCommand("license-header-manager.global.add-license-header");
        assert.strictEqual(await tool.readFile("test.rs"), SAMPLE_RS_FILLED);
        assert.strictEqual(await tool.readFile("test.empty.rs"), SAMPLE_EMPTY_FILLED);
        assert.strictEqual(await tool.readFile("test.xml"), SAMPLE_XML_FILLED);
        assert.strictEqual(await tool.readFile("test.reserved.xml"), SAMPLE_XML_RESERVED_FILLED);
        assert.strictEqual(await tool.readFile("test.toml"), SAMPLE_TOML_FILLED);
        assert.strictEqual(await tool.readFile("test.reserved.sh"), SAMPLE_SHELL_RESERVED_FILLED);
    });

    test("remove", async () => {
        await tool.writeFile("test.rs", SAMPLE_RS_FILLED);
        await tool.writeFile("test.empty.rs", SAMPLE_EMPTY_FILLED);
        await tool.writeFile("test.xml", SAMPLE_XML_FILLED);
        await tool.writeFile("test.reserved.xml", SAMPLE_XML_RESERVED_FILLED);
        await tool.writeFile("test.toml", SAMPLE_TOML_FILLED);
        await tool.writeFile("test.reserved.sh", SAMPLE_SHELL_RESERVED_FILLED);
        await tool.writeTemplate("test.rs");
        await tool.writeTemplate("test.xml");
        await tool.writeTemplate("test.toml");
        await tool.writeTemplate("test.reserved.sh");
        await vscode.commands.executeCommand("license-header-manager.global.remove-license-header");
        assert.strictEqual(await tool.readFile("test.rs"), SAMPLE_RS);
        assert.strictEqual(await tool.readFile("test.empty.rs"), SAMPLE_EMPTY);
        assert.strictEqual(await tool.readFile("test.xml"), SAMPLE_XML);
        assert.strictEqual(await tool.readFile("test.reserved.xml"), SAMPLE_XML_RESERVED);
        assert.strictEqual(await tool.readFile("test.toml"), SAMPLE_TOML);
        assert.strictEqual(await tool.readFile("test.reserved.sh"), SAMPLE_SHELL_RESERVED);
    });
});
