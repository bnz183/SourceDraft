import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config as loadDotenv } from "dotenv";
import express from "express";
import {
  getSessionToken,
  isAuthConfigured,
  isSessionValid,
  login,
  logout,
  requireAuth,
} from "./auth.js";
import { loadPublicConfig, loadPublishEnv } from "./config.js";
import { uploadMedia } from "./media.js";
import { listMedia } from "./listMedia.js";
import { listPosts, loadPost } from "./posts.js";
import { publishArticle, type PublishRequestBody } from "./publish.js";
import { requireSameSiteRequest } from "./requestProtection.js";

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

const port = Number(process.env.STUDIO_API_PORT ?? 8787);
const app = express();

app.use(express.json({ limit: "1mb" }));

app.get("/api/auth/status", (req, res) => {
  res.json({
    configured: isAuthConfigured(),
    authenticated: isSessionValid(getSessionToken(req)),
    mode: "mvp-local-password",
  });
});

app.post("/api/auth/login", requireSameSiteRequest, (req, res) => {
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

app.post("/api/auth/logout", requireSameSiteRequest, (req, res) => {
  logout(req, res);
  res.json({ ok: true });
});

app.get("/api/config", requireAuth, (_req, res) => {
  const runtime = loadPublicConfig();

  res.json({
    adapter: runtime.adapter,
    contentDir: runtime.contentDir,
    mediaDir: runtime.mediaDir,
    publicMediaPath: runtime.publicMediaPath,
    defaultBranch: runtime.branch,
    categories: runtime.categories,
    githubOwner: runtime.owner,
    githubRepo: runtime.repo,
  });
});

app.get("/api/posts", requireAuth, async (req, res) => {
  const envResult = loadPublishEnv();
  if (!envResult.ok) {
    res.status(500).json({ ok: false, error: envResult.error });
    return;
  }

  const pathParam =
    typeof req.query.path === "string" ? req.query.path.trim() : "";

  if (pathParam.length > 0) {
    const result = await loadPost(pathParam, envResult.config);
    res.status(result.status).json(result.body);
    return;
  }

  const result = await listPosts(envResult.config);
  res.status(result.status).json(result.body);
});

app.get("/api/media", requireAuth, async (_req, res) => {
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
  requireSameSiteRequest,
  requireAuth,
  async (req, res) => {
    const envResult = loadPublishEnv();
    if (!envResult.ok) {
      res.status(500).json({ ok: false, error: envResult.error });
      return;
    }

    const result = await uploadMedia(req, envResult.config);
    res.status(result.status).json(result.body);
  },
);

app.post("/api/publish", requireSameSiteRequest, requireAuth, async (req, res) => {
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
