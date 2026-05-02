import type { AnalysisResult, CanonicalInput, PlanResult } from "@/lib/schemas";

export class PlanningAgent {
  readonly stage = "planning-agent";

  run(input: { canonical: CanonicalInput; analysis: AnalysisResult }): PlanResult {
    const { canonical, analysis } = input;
    const highConcern = analysis.concerns.some((concern) => concern.severity === "high");

    return {
      title: `${canonical.companyName} Investor Update - ${canonical.period}`,
      sections: [
        {
          id: "executive-summary",
          heading: "Executive Summary",
          emphasis: "high",
          facts: canonical.wins.slice(0, 2),
          interpretations: analysis.highlights.slice(0, 2).map((item) => item.text)
        },
        {
          id: "metrics",
          heading: "Metrics",
          emphasis: "high",
          facts: canonical.metrics.map((metric) => `${metric.name}: ${metric.current}${metric.unit ? ` ${metric.unit}` : ""}`),
          interpretations: analysis.metricTrends.map((trend) => `${trend.metric}: ${trend.status}`)
        },
        {
          id: "highlights",
          heading: "Highlights",
          emphasis: "medium",
          facts: canonical.wins,
          interpretations: analysis.highlights.map((item) => item.text)
        },
        {
          id: "risks",
          heading: "Risks",
          emphasis: highConcern ? "high" : "medium",
          facts: canonical.risks,
          interpretations: analysis.concerns.map((item) => item.text)
        },
        {
          id: "asks",
          heading: "Asks",
          emphasis: canonical.asks.length > 0 ? "high" : "low",
          facts: canonical.asks,
          interpretations: []
        }
      ]
    };
  }
}
