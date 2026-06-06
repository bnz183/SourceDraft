import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config as loadDotenv } from "dotenv";
import express from "express";
import { loadPublishEnv } from "./config.js";
import { publishArticle, type PublishRequestBody } from "./publish.js";

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

app.post("/api/publish", async (req, res) => {
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
