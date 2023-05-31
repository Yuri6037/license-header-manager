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

import { EndOfLine, Position, Range, TextEditor, TextEditorEdit, Uri } from "vscode";

export type ReservedLinesConfig = {
    regex: RegExp,
    numLines: number
};

export type LangConfig = {
    reserved: ReservedLinesConfig | null;
    startComment: string | null;
    middleComment: string | null;
    endComment: string;
};

export type NullableRange = {
    start: Position,
    end: Position | null
};

/**
 * Minimalistic parser intended to get the start and the end of the header comment block.
 */
export class Parser {
    private config: LangConfig;
    private editor: TextEditor;

    constructor(config: LangConfig, editor: TextEditor) {
        this.config = config;
        this.editor = editor;
    }

    private getCommentBlockRange(): NullableRange {
        let startPos = new Position(0, 0);
        if (this.config.reserved) {
            let id = 0;
            let text = "";
            let m = null;
            while (id < this.config.reserved.numLines) {
                const line = this.editor.document.lineAt(id++);
                text += line.text + "\n";
                m = this.config.reserved.regex.exec(text);
                if (m) {
                    break;
                }
            }
            if (m) {
                startPos = this.editor.document.positionAt(m.index + m[0].length + 1);
            }
        }
        let id = 0;
        let endPos = null;
        while (id < this.editor.document.lineCount) {
            const line = this.editor.document.lineAt(id++);
            if (line.text === this.config.endComment) {
                endPos = line.rangeIncludingLineBreak.end;
                break;
            }
            const flag1 = this.config.middleComment !== null && !line.text.startsWith(this.config.middleComment.trimEnd());
            if (flag1) {
                const flag = this.config.startComment !== null && line.text === this.config.startComment;
                if (flag) {
                    continue;
                }
                break;
            }
        }
        return {
            start: startPos,
            end: endPos
        };
    }

    withEol(line: string): string {
        switch (this.editor.document.eol) {
            case EndOfLine.LF:
                return line + "\n";
            case EndOfLine.CRLF:
                return line + "\r\n";
        }
    }

    private genLicenseBlock(range: NullableRange, license: string[]): string {
        let text = "";
        if (this.config.startComment) {
            text += this.withEol(this.config.startComment);
        }
        for (const line of license) {
            let full = "";
            if (this.config.middleComment) {
                full += this.config.middleComment;
            }
            full += line;
            full = full.trimEnd();
            text += this.withEol(full);
        }
        text += this.withEol(this.config.endComment);
        if (range.end === null && this.config.endComment.length > 0) {
            text += this.withEol("");
        }
        return text;
    }

    getLicenseBlockRange(): Range | null {
        const range = this.getCommentBlockRange();
        if (!range.end) {
            return null;
        }
        if (this.config.endComment.length > 0) {
            range.end = new Position(range.end.line + 1, range.end.character);
        }
        return new Range(range.start, range.end);
    }

    needsCommentBlockUpdate(license: string[]) {
        const range = this.getCommentBlockRange();
        const text = this.genLicenseBlock(range, license);
        if (range.end === null) {
            return true;
        }
        const editorText = this.editor.document.getText(new Range(range.start, range.end));
        return editorText !== text;
    }

    addOrUpdateCommentBlock(edit: TextEditorEdit, license: string[]) {
        const range = this.getCommentBlockRange();
        if (range.end !== null) {
            edit.delete(new Range(range.start, range.end));
        }
        const text = this.genLicenseBlock(range, license);
        edit.insert(range.start, text);
    }
}
