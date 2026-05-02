import type { CanonicalInput, DraftResult, PlanResult } from "@/lib/schemas";
import type { LlmAdapter } from "@/lib/llm/adapter";
import type { VoiceProfile } from "@/types";
import { formatMetricValue } from "@/lib/utils";

export class WriterAgent {
  readonly stage = "writer-agent";

  constructor(private readonly llm: LlmAdapter) {}

  async run(input: { canonical: CanonicalInput; plan: PlanResult; voiceProfile: VoiceProfile }): Promise<DraftResult> {
    await this.llm.generate("writer", input, { temperature: 0.1 });

    const { canonical, plan } = input;
    const metricLines = canonical.metrics.map((metric) => {
      const change = metric.changePercent === null ? "prior period unavailable" : `${metric.changePercent}% vs prior period`;
      return `- ${metric.name}: ${formatMetricValue(metric.current, metric.unit)} (${change})`;
    });

    const blocks = plan.sections.map((section) => {
      if (section.id === "executive-summary") {
        return {
          sectionId: section.id,
          heading: section.heading,
          body: [
            `${canonical.companyName} made ${canonical.wins.length > 0 ? "measurable progress" : "steady progress"} in ${canonical.period}, with the strongest signal coming from ${canonical.metrics[0]?.name ?? "the operating narrative"}.`,
            canonical.notes ? `Context: ${canonical.notes}` : "Context: no additional narrative notes were provided."
          ]
        };
      }

      if (section.id === "metrics") {
        return { sectionId: section.id, heading: section.heading, body: metricLines };
      }

      if (section.id === "highlights") {
        return { sectionId: section.id, heading: section.heading, body: canonical.wins.map((win) => `- ${win}`) };
      }

      if (section.id === "risks") {
        return { sectionId: section.id, heading: section.heading, body: canonical.risks.length ? canonical.risks.map((risk) => `- ${risk}`) : ["- No material risks were submitted."] };
      }

      return { sectionId: section.id, heading: section.heading, body: canonical.asks.length ? canonical.asks.map((ask) => `- ${ask}`) : ["- No investor asks were submitted."] };
    });

    const markdown = [`# ${plan.title}`, ...blocks.flatMap((block) => [`\n## ${block.heading}`, ...block.body])].join("\n");
    return { blocks, markdown };
  }
}
