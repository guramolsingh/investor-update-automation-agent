import type { AnalysisResult, CanonicalInput } from "@/lib/schemas";
import { formatMetricValue } from "@/lib/utils";

export class AnalysisAgent {
  readonly stage = "analysis-agent";

  run(input: CanonicalInput): AnalysisResult {
    const metricTrends = input.metrics.map((metric) => ({
      metric: metric.name,
      changePercent: metric.changePercent,
      status: metric.status
    }));

    const highlights = input.metrics
      .filter((metric) => metric.status === "up")
      .slice(0, 3)
      .map((metric) => ({
        text: `${metric.name} improved to ${formatMetricValue(metric.current, metric.unit)}${metric.changePercent === null ? "" : ` (${metric.changePercent}% vs prior period)`}.`,
        metric: metric.name,
        confidence: 0.92
      }));

    const concerns = [
      ...input.metrics
        .filter((metric) => metric.status === "down")
        .map((metric) => ({
          text: `${metric.name} declined to ${formatMetricValue(metric.current, metric.unit)}${metric.changePercent === null ? "" : ` (${metric.changePercent}% vs prior period)`}.`,
          severity: Math.abs(metric.changePercent ?? 0) > 20 ? "high" : "medium",
          confidence: 0.9
        }) as const),
      ...input.risks.map((risk) => ({ text: risk, severity: "medium", confidence: 0.74 }) as const)
    ];

    const anomalies = input.metrics
      .filter((metric) => Math.abs(metric.changePercent ?? 0) >= 50)
      .map((metric) => ({
        text: `${metric.name} moved ${metric.changePercent}% and should be explained with context.`,
        metric: metric.name,
        confidence: 0.86
      }));

    return {
      highlights: highlights.length > 0 ? highlights : input.wins.map((win) => ({ text: win, confidence: 0.78 })),
      concerns,
      anomalies,
      metricTrends
    };
  }
}
