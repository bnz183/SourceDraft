import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { detectSetup, isSafeToApplySuggestion } from "./detectSetup.js";

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

describe("detectSetup", () => {
  it("detects Astro MDX projects", () => {
    const root = mkdtempSync(join(tmpdir(), "detect-astro-"));
    writeFileSync(join(root, "astro.config.mjs"), "export default {};\n", "utf8");
    writeJson(join(root, "package.json"), {
      dependencies: { astro: "^5.0.0" },
    });
    mkdirSync(join(root, "src/content/blog"), { recursive: true });
    writeFileSync(join(root, "src/content/blog/post.mdx"), "---\ntitle: Hi\n---\n", "utf8");

    const result = detectSetup(root);
    assert.equal(result.detected, true);
    assert.equal(result.primary?.adapter, "astro-mdx");
    assert.equal(result.primary?.contentDir, "src/content/blog");
    assert.equal(result.primary?.contentRoot, "src/content/blog");
    assert.ok((result.primary?.postFileCount ?? 0) >= 1);
    assert.ok((result.primary?.confidence ?? 0) >= 70);
    assert.ok(result.onboardingMessage?.includes("Astro"));
    assert.ok(result.onboardingMessage?.includes("AI-assisted"));
  });

  it("detects Next.js MDX projects", () => {
    const root = mkdtempSync(join(tmpdir(), "detect-next-"));
    writeFileSync(join(root, "next.config.ts"), "export default {};\n", "utf8");
    writeJson(join(root, "package.json"), {
      dependencies: { next: "^15.0.0" },
    });
    mkdirSync(join(root, "content/posts"), { recursive: true });
    writeFileSync(join(root, "content/posts/post.mdx"), "---\ntitle: Hi\n---\n", "utf8");

    const result = detectSetup(root);
    assert.equal(result.primary?.adapter, "nextjs-mdx");
    assert.ok((result.primary?.confidence ?? 0) >= 70);
  });

  it("detects Hugo projects", () => {
    const root = mkdtempSync(join(tmpdir(), "detect-hugo-"));
    writeFileSync(join(root, "hugo.toml"), "baseURL = '/'\n", "utf8");
    mkdirSync(join(root, "content/posts"), { recursive: true });
    writeFileSync(join(root, "content/posts/post.md"), "---\ntitle: Hi\n---\n", "utf8");

    const result = detectSetup(root);
    assert.equal(result.primary?.adapter, "hugo-markdown");
    assert.equal(result.primary?.contentDir, "content/posts");
    assert.ok((result.primary?.postFileCount ?? 0) >= 1);
    assert.ok(result.primary?.frontmatter?.fields.some((field) => field.key === "title"));
    assert.ok((result.primary?.confidence ?? 0) >= 50);
  });

  it("detects Eleventy projects", () => {
    const root = mkdtempSync(join(tmpdir(), "detect-11ty-"));
    writeFileSync(join(root, ".eleventy.js"), "module.exports = {};\n", "utf8");
    writeJson(join(root, "package.json"), {
      devDependencies: { "@11ty/eleventy": "^3.0.0" },
    });
    mkdirSync(join(root, "src/posts"), { recursive: true });
    writeFileSync(join(root, "src/posts/post.md"), "---\ntitle: Hi\n---\n", "utf8");

    const result = detectSetup(root);
    assert.equal(result.primary?.adapter, "eleventy-jekyll-markdown");
    assert.ok((result.primary?.confidence ?? 0) >= 70);
  });

  it("detects Jekyll projects", () => {
    const root = mkdtempSync(join(tmpdir(), "detect-jekyll-"));
    writeFileSync(join(root, "_config.yml"), "title: Blog\n", "utf8");
    writeFileSync(join(root, "Gemfile"), 'gem "jekyll"\n', "utf8");
    mkdirSync(join(root, "_posts"), { recursive: true });
    writeFileSync(join(root, "_posts/2024-01-01-post.md"), "---\ntitle: Hi\n---\n", "utf8");

    const result = detectSetup(root);
    assert.equal(result.primary?.framework, "Jekyll");
    assert.ok((result.primary?.confidence ?? 0) >= 50);
  });

  it("detects Docusaurus projects", () => {
    const root = mkdtempSync(join(tmpdir(), "detect-docusaurus-"));
    writeFileSync(join(root, "docusaurus.config.js"), "module.exports = {};\n", "utf8");
    writeJson(join(root, "package.json"), {
      dependencies: { "@docusaurus/core": "^3.0.0" },
    });
    mkdirSync(join(root, "blog"), { recursive: true });
    writeFileSync(join(root, "blog/post.mdx"), "---\ntitle: Hi\n---\n", "utf8");

    const result = detectSetup(root);
    assert.equal(result.primary?.adapter, "docusaurus-mdx");
    assert.ok((result.primary?.confidence ?? 0) >= 70);
  });

  it("detects MkDocs projects", () => {
    const root = mkdtempSync(join(tmpdir(), "detect-mkdocs-"));
    writeFileSync(join(root, "mkdocs.yml"), "site_name: Docs\n", "utf8");
    mkdirSync(join(root, "docs"), { recursive: true });
    writeFileSync(join(root, "docs/page.md"), "# Page\n", "utf8");

    const result = detectSetup(root);
    assert.equal(result.primary?.adapter, "mkdocs-markdown");
    assert.ok((result.primary?.confidence ?? 0) >= 70);
  });

  it("detects Nuxt Content projects", () => {
    const root = mkdtempSync(join(tmpdir(), "detect-nuxt-"));
    writeFileSync(
      join(root, "nuxt.config.ts"),
      'export default { modules: ["@nuxt/content"] }\n',
      "utf8",
    );
    writeJson(join(root, "package.json"), {
      dependencies: { nuxt: "^3.0.0", "@nuxt/content": "^2.0.0" },
    });
    mkdirSync(join(root, "content/blog"), { recursive: true });
    writeFileSync(join(root, "content/blog/post.md"), "---\ntitle: Hi\n---\n", "utf8");

    const result = detectSetup(root);
    assert.equal(result.primary?.adapter, "nuxt-content-markdown");
    assert.ok((result.primary?.confidence ?? 0) >= 70);
  });

  it("marks low-confidence suggestions as unsafe to auto-apply", () => {
    const root = mkdtempSync(join(tmpdir(), "detect-low-"));
    const result = detectSetup(root);
    assert.equal(result.detected, false);
    if (result.primary) {
      assert.equal(isSafeToApplySuggestion(result.primary), false);
    }
  });
});
