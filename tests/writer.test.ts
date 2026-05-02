import { describe, expect, it } from "vitest";
import input from "../examples/growth-quarter.json";
import { AnalysisAgent, InputParser, PlanningAgent, WriterAgent } from "../src/lib/agents";
import { MockLlmAdapter } from "../src/lib/llm/adapter";
import { defaultVoiceProfile } from "../src/lib/defaults";

describe("WriterAgent", () => {
  it("writes supplied metrics without inventing additional numeric values", async () => {
    const canonical = new InputParser().run(input);
    const analysis = new AnalysisAgent().run(canonical);
    const plan = new PlanningAgent().run({ canonical, analysis });
    const draft = await new WriterAgent(new MockLlmAdapter()).run({ canonical, plan, voiceProfile: defaultVoiceProfile });

    expect(draft.markdown).toContain("MRR: $84,000");
    expect(draft.markdown).toContain("Activation Rate: 42%");
    expect(draft.markdown).not.toContain("ARR");
  });
});
