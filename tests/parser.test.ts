import { describe, expect, it } from "vitest";
import input from "../examples/inconsistent-metrics.json";
import { InputParser } from "../src/lib/agents/InputParser";

describe("InputParser", () => {
  it("normalizes metrics and emits warnings for inconsistent input", () => {
    const parsed = new InputParser().run(input);

    expect(parsed.metrics[0].normalizedName).toBe("mrr");
    expect(parsed.metrics[0].changePercent).toBe(-10);
    expect(parsed.warnings).toContain("Duplicate metric detected: MRR");
    expect(parsed.warnings).toContain("Missing commonly expected investor metric: runway");
    expect(parsed.warnings).toContain("No investor asks were provided.");
  });
});
