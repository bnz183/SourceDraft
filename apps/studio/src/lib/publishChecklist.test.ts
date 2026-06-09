import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createInitialFormState } from "./articleForm.js";
import { buildPublishChecklist } from "./publishChecklist.js";

describe("publish checklist", () => {
  it("includes validation, output path, and publish mode", () => {
    const values = {
      ...createInitialFormState("Guides"),
      title: "Checklist post",
      slug: "checklist-post",
      description: "Summary",
      body: "# Hello\n\nBody copy.",
      draft: true,
    };

    const checklist = buildPublishChecklist({
      valid: true,
      issues: [],
      values,
      outputPath: "src/content/blog/checklist-post.mdx",
      publishMode: "pull-request",
      baseBranch: "main",
      prBranchPreview: "sourcedraft/checklist-post",
      knownPostSlugs: ["other-post"],
    });

    const labels = checklist.items.map((item) => item.id);
    assert.ok(labels.includes("validation"));
    assert.ok(labels.includes("output-path"));
    assert.ok(labels.includes("publish-mode"));
    assert.ok(labels.includes("pr-branch"));
    assert.ok(labels.includes("draft-status"));
    assert.equal(
      checklist.items.find((item) => item.id === "draft-status")?.value,
      "Draft",
    );
  });

  it("marks validation errors in checklist", () => {
    const checklist = buildPublishChecklist({
      valid: false,
      issues: [{ field: "title", message: "Title is required." }],
      values: createInitialFormState("Guides"),
      outputPath: null,
      publishMode: "direct",
      baseBranch: "main",
      prBranchPreview: null,
      knownPostSlugs: [],
    });

    const validation = checklist.items.find((item) => item.id === "validation");
    assert.equal(validation?.status, "error");
  });
});
