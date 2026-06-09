import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config as loadDotenv } from "dotenv";
import express from "express";
import {
  isAuthenticatedDemoActive,
  enterDemo,
  getSessionToken,
  isAuthConfigured,
  isRequestDemoSession,
  isSessionValid,
  login,
  logout,
  requireAuth,
} from "./auth.js";
import { loadPublicConfig, loadPublishEnv } from "./config.js";
import { listDemoPostsHandler, loadDemoPost } from "./demoPosts.js";
import { listDemoMediaHandler, uploadDemoMedia } from "./demoMedia.js";
import { publishDemoArticle } from "./demoPublish.js";
import { isDemoModeAvailable, isDemoModeForced } from "./demoMode.js";
import { uploadMedia } from "./media.js";
import { listMedia } from "./listMedia.js";
import { listPosts, loadPost } from "./posts.js";
import { publishArticle, type PublishRequestBody } from "./publish.js";
import { requireSameSiteRequest } from "./requestProtection.js";
import { initializePlugins } from "./plugins.js";
import { runContentAudit, runDemoContentAudit } from "./contentAuditHandler.js";
import { getSetupHealth } from "./setupHealth.js";
import { runSetupDetection } from "./setupDetection.js";
import {
  apiLimiter,
  readLimiter,
  strictAuthLimiter,
  writeLimiter,
} from "./rateLimit.js";

const envPaths = [
  resolve(process.cwd(), ".env"),
  resolve(process.cwd(), ".env.local"),
  resolve(process.cwd(), "../../.env"),
  resolve(process.cwd(), "../../.env.local"),
];

for (const envPath of envPaths) {
  if (existsSync(envPath)) {
    loadDotenv({ path: envPath });
  }
}

await initializePlugins();

const port = Number(process.env.STUDIO_API_PORT ?? 8787);
const app = express();

app.use(apiLimiter);
app.use(express.json({ limit: "1mb" }));

app.get("/api/auth/status", readLimiter, (req, res) => {
  const token = getSessionToken(req);
  const authenticated = isSessionValid(token);

  res.json({
    configured: isAuthConfigured(),
    authenticated,
    mode: "mvp-local-password",
    demoMode: isAuthenticatedDemoActive(req),
    demoModeForced: isDemoModeForced(),
    demoModeAvailable: isDemoModeAvailable(),
  });
});

app.post("/api/auth/login", strictAuthLimiter, requireSameSiteRequest, (req, res) => {
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  const result = login(req, password, res);

  if (!result.ok) {
    res.status(result.error === "Invalid password." ? 401 : 500).json({
      ok: false,
      error: result.error,
    });
    return;
  }

  res.json({ ok: true });
});

app.post("/api/auth/demo", strictAuthLimiter, requireSameSiteRequest, (req, res) => {
  const result = enterDemo(req, res);

  if (!result.ok) {
    res.status(403).json({ ok: false, error: result.error });
    return;
  }

  res.json({ ok: true, demoMode: true });
});

app.post("/api/auth/logout", writeLimiter, requireSameSiteRequest, (req, res) => {
  logout(req, res);
  res.json({ ok: true });
});

app.get("/api/config", readLimiter, requireAuth, (req, res) => {
  const runtime = loadPublicConfig();
  const demoMode = isRequestDemoSession(req);

  res.json({
    adapter: runtime.adapter,
    contentDir: runtime.contentDir,
    mediaDir: runtime.mediaDir,
    publicMediaPath: runtime.publicMediaPath,
    defaultBranch: runtime.branch,
    categories: runtime.categories,
    publishMode: runtime.publishMode,
    prBranchPrefix: runtime.prBranchPrefix,
    prDraft: runtime.prDraft,
    publisher: runtime.publisher,
    ...(runtime.adapterOptions !== undefined
      ? { adapterOptions: runtime.adapterOptions }
      : {}),
    githubOwner: demoMode ? "demo" : runtime.owner,
    githubRepo: demoMode ? "sample-posts" : runtime.repo,
    demoMode,
  });
});

app.get("/api/health/setup", readLimiter, requireAuth, (_req, res) => {
  res.json(getSetupHealth());
});

app.get("/api/setup/detect", readLimiter, requireAuth, (_req, res) => {
  res.json(runSetupDetection());
});

app.get("/api/content/audit", readLimiter, requireAuth, async (req, res) => {
  const demoMode = isRequestDemoSession(req);

  if (demoMode) {
    const runtime = loadPublicConfig();
    const result = runDemoContentAudit(runtime.adapter, runtime.contentDir);
    res.status(result.status).json(result.body);
    return;
  }

  const envResult = loadPublishEnv();
  if (!envResult.ok) {
    res.status(500).json({ ok: false, error: envResult.error });
    return;
  }

  const result = await runContentAudit(envResult.config);
  res.status(result.status).json(result.body);
});

app.get("/api/posts", readLimiter, requireAuth, async (req, res) => {
  const demoMode = isRequestDemoSession(req);
  const pathParam =
    typeof req.query.path === "string" ? req.query.path.trim() : "";

  if (demoMode) {
    const runtime = loadPublicConfig();

    if (pathParam.length > 0) {
      const result = await loadDemoPost(pathParam, runtime);
      res.status(result.status).json(result.body);
      return;
    }

    const result = await listDemoPostsHandler();
    res.status(result.status).json(result.body);
    return;
  }

  const envResult = loadPublishEnv();
  if (!envResult.ok) {
    res.status(500).json({ ok: false, error: envResult.error });
    return;
  }

  if (pathParam.length > 0) {
    const result = await loadPost(pathParam, envResult.config);
    res.status(result.status).json(result.body);
    return;
  }

  const result = await listPosts(envResult.config);
  res.status(result.status).json(result.body);
});

app.get("/api/media", readLimiter, requireAuth, async (req, res) => {
  if (isRequestDemoSession(req)) {
    const result = await listDemoMediaHandler();
    res.status(result.status).json(result.body);
    return;
  }

  const envResult = loadPublishEnv();
  if (!envResult.ok) {
    res.status(500).json({ ok: false, error: envResult.error });
    return;
  }

  const result = await listMedia(envResult.config);
  res.status(result.status).json(result.body);
});

app.post(
  "/api/media/upload",
  writeLimiter,
  requireSameSiteRequest,
  requireAuth,
  async (req, res) => {
    if (isRequestDemoSession(req)) {
      const runtime = loadPublicConfig();
      const result = await uploadDemoMedia(req, runtime);
      res.status(result.status).json(result.body);
      return;
    }

    const envResult = loadPublishEnv();
    if (!envResult.ok) {
      res.status(500).json({ ok: false, error: envResult.error });
      return;
    }

    const result = await uploadMedia(req, envResult.config);
    res.status(result.status).json(result.body);
  },
);

app.post("/api/publish", writeLimiter, requireSameSiteRequest, requireAuth, async (req, res) => {
  if (isRequestDemoSession(req)) {
    const runtime = loadPublicConfig();
    const result = await publishDemoArticle(
      req.body as PublishRequestBody,
      runtime,
    );
    res.status(result.status).json(result.body);
    return;
  }

  const envResult = loadPublishEnv();
  if (!envResult.ok) {
    res.status(500).json({ ok: false, error: envResult.error });
    return;
  }

  const result = await publishArticle(
    req.body as PublishRequestBody,
    envResult.config,
  );
  res.status(result.status).json(result.body);
});

app.listen(port, () => {
  console.log(`SourceDraft publish API listening on http://localhost:${port}`);
});
