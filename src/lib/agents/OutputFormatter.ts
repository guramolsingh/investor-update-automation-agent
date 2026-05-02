import type { FormattedOutput, RefinedResult } from "@/lib/schemas";

export class OutputFormatter {
  readonly stage = "output-formatter";

  run(input: RefinedResult): FormattedOutput {
    const pick = (heading: string) => {
      const pattern = new RegExp(`## ${heading}\\n([\\s\\S]*?)(?=\\n## |$)`);
      return input.markdown.match(pattern)?.[1]?.trim() || "";
    };

    return {
      executiveSummary: pick("Executive Summary"),
      metrics: pick("Metrics"),
      highlights: pick("Highlights"),
      risks: pick("Risks"),
      asks: pick("Asks"),
      markdown: input.markdown
    };
  }
}
