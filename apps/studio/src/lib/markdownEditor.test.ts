import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  actionForShortcut,
  applyMarkdownAction,
  type TextSelection,
} from "./markdownEditor.js";

function sel(start: number, end: number): TextSelection {
  return { start, end };
}

describe("applyMarkdownAction", () => {
  it("wraps bold and italic selections", () => {
    const bold = applyMarkdownAction("Hello world", sel(6, 11), "bold");
    assert.equal(bold.value, "Hello **world**");
    assert.equal(bold.selectionStart, 8);
    assert.equal(bold.selectionEnd, 13);

    const italic = applyMarkdownAction("Hello world", sel(6, 11), "italic");
    assert.equal(italic.value, "Hello *world*");

    const emptyItalic = applyMarkdownAction("Hello world", sel(0, 0), "italic");
    assert.equal(emptyItalic.value, "*italic text*Hello world");
  });

  it("inserts link syntax with placeholder", () => {
    const result = applyMarkdownAction("Text", sel(0, 4), "link");
    assert.equal(result.value, "[Text](https://)");
  });

  it("applies heading prefixes to selected lines", () => {
    const text = "First line\nSecond line";
    const result = applyMarkdownAction(text, sel(0, text.length), "h2");
    assert.equal(result.value, "## First line\n## Second line");
  });

  it("applies list and blockquote prefixes", () => {
    const text = "One\nTwo";
    const bullets = applyMarkdownAction(text, sel(0, text.length), "bullet-list");
    assert.equal(bullets.value, "- One\n- Two");

    const numbered = applyMarkdownAction(text, sel(0, text.length), "numbered-list");
    assert.equal(numbered.value, "1. One\n2. Two");

    const quote = applyMarkdownAction("Quote me", sel(0, 8), "blockquote");
    assert.equal(quote.value, "> Quote me");
  });

  it("inserts inline and fenced code", () => {
    const inline = applyMarkdownAction("value", sel(0, 5), "inline-code");
    assert.equal(inline.value, "`value`");

    const block = applyMarkdownAction("line one", sel(0, 8), "code-block");
    assert.equal(block.value, "```\nline one\n```");
  });

  it("inserts image markdown with alt text", () => {
    const result = applyMarkdownAction("Caption", sel(0, 7), "image", {
      imagePath: "/images/photo.png",
      imageAlt: "Fallback",
    });
    assert.equal(result.value, "![Caption](/images/photo.png)");
  });

  it("maps keyboard shortcuts to actions", () => {
    assert.equal(actionForShortcut("b"), "bold");
    assert.equal(actionForShortcut("I"), "italic");
    assert.equal(actionForShortcut("k"), "link");
    assert.equal(actionForShortcut("z"), null);
  });
});
