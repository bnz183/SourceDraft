import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  analyzeDocumentOutline,
  extractDocumentHeadings,
} from "./documentOutline.js";

describe("document outline", () => {
  it("extracts ATX headings with levels and offsets", () => {
    const body = "Intro\n\n## Section one\n\nParagraph\n\n### Detail";
    const headings = extractDocumentHeadings(body);

    assert.equal(headings.length, 2);
    assert.deepEqual(headings[0], {
      level: 2,
      text: "Section one",
      lineIndex: 2,
      startOffset: 7,
    });
    assert.equal(headings[1]?.level, 3);
    assert.equal(headings[1]?.text, "Detail");
  });

  it("detects multiple H1 headings", () => {
    const analysis = analyzeDocumentOutline("# One\n\n# Two\n\n## Sub");
    assert.equal(analysis.h1Count, 2);
    assert.equal(analysis.hasSubheading, true);
  });

  it("flags missing subheading structure", () => {
    const analysis = analyzeDocumentOutline("# Only top level");
    assert.equal(analysis.h1Count, 1);
    assert.equal(analysis.hasSubheading, false);
  });
});
