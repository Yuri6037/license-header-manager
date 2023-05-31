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
import { SAMPLE_EMPTY, SAMPLE_RS, SAMPLE_SHELL_RESERVED, SAMPLE_TOML, SAMPLE_XML, SAMPLE_XML_RESERVED } from './samples';
import { addSuite } from './tool';

addSuite("Remove", (tool) => {
	test("rust", async () => {
		await tool.writeFile("test.rs", SAMPLE_RS);
		await tool.writeFile("test.empty.rs", SAMPLE_EMPTY);
		await tool.writeTemplate("test.rs");
		await tool.writeHeader("test.rs");
        await tool.writeHeader("test.empty.rs");
        assert.strictEqual(await tool.removeHeader("test.rs"), SAMPLE_RS);
        assert.strictEqual(await tool.removeHeader("test.empty.rs"), SAMPLE_EMPTY);
	});

	test("xml", async () => {
		await tool.writeFile("test.xml", SAMPLE_XML);
		await tool.writeFile("test.reserved.xml", SAMPLE_XML_RESERVED);
		await tool.writeTemplate("test.xml");
        await tool.writeHeader("test.xml");
        await tool.writeHeader("test.reserved.xml");
		assert.strictEqual(await tool.removeHeader("test.xml"), SAMPLE_XML);
		assert.strictEqual(await tool.removeHeader("test.reserved.xml"), SAMPLE_XML_RESERVED);
	});

	test("toml", async () => {
		await tool.writeFile("test.toml", SAMPLE_TOML);
		await tool.writeTemplate("test.toml");
        await tool.writeHeader("test.toml");
		assert.strictEqual(await tool.removeHeader("test.toml"), SAMPLE_TOML);
	});

	test("shell", async () => {
		await tool.writeFile("test.reserved.sh", SAMPLE_SHELL_RESERVED);
		await tool.writeTemplate("test.reserved.sh");
        await tool.writeHeader("test.reserved.sh");
		assert.strictEqual(await tool.removeHeader("test.reserved.sh"), SAMPLE_SHELL_RESERVED);
	});
});
