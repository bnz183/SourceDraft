#!/usr/bin/env tsx
import { hashAdminPassword } from "../apps/studio/server/adminPassword.js";

const password = process.argv[2];

if (!password || password.length === 0) {
  console.error("Usage: pnpm exec tsx scripts/hash-admin-password.ts <password>");
  console.error("");
  console.error("Output format: $argon2id$v=19$m=19456,t=2,p=1$...");
  console.error("Set SOURCEDRAFT_ADMIN_PASSWORD_HASH in .env with the generated value.");
  process.exit(1);
}

console.log(await hashAdminPassword(password));
