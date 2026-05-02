import { CanonicalInput, RawInputSchema } from "@/lib/schemas";
import { percentageChange, stableId } from "@/lib/utils";

export class InputParser {
  readonly stage = "input-parser";

  run(raw: unknown): CanonicalInput {
    const parsed = RawInputSchema.parse(raw);
    const warnings: string[] = [];
    const seen = new Set<string>();

    const metrics = parsed.metrics.map((metric) => {
      const normalizedName = metric.name.trim().toLowerCase().replace(/\s+/g, "_");
      if (seen.has(normalizedName)) warnings.push(`Duplicate metric detected: ${metric.name}`);
      seen.add(normalizedName);

      if (metric.current < 0) warnings.push(`Metric ${metric.name} has a negative current value.`);
      if (metric.previous !== undefined && metric.previous < 0) warnings.push(`Metric ${metric.name} has a negative previous value.`);

      const changePercent = percentageChange(metric.current, metric.previous);
      const status: "up" | "down" | "flat" | "unknown" = changePercent === null ? "unknown" : changePercent > 1 ? "up" : changePercent < -1 ? "down" : "flat";

      return {
        ...metric,
        normalizedName,
        changePercent,
        status
      };
    });

    for (const required of ["runway"]) {
      if (!metrics.some((metric) => metric.normalizedName.includes(required))) {
        warnings.push(`Missing commonly expected investor metric: ${required}`);
      }
    }

    if (parsed.wins.length === 0) warnings.push("No wins were provided.");
    if (parsed.asks.length === 0) warnings.push("No investor asks were provided.");

    return {
      ...parsed,
      id: stableId(`${parsed.companyName}:${parsed.period}:${JSON.stringify(parsed.metrics)}`),
      metrics,
      warnings
    };
  }
}
