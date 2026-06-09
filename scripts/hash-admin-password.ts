#!/usr/bin/env tsx
import { hashAdminPassword } from "../apps/studio/server/adminPassword.js";

const password = process.argv[2];

if (!password || password.length === 0) {
  console.error("Usage: pnpm exec tsx scripts/hash-admin-password.ts <password>");
  console.error("");
  console.error("Output format: scrypt$N$r$p$saltBase64$hashBase64");
  console.error("Set SOURCEDRAFT_ADMIN_PASSWORD_HASH in .env with the generated value.");
  process.exit(1);
}

console.log(hashAdminPassword(password));
