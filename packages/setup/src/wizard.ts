import { existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createInterface, type Interface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { listAdapterIds } from "@sourcedraft/adapters";
import {
  DEFAULT_SOURCEDRAFT_CATEGORIES_CSV,
  derivePublicMediaPath,
} from "@sourcedraft/config";
import { listMediaProviderIds } from "@sourcedraft/media-providers";
import { listPublisherIds } from "@sourcedraft/publishers";
import {
  backupEnvFile,
  loadEnvMap,
  mergeEnvMaps,
  serializeEnvFile,
  summarizeEnvUpdates,
} from "./envFile.js";
import {
  deployHookEnvRequirements,
  mediaProviderEnvRequirements,
  publisherEnvRequirements,
} from "./envRequirements.js";
import { formatEnvValueForDisplay } from "./maskSecrets.js";
import { detectSetup } from "./detectSetup.js";
import { buildOnboardingFailureMessage, buildOnboardingMessage } from "./onboardingCopy.js";
import { validateConfigAsync } from "./validateConfig.js";

export type WizardOptions = {
  cwd?: string;
  rl?: Interface;
  now?: () => Date;
};

export type WizardResult = {
  configPath: string;
  envPath: string;
  backupPath: string | null;
};

const ADAPTER_HINTS: Record<string, { contentDir: string; mediaDir: string }> = {
  "astro-mdx": { contentDir: "src/content/blog", mediaDir: "public/images" },
  "markdown": { contentDir: "content/posts", mediaDir: "static/images" },
  "nextjs-mdx": { contentDir: "content/posts", mediaDir: "public/images" },
  "hugo-markdown": { contentDir: "content/posts", mediaDir: "static/images" },
  "eleventy-jekyll-markdown": { contentDir: "_posts", mediaDir: "assets/images" },
  "docusaurus-mdx": { contentDir: "blog", mediaDir: "static/img" },
  "mkdocs-markdown": { contentDir: "docs", mediaDir: "docs/images" },
  "nuxt-content-markdown": { contentDir: "content", mediaDir: "public/images" },
};

const PUBLISHER_LABELS: Record<string, string> = {
  github: "GitHub — commit Markdown/MDX to a repository",
  gitlab: "GitLab — commit to a GitLab project",
  bitbucket: "Bitbucket — commit to a Bitbucket repository",
  wordpress: "WordPress — publish via REST API (no git commits)",
  ghost: "Ghost — publish via Admin API (no git commits)",
};

const MEDIA_LABELS: Record<string, string> = {
  "github-media": "Git repository — images committed with your publisher",
  cloudinary: "Cloudinary — hosted image CDN (server-side signed upload)",
  "s3-compatible": "S3-compatible storage (experimental)",
};

async function askChoice(
  rl: Interface,
  prompt: string,
  choices: string[],
  defaultIndex = 0,
): Promise<string> {
  console.log(prompt);
  choices.forEach((choice, index) => {
    const marker = index === defaultIndex ? "*" : " ";
    console.log(`  ${marker} ${index + 1}. ${choice}`);
  });

  const answer = (await rl.question(`Choose 1–${choices.length} [${defaultIndex + 1}]: `)).trim();
  if (answer.length === 0) {
    return choices[defaultIndex] ?? choices[0] ?? "";
  }

  const num = Number.parseInt(answer, 10);
  if (Number.isFinite(num) && num >= 1 && num <= choices.length) {
    return choices[num - 1] ?? choices[defaultIndex] ?? "";
  }

  const byId = choices.find((c) => c.startsWith(answer));
  return byId ?? choices[defaultIndex] ?? "";
}

async function askYesNo(
  rl: Interface,
  prompt: string,
  defaultYes = false,
): Promise<boolean> {
  const hint = defaultYes ? "Y/n" : "y/N";
  const answer = (await rl.question(`${prompt} (${hint}): `)).trim().toLowerCase();
  if (answer.length === 0) {
    return defaultYes;
  }

  return answer === "y" || answer === "yes";
}

async function askText(
  rl: Interface,
  prompt: string,
  defaultValue = "",
): Promise<string> {
  const suffix = defaultValue ? ` [${defaultValue}]` : "";
  const answer = (await rl.question(`${prompt}${suffix}: `)).trim();
  return answer.length > 0 ? answer : defaultValue;
}

async function collectEnvVars(
  rl: Interface,
  existing: Map<string, string>,
  requirements: ReturnType<typeof publisherEnvRequirements>,
): Promise<Map<string, string>> {
  const updates = new Map<string, string>();

  for (const req of requirements) {
    const current = existing.get(req.key)?.trim() ?? "";
    console.log(`\n${req.label} (${req.key})`);
    console.log(`  ${req.help}`);

    if (current.length > 0) {
      console.log(
        `  Current value: ${formatEnvValueForDisplay(req.key, current)}`,
      );
      const overwrite = await askYesNo(rl, "  Keep existing value?", true);
      if (overwrite) {
        continue;
      }
    }

    const value = await askText(
      rl,
      req.required ? "  Enter value" : "  Enter value (optional, press Enter to skip)",
      current,
    );

    if (value.length > 0) {
      updates.set(req.key, value);
    }
  }

  return updates;
}

export async function runWizard(options: WizardOptions = {}): Promise<WizardResult> {
  const cwd = options.cwd ?? process.cwd();
  const rl = options.rl ?? createInterface({ input, output });
  const ownsRl = options.rl === undefined;

  try {
    console.log("\nSourceDraft setup wizard\n");
    console.log(
      "This wizard creates sourcedraft.config.json and .env with plain-language prompts.",
    );
    console.log("Secrets are masked in summaries. Typed input is visible on screen.\n");

    const detection = detectSetup(cwd);
    if (detection.primary) {
      console.log(buildOnboardingMessage(detection, detection.primary));
      if (detection.warnings.length > 0) {
        for (const warning of detection.warnings) {
          console.log(`  • ${warning}`);
        }
      }
      console.log("");
    } else if (detection.failureMessage) {
      console.log(buildOnboardingFailureMessage(detection));
      console.log("");
    }

    const adapterIds = listAdapterIds();
    const adapterLabels = adapterIds.map((id) => `${id}`);
    const detectedAdapterIndex =
      detection.primary !== null
        ? Math.max(0, adapterIds.indexOf(detection.primary.adapter))
        : 0;
    const adapter = await askChoice(
      rl,
      "Which site generator / output format (adapter)?",
      adapterLabels,
      detectedAdapterIndex,
    );

    const publisherIds = listPublisherIds();
    const publisherChoices = publisherIds.map(
      (id) => `${id} — ${PUBLISHER_LABELS[id] ?? id}`,
    );
    const publisherPick = await askChoice(
      rl,
      "Where should published articles go (publisher)?",
      publisherChoices,
      0,
    );
    const publisher = publisherPick.split(" — ")[0] ?? publisherIds[0] ?? "github";

    const mediaIds = listMediaProviderIds();
    const mediaChoices = mediaIds.map(
      (id) => `${id} — ${MEDIA_LABELS[id] ?? id}`,
    );
    const mediaPick = await askChoice(
      rl,
      "Where should uploaded images be stored (media provider)?",
      mediaChoices,
      0,
    );
    const mediaProvider = mediaPick.split(" — ")[0] ?? mediaIds[0] ?? "github-media";

    const hints = ADAPTER_HINTS[adapter] ?? ADAPTER_HINTS["astro-mdx"];
    const detectedSuggestion =
      detection.primary?.adapter === adapter ? detection.primary : null;
    const contentDir = await askText(
      rl,
      "Content directory (folder for articles in your repo)",
      detectedSuggestion?.contentDir ?? hints?.contentDir ?? "src/content/blog",
    );
    const mediaDir = await askText(
      rl,
      "Media directory (folder for images in your repo)",
      detectedSuggestion?.mediaDir ?? hints?.mediaDir ?? "public/images",
    );
    const publicMediaPath = derivePublicMediaPath(mediaDir);
    const defaultBranch = await askText(
      rl,
      "Default git branch",
      detectedSuggestion?.defaultBranch ?? "main",
    );

    const defaultCategories =
      detectedSuggestion?.frontmatter?.suggestedCategories &&
      detectedSuggestion.frontmatter.suggestedCategories.length > 0
        ? detectedSuggestion.frontmatter.suggestedCategories.join(", ")
        : DEFAULT_SOURCEDRAFT_CATEGORIES_CSV;
    const categoriesRaw = await askText(
      rl,
      "Default categories (comma-separated)",
      defaultCategories,
    );
    const categories = categoriesRaw
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    const configureDeployHook = await askYesNo(
      rl,
      "Configure an optional deploy hook (rebuild your site after publish)?",
      false,
    );

    const configPath = resolve(cwd, "sourcedraft.config.json");
    const envPath = resolve(cwd, ".env");
    const existingEnv = loadEnvMap(envPath);
    const envUpdates = new Map<string, string>();

    async function setEnvIfAllowed(key: string, value: string): Promise<void> {
      const current = existingEnv.get(key)?.trim() ?? "";
      if (current.length > 0 && current !== value) {
        console.log(
          `\n${key} is already set to ${formatEnvValueForDisplay(key, current)}`,
        );
        const keep = await askYesNo(rl, `Keep existing ${key}?`, true);
        if (keep) {
          return;
        }
      }

      envUpdates.set(key, value);
    }

    await setEnvIfAllowed("CMS_PUBLISHER", publisher);
    await setEnvIfAllowed("CMS_MEDIA_PROVIDER", mediaProvider);

    const publisherReqs = publisherEnvRequirements(publisher);
    const publisherVars = await collectEnvVars(rl, existingEnv, publisherReqs);
    for (const [k, v] of publisherVars) {
      envUpdates.set(k, v);
    }

    if (publisher === "github" && defaultBranch) {
      envUpdates.set("GITHUB_BRANCH", defaultBranch);
    }
    if (publisher === "gitlab") {
      envUpdates.set("GITLAB_BRANCH", defaultBranch);
    }
    if (publisher === "bitbucket") {
      envUpdates.set("BITBUCKET_BRANCH", defaultBranch);
    }

    const mediaReqs = mediaProviderEnvRequirements(mediaProvider);
    if (mediaReqs.length > 0) {
      const mediaVars = await collectEnvVars(rl, existingEnv, mediaReqs);
      for (const [k, v] of mediaVars) {
        envUpdates.set(k, v);
      }
    }

    if (configureDeployHook) {
      const deployReqs = deployHookEnvRequirements();
      const deployVars = await collectEnvVars(rl, existingEnv, deployReqs);
      for (const [k, v] of deployVars) {
        envUpdates.set(k, v);
      }

      const testHook = await askYesNo(
        rl,
        "Send a test request to the deploy hook now? (Not recommended unless you intend to trigger a build)",
        false,
      );
      if (testHook) {
        const url = deployVars.get("DEPLOY_HOOK_URL") ?? existingEnv.get("DEPLOY_HOOK_URL");
        if (url) {
          console.log("\nSending one test request to the deploy hook…");
          try {
            const method = (deployVars.get("DEPLOY_HOOK_METHOD") ?? "POST").toUpperCase();
            const response = await fetch(url, { method });
            console.log(`Deploy hook responded with ${response.status}.`);
          } catch (error) {
            console.log(
              `Deploy hook test failed: ${error instanceof Error ? error.message : "unknown error"}`,
            );
          }
        }
      }
    }

    const adminPassword = await askText(
      rl,
      "Studio login password (SOURCEDRAFT_ADMIN_PASSWORD — leave blank to skip)",
      existingEnv.get("SOURCEDRAFT_ADMIN_PASSWORD") ?? "",
    );
    if (adminPassword.length > 0) {
      envUpdates.set("SOURCEDRAFT_ADMIN_PASSWORD", adminPassword);
    }

    const configObject = {
      adapter,
      publisher,
      contentDir,
      mediaDir,
      publicMediaPath,
      defaultBranch,
      categories,
      adapterOptions: {},
      publisherOptions: {},
    };

    console.log("\n--- Summary ---");
    console.log(`Adapter: ${adapter}`);
    console.log(`Publisher: ${publisher}`);
    console.log(`Media provider: ${mediaProvider}`);
    console.log(`Content dir: ${contentDir}`);
    console.log(`Media dir: ${mediaDir}`);
    console.log(`Branch: ${defaultBranch}`);
    console.log(`Categories: ${categories.join(", ")}`);
    console.log("Env updates:");
    for (const line of summarizeEnvUpdates(envUpdates)) {
      console.log(line);
    }

    const proceed = await askYesNo(rl, "\nWrite these files?", true);
    if (!proceed) {
      throw new Error("Setup cancelled.");
    }

    writeFileSync(configPath, `${JSON.stringify(configObject, null, 2)}\n`, "utf8");
    console.log(`\nWrote ${configPath}`);

    let backupPath: string | null = null;
    if (existsSync(envPath)) {
      backupPath = backupEnvFile(envPath, options.now?.() ?? new Date());
      if (backupPath) {
        console.log(`Backed up existing .env to ${backupPath}`);
      }
    }

    const finalEnv = mergeEnvMaps(existingEnv, envUpdates, (_key, existingValue) => {
      if (existingValue.trim().length === 0) {
        return "set";
      }

      return "set";
    });

    const header = [
      "# Generated by SourceDraft setup wizard",
      "# Secrets stay server-side — never commit this file",
    ].join("\n");

    writeFileSync(envPath, serializeEnvFile(finalEnv, header), "utf8");
    console.log(`Wrote ${envPath}`);

    const validation = await validateConfigAsync({
      cwd,
      env: Object.fromEntries(finalEnv.entries()),
      checkConnections: await askYesNo(
        rl,
        "Run connection checks now (safe read-only API calls)?",
        true,
      ),
    });

    console.log("\n--- Validation ---");
    console.log(validation.ok ? "Configuration looks good." : "Configuration has issues:");
    for (const issue of validation.issues) {
      const prefix = issue.level === "error" ? "ERROR" : "WARN";
      console.log(`  [${prefix}] ${issue.message}`);
    }
    if (validation.connection) {
      console.log(
        `  Connection: ${validation.connection.ok ? "OK" : "Failed"} — ${validation.connection.detail}`,
      );
    }

    return { configPath, envPath, backupPath };
  } finally {
    if (ownsRl) {
      rl.close();
    }
  }
}
