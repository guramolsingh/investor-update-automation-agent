import type { CritiqueResult, DraftResult, RefinedResult } from "@/lib/schemas";
import type { LlmAdapter } from "@/lib/llm/adapter";

export class RefinementAgent {
  readonly stage = "refinement-agent";

  constructor(private readonly llm: LlmAdapter) {}

  async run(input: { draft: DraftResult; critique: CritiqueResult }): Promise<RefinedResult> {
    await this.llm.generate("refinement", input, { temperature: 0 });
    let markdown = input.draft.markdown;
    const diff: RefinedResult["diff"] = [];

    if (input.critique.improvements.some((item) => item.issue.includes("Parser warnings"))) {
      const warningNote = "\n\n_Notes for investors: metrics are reported only where supplied. Missing or inconsistent fields are called out without inventing substitutes._";
      markdown += warningNote;
      diff.push({
        sectionId: "executive-summary",
        before: "No data-quality note.",
        after: warningNote.trim(),
        reason: "Clarify fact boundaries and avoid hallucinated metrics."
      });
    }

    markdown = markdown.replace("Context: ", "Operating context: ");
    diff.push({
      sectionId: "executive-summary",
      before: "Context",
      after: "Operating context",
      reason: "Use clearer investor-facing language."
    });

    return { markdown, diff };
  }
}
