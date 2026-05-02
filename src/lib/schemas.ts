import { z } from "zod";

export const RawMetricSchema = z.object({
  name: z.string().min(1),
  current: z.number(),
  previous: z.number().optional(),
  unit: z.string().optional(),
  source: z.string().default("user_input")
});

export const RawInputSchema = z.object({
  companyName: z.string().min(1),
  period: z.string().min(1),
  metrics: z.array(RawMetricSchema).default([]),
  wins: z.array(z.string()).default([]),
  risks: z.array(z.string()).default([]),
  asks: z.array(z.string()).default([]),
  notes: z.string().default("")
});

export const CanonicalMetricSchema = RawMetricSchema.extend({
  normalizedName: z.string(),
  changePercent: z.number().nullable(),
  status: z.enum(["up", "down", "flat", "unknown"])
});

export const CanonicalInputSchema = RawInputSchema.extend({
  id: z.string(),
  metrics: z.array(CanonicalMetricSchema),
  warnings: z.array(z.string())
});

export type RawMetric = z.input<typeof RawMetricSchema>;
export type RawInput = z.input<typeof RawInputSchema>;
export type CanonicalMetric = z.infer<typeof CanonicalMetricSchema>;
export type CanonicalInput = z.infer<typeof CanonicalInputSchema>;

export interface AnalysisResult {
  highlights: Array<{ text: string; metric?: string; confidence: number }>;
  concerns: Array<{ text: string; severity: "low" | "medium" | "high"; confidence: number }>;
  anomalies: Array<{ text: string; metric?: string; confidence: number }>;
  metricTrends: Array<{ metric: string; changePercent: number | null; status: string }>;
}

export interface PlanResult {
  title: string;
  sections: Array<{
    id: "executive-summary" | "metrics" | "highlights" | "risks" | "asks";
    heading: string;
    emphasis: "high" | "medium" | "low";
    facts: string[];
    interpretations: string[];
  }>;
}

export interface DraftResult {
  blocks: Array<{ sectionId: string; heading: string; body: string[] }>;
  markdown: string;
}

export interface CritiqueResult {
  score: number;
  improvements: Array<{
    priority: number;
    issue: string;
    recommendation: string;
  }>;
}

export interface RefinedResult {
  markdown: string;
  diff: Array<{ sectionId: string; before: string; after: string; reason: string }>;
}

export interface FormattedOutput {
  executiveSummary: string;
  metrics: string;
  highlights: string;
  risks: string;
  asks: string;
  markdown: string;
}

export interface AgentTrace<I = unknown, O = unknown> {
  stage: string;
  input: I;
  output: O;
  startedAt: string;
  finishedAt: string;
}

export interface PipelineResult {
  canonical: CanonicalInput;
  analysis: AnalysisResult;
  plan: PlanResult;
  draft: DraftResult;
  critique: CritiqueResult;
  refined: RefinedResult;
  formatted: FormattedOutput;
  traces: AgentTrace[];
}
