import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { derivePublicMediaPath } from "@sourcedraft/config";

export type SetupDetectionSuggestion = {
  framework: string;
  adapter: string;
  contentDir: string;
  mediaDir: string;
  publicMediaPath: string;
  defaultBranch: string;
  confidence: number;
  explanation: string;
  warnings: string[];
};

export type SetupDetectionResult = {
  scannedRoot: string;
  detected: boolean;
  primary: SetupDetectionSuggestion | null;
  alternatives: SetupDetectionSuggestion[];
  warnings: string[];
};

type FrameworkRule = {
  framework: string;
  adapter: string;
  contentDir: string;
  mediaDir: string;
  score: (root: string) => { points: number; signals: string[]; warnings: string[] };
};

function readText(path: string): string | null {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return null;
  }
}

function pathExists(path: string): boolean {
  return existsSync(path);
}

function dirHasFilesWithExtension(dir: string, extensions: string[]): boolean {
  if (!pathExists(dir)) {
    return false;
  }

  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isFile()) {
        if (extensions.some((ext) => entry.name.endsWith(ext))) {
          return true;
        }
      } else if (entry.isDirectory()) {
        if (dirHasFilesWithExtension(fullPath, extensions)) {
          return true;
        }
      }
    }
  } catch {
    return false;
  }

  return false;
}

