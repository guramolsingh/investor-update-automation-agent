import { describe, expect, it } from "vitest";
import input from "../examples/growth-quarter.json";
import { AnalysisAgent } from "../src/lib/agents/AnalysisAgent";
import { InputParser } from "../src/lib/agents/InputParser";

describe("AnalysisAgent", () => {
  it("computes metric trends and highlights supplied growth", () => {
    const canonical = new InputParser().run(input);
    const analysis = new AnalysisAgent().run(canonical);

    expect(analysis.metricTrends).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ metric: "MRR", changePercent: 35.5, status: "up" })
      ])
    );
    expect(analysis.highlights[0].text).toContain("$84,000");
  });
});
