import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import growth from "../examples/growth-quarter.json";
import inconsistent from "../examples/inconsistent-metrics.json";
import { runPipeline } from "../src/lib/pipeline";

describe("full pipeline", () => {
  it("runs deterministic end-to-end output for the growth example", async () => {
    const result = await runPipeline({ rawInput: growth, llmMode: "mock" });
    const expected = await fs.readFile(path.join(process.cwd(), "examples", "expected", "growth-quarter.md"), "utf8");

    expect(result.traces).toHaveLength(7);
    expect(result.formatted?.markdown.trim()).toBe(expected.trim());
  });

  it("keeps warning context in the inconsistent metrics output", async () => {
    const result = await runPipeline({ rawInput: inconsistent, llmMode: "mock" });
    const expected = await fs.readFile(path.join(process.cwd(), "examples", "expected", "inconsistent-metrics.md"), "utf8");

    expect(result.canonical?.warnings.length).toBeGreaterThan(0);
    expect(result.formatted?.markdown.trim()).toBe(expected.trim());
  });
});
