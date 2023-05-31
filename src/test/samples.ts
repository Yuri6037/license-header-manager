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

export const SAMPLE_RS = `fn main() {}`;
export const SAMPLE_RS_FILLED = `/*
 * This is the default test license template.
 */

fn main() {}`;

export const SAMPLE_EMPTY = ``;
export const SAMPLE_EMPTY_FILLED = `/*
 * This is the default test license template.
 */

`;

export const SAMPLE_XML = `<xml>
    <param>value</param>
</xml>`;
export const SAMPLE_XML_FILLED = `<!--
This is the default test license template.
-->

<xml>
    <param>value</param>
</xml>`;

export const SAMPLE_XML_RESERVED = `<?xml version="1.0" encoding="UTF-8" ?>
<xml>
    <param>value</param>
</xml>`;
export const SAMPLE_XML_RESERVED_FILLED = `<?xml version="1.0" encoding="UTF-8" ?>
<!--
This is the default test license template.
-->

<xml>
    <param>value</param>
</xml>`;

export const SAMPLE_TOML = `key = true`;
export const SAMPLE_TOML_FILLED = `# This is the default test license template.

key = true`;

export const SAMPLE_SHELL_RESERVED = `#!/bin/bash
key = true`;
export const SAMPLE_SHELL_RESERVED_FILLED = `#!/bin/bash
# This is the default test license template.

key = true`;

export const TEST_TEMPLATE_TEXT = "This is the default test license template.";
