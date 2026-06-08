#!/usr/bin/env node
import { runWizard } from "./wizard.js";
import { validateConfigAsync } from "./validateConfig.js";

const command = process.argv[2];

async function runValidate(): Promise<void> {
  const checkConnections = process.argv.includes("--connections");
  const report = await validateConfigAsync({ checkConnections });

  console.log("SourceDraft configuration validation\n");
  console.log(`Adapter:        ${report.adapter}`);
  console.log(`Publisher:      ${report.publisher}`);
  console.log(`Media provider: ${report.mediaProvider}`);

  if (report.configPath) {
    console.log(`Config:         ${report.configPath}`);
  }

  if (report.envPath) {
    console.log(`Env:            ${report.envPath}`);
  }

  if (report.missingEnvVars.length > 0) {
    console.log(`\nMissing env vars: ${report.missingEnvVars.join(", ")}`);
  }

  for (const issue of report.issues) {
    const prefix = issue.level === "error" ? "ERROR" : "WARN";
    console.log(`[${prefix}] ${issue.field}: ${issue.message}`);
  }

  if (report.connection) {
    const status = report.connection.ok ? "OK" : "FAILED";
    console.log(`\nConnection: ${status} — ${report.connection.detail}`);
  }

  console.log(report.ok ? "\nValidation passed." : "\nValidation failed.");
  process.exit(report.ok ? 0 : 1);
}

async function main(): Promise<void> {
  if (command === "validate" || command === "validate:config") {
    await runValidate();
    return;
  }

  if (command === "setup" || command === undefined) {
    await runWizard();
    return;
  }

  console.error(`Unknown command: ${command}`);
  console.error("Usage: setup [setup|validate] [--connections]");
  process.exit(1);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Setup failed.");
  process.exit(1);
});
