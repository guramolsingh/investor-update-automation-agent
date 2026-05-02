import type { CanonicalInput, CritiqueResult, DraftResult } from "@/lib/schemas";
import type { LlmAdapter } from "@/lib/llm/adapter";

export class CriticAgent {
  readonly stage = "critic-agent";

  constructor(private readonly llm: LlmAdapter) {}

  async run(input: { canonical: CanonicalInput; draft: DraftResult }): Promise<CritiqueResult> {
    await this.llm.generate("critic", input, { temperature: 0 });
    const improvements: CritiqueResult["improvements"] = [];

    if (input.canonical.warnings.length > 0) {
      improvements.push({
        priority: 1,
        issue: "Parser warnings need investor-facing context.",
        recommendation: `Address warnings: ${input.canonical.warnings.join("; ")}.`
      });
    }

    if (!input.draft.markdown.includes("## Asks")) {
      improvements.push({ priority: 2, issue: "Missing asks section.", recommendation: "Include a concise asks section." });
    }

    if (input.draft.markdown.length < 500) {
      improvements.push({ priority: 3, issue: "Draft is concise.", recommendation: "Add enough context for investors to understand the operating picture." });
    }

    return {
      score: Math.max(70, 96 - improvements.length * 8),
      improvements
    };
  }
}
