import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { filterSlashCommands, SLASH_COMMANDS } from "./slashCommands.js";

describe("slashCommands", () => {
  it("lists required slash commands", () => {
    const ids = SLASH_COMMANDS.map((command) => command.id);
    assert.ok(ids.includes("h1"));
    assert.ok(ids.includes("h2"));
    assert.ok(ids.includes("h3"));
    assert.ok(ids.includes("quote"));
    assert.ok(ids.includes("code"));
    assert.ok(ids.includes("image"));
    assert.ok(ids.includes("hr"));
    assert.ok(ids.includes("link"));
    assert.ok(ids.includes("internal"));
    assert.ok(ids.includes("callout"));
  });

  it("filters commands by query", () => {
    const matches = filterSlashCommands("h2");
    assert.equal(matches.length, 1);
    assert.equal(matches[0]?.id, "h2");
  });
});