function packageJson(root: string): Record<string, unknown> | null {
  const raw = readText(join(root, "package.json"));
  if (raw === null) {
    return null;
  }

  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function dependencyNames(pkg: Record<string, unknown> | null): Set<string> {
  const names = new Set<string>();
  if (pkg === null) {
    return names;
  }

  for (const section of ["dependencies", "devDependencies"]) {
    const value = pkg[section];
    if (value && typeof value === "object") {
      for (const key of Object.keys(value as Record<string, unknown>)) {
        names.add(key);
      }
    }
  }

  return names;
}

function detectDefaultBranch(root: string): string {
  const headPath = join(root, ".git", "HEAD");
  const head = readText(headPath);
  if (head?.startsWith("ref: refs/heads/")) {
    return head.slice("ref: refs/heads/".length).trim();
  }

  return "main";
}

const FRAMEWORK_RULES: FrameworkRule[] = [
  {
    framework: "Astro MDX",
    adapter: "astro-mdx",
    contentDir: "src/content/blog",
    mediaDir: "public/images",
    score(root) {
      const signals: string[] = [];
      const warnings: string[] = [];
      let points = 0;
      const deps = dependencyNames(packageJson(root));

      if (
        pathExists(join(root, "astro.config.mjs")) ||
        pathExists(join(root, "astro.config.ts")) ||
        pathExists(join(root, "astro.config.js"))
      ) {
        points += 35;
        signals.push("astro.config found");
      }

      if (deps.has("astro")) {
        points += 40;
        signals.push("astro dependency in package.json");
      }

      if (dirHasFilesWithExtension(join(root, "src/content"), [".mdx", ".md"])) {
        points += 20;
        signals.push("content files under src/content");
      }

      if (points > 0 && !deps.has("astro")) {
        warnings.push("Astro config markers found but astro is not in package.json dependencies.");
      }

      return { points, signals, warnings };
    },
  },
  {
    framework: "Next.js MDX",
    adapter: "nextjs-mdx",
    contentDir: "content/posts",
    mediaDir: "public/images",
    score(root) {
      const signals: string[] = [];
      const warnings: string[] = [];
      let points = 0;
      const deps = dependencyNames(packageJson(root));

      if (
        pathExists(join(root, "next.config.mjs")) ||
        pathExists(join(root, "next.config.ts")) ||
        pathExists(join(root, "next.config.js"))
      ) {
        points += 35;
        signals.push("next.config found");
      }

      if (deps.has("next")) {
        points += 40;
        signals.push("next dependency in package.json");
      }

      if (dirHasFilesWithExtension(join(root, "content"), [".mdx", ".md"])) {
        points += 15;
        signals.push("content files under content/");
      }

      return { points, signals, warnings };
    },
  },
  {
    framework: "Hugo",
    adapter: "hugo-markdown",
    contentDir: "content/posts",
    mediaDir: "static/images",
    score(root) {
      const signals: string[] = [];
      const warnings: string[] = [];
      let points = 0;

      if (pathExists(join(root, "hugo.toml")) || pathExists(join(root, "config.toml"))) {
        points += 45;
        signals.push("hugo.toml or config.toml found");
      }

      if (pathExists(join(root, "archetypes"))) {
        points += 10;
        signals.push("archetypes/ directory found");
      }

      if (dirHasFilesWithExtension(join(root, "content"), [".md"])) {
        points += 25;
        signals.push("markdown files under content/");
      }

      const gemfile = readText(join(root, "Gemfile"));
      if (gemfile?.includes("hugo")) {
        points += 10;
        signals.push("Hugo mentioned in Gemfile");
      }

      return { points, signals, warnings };
    },
  },
  {
    framework: "Eleventy",
    adapter: "eleventy-jekyll-markdown",
    contentDir: "src/posts",
    mediaDir: "src/images",
    score(root) {
      const signals: string[] = [];
      const warnings: string[] = [];
      let points = 0;
      const deps = dependencyNames(packageJson(root));

      if (
        pathExists(join(root, ".eleventy.js")) ||
        pathExists(join(root, ".eleventy.cjs")) ||
        pathExists(join(root, "eleventy.config.js"))
      ) {
        points += 50;
        signals.push("Eleventy config found");
      }

      if (deps.has("@11ty/eleventy")) {
        points += 30;
        signals.push("@11ty/eleventy dependency");
      }

      if (
        dirHasFilesWithExtension(join(root, "src/posts"), [".md"]) ||
        dirHasFilesWithExtension(join(root, "_posts"), [".md"])
      ) {
        points += 15;
        signals.push("post markdown files found");
      }

      return { points, signals, warnings };
    },
  },
  {
    framework: "Jekyll",
    adapter: "eleventy-jekyll-markdown",
    contentDir: "_posts",
    mediaDir: "assets/images",
    score(root) {
      const signals: string[] = [];
      const warnings: string[] = [];
      let points = 0;

      if (pathExists(join(root, "_config.yml"))) {
        points += 35;
        signals.push("_config.yml found");
      }

      const gemfile = readText(join(root, "Gemfile"));
      if (gemfile?.toLowerCase().includes("jekyll")) {
        points += 35;
        signals.push("jekyll in Gemfile");
      }

      if (dirHasFilesWithExtension(join(root, "_posts"), [".md"])) {
        points += 20;
        signals.push("_posts/ markdown files");
      }

      if (pathExists(join(root, ".eleventy.js"))) {
        points -= 20;
        warnings.push("Eleventy config also present — Jekyll score reduced.");
      }

      return { points, signals, warnings };
    },
  },
  {
    framework: "Docusaurus",
    adapter: "docusaurus-mdx",
    contentDir: "blog",
    mediaDir: "static/img",
    score(root) {
      const signals: string[] = [];
      const warnings: string[] = [];
      let points = 0;
      const deps = dependencyNames(packageJson(root));

      if (
        pathExists(join(root, "docusaurus.config.js")) ||
        pathExists(join(root, "docusaurus.config.ts"))
      ) {
        points += 50;
        signals.push("docusaurus.config found");
      }

      if (deps.has("@docusaurus/core")) {
        points += 35;
        signals.push("@docusaurus/core dependency");
      }

      if (dirHasFilesWithExtension(join(root, "blog"), [".mdx", ".md"])) {
        points += 15;
        signals.push("blog/ content files");
      }

      return { points, signals, warnings };
    },
  },
  {
    framework: "MkDocs",
    adapter: "mkdocs-markdown",
    contentDir: "docs",
    mediaDir: "docs/images",
    score(root) {
      const signals: string[] = [];
      const warnings: string[] = [];
      let points = 0;

      if (pathExists(join(root, "mkdocs.yml")) || pathExists(join(root, "mkdocs.yaml"))) {
        points += 60;
        signals.push("mkdocs.yml found");
      }

      if (dirHasFilesWithExtension(join(root, "docs"), [".md"])) {
        points += 25;
        signals.push("docs/ markdown files");
      }

      return { points, signals, warnings };
    },
  },
  {
    framework: "Nuxt Content",
    adapter: "nuxt-content-markdown",
    contentDir: "content",
    mediaDir: "public/images",
    score(root) {
      const signals: string[] = [];
      const warnings: string[] = [];
      let points = 0;
      const deps = dependencyNames(packageJson(root));
      const nuxtConfig =
        readText(join(root, "nuxt.config.ts")) ??
        readText(join(root, "nuxt.config.js")) ??
        "";

      if (nuxtConfig.includes("@nuxt/content") || deps.has("@nuxt/content")) {
        points += 45;
        signals.push("@nuxt/content configured");
      }

      if (deps.has("nuxt") || deps.has("@nuxt/kit")) {
        points += 20;
        signals.push("nuxt dependency");
      }

      if (dirHasFilesWithExtension(join(root, "content"), [".md", ".mdx"])) {
        points += 20;
        signals.push("content/ markdown files");
      }

      return { points, signals, warnings };
    },
  },
];

function buildSuggestion(
  rule: FrameworkRule,
  root: string,
  scored: { points: number; signals: string[]; warnings: string[] },
): SetupDetectionSuggestion {
  const confidence = Math.min(100, Math.max(0, scored.points));
  const publicMediaPath = derivePublicMediaPath(rule.mediaDir);

  return {
    framework: rule.framework,
    adapter: rule.adapter,
    contentDir: rule.contentDir,
    mediaDir: rule.mediaDir,
    publicMediaPath,
    defaultBranch: detectDefaultBranch(root),
    confidence,
    explanation:
      scored.signals.length > 0
        ? scored.signals.join("; ")
        : "No strong framework markers found.",
    warnings: scored.warnings,
  };
}

export function detectSetup(root: string): SetupDetectionResult {
  const resolvedRoot = pathExists(root) && statSync(root).isDirectory() ? root : root;
  const warnings: string[] = [];

  if (!pathExists(resolvedRoot)) {
    return {
      scannedRoot: resolvedRoot,
      detected: false,
      primary: null,
      alternatives: [],
      warnings: [`Scan root does not exist: ${resolvedRoot}`],
    };
  }

  const suggestions = FRAMEWORK_RULES.map((rule) => {
    const scored = rule.score(resolvedRoot);
    return buildSuggestion(rule, resolvedRoot, scored);
  })
    .filter((suggestion) => suggestion.confidence > 0)
    .sort((left, right) => right.confidence - left.confidence);

  if (suggestions.length === 0) {
    warnings.push(
      "No supported static-site framework markers were found. Run pnpm setup or configure sourcedraft.config.json manually.",
    );
    return {
      scannedRoot: resolvedRoot,
      detected: false,
      primary: null,
      alternatives: [],
      warnings,
    };
  }

  const [primary, ...alternatives] = suggestions;

  if (primary && primary.confidence < 50) {
    warnings.push(
      "Detection confidence is low. Review suggested paths before applying configuration.",
    );
  }

  if (alternatives.length > 0 && alternatives[0] && primary) {
    const gap = primary.confidence - alternatives[0].confidence;
    if (gap < 15) {
      warnings.push(
        `Multiple frameworks scored similarly (${primary.framework} vs ${alternatives[0].framework}). Confirm adapter manually.`,
      );
    }
  }

  return {
    scannedRoot: resolvedRoot,
    detected: primary !== undefined,
    primary: primary ?? null,
    alternatives,
    warnings,
  };
}

export function buildSuggestedConfigSnippet(
  suggestion: SetupDetectionSuggestion,
): string {
  return JSON.stringify(
    {
      adapter: suggestion.adapter,
      contentDir: suggestion.contentDir,
      mediaDir: suggestion.mediaDir,
      publicMediaPath: suggestion.publicMediaPath,
      defaultBranch: suggestion.defaultBranch,
      categories: ["Guides", "Notes", "Reviews", "Tutorials", "Reference"],
      adapterOptions: {},
      publisherOptions: {},
    },
    null,
    2,
  );
}

export function isSafeToApplySuggestion(suggestion: SetupDetectionSuggestion): boolean {
  return suggestion.confidence >= 70 && suggestion.warnings.length === 0;
}
