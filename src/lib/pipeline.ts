import type { LlmMode, VoiceProfile } from "@/types";
import type { AgentTrace, PipelineResult, RawInput } from "@/lib/schemas";
import { AnalysisAgent, CriticAgent, InputParser, OutputFormatter, PlanningAgent, RefinementAgent, WriterAgent } from "@/lib/agents";
import { createLlmAdapter } from "@/lib/llm/adapter";
import { defaultVoiceProfile } from "@/lib/defaults";

export type StageName = "parse" | "analysis" | "planning" | "writing" | "critique" | "refinement" | "format";

async function traced<I, O>(traces: AgentTrace[], stage: string, input: I, fn: () => O | Promise<O>): Promise<O> {
  const startedAt = new Date().toISOString();
  const output = await fn();
  traces.push({
    stage,
    input,
    output,
    startedAt,
    finishedAt: new Date().toISOString()
  });
  return output;
}

export async function runPipeline(options: {
  rawInput: RawInput;
  voiceProfile?: VoiceProfile;
  llmMode?: LlmMode;
  stopAfter?: StageName;
}): Promise<Partial<PipelineResult> & { traces: AgentTrace[] }> {
  const traces: AgentTrace[] = [];
  const llm = createLlmAdapter(options.llmMode || "mock");
  const voiceProfile = options.voiceProfile || defaultVoiceProfile;

  const parser = new InputParser();
  const canonical = await traced(traces, parser.stage, options.rawInput, () => parser.run(options.rawInput));
  if (options.stopAfter === "parse") return { canonical, traces };

  const analysisAgent = new AnalysisAgent();
  const analysis = await traced(traces, analysisAgent.stage, canonical, () => analysisAgent.run(canonical));
  if (options.stopAfter === "analysis") return { canonical, analysis, traces };

  const planningAgent = new PlanningAgent();
  const plan = await traced(traces, planningAgent.stage, { canonical, analysis }, () => planningAgent.run({ canonical, analysis }));
  if (options.stopAfter === "planning") return { canonical, analysis, plan, traces };

  const writer = new WriterAgent(llm);
  const draft = await traced(traces, writer.stage, { canonical, plan, voiceProfile }, () => writer.run({ canonical, plan, voiceProfile }));
  if (options.stopAfter === "writing") return { canonical, analysis, plan, draft, traces };

  const critic = new CriticAgent(llm);
  const critique = await traced(traces, critic.stage, { canonical, draft }, () => critic.run({ canonical, draft }));
  if (options.stopAfter === "critique") return { canonical, analysis, plan, draft, critique, traces };

  const refinement = new RefinementAgent(llm);
  const refined = await traced(traces, refinement.stage, { draft, critique }, () => refinement.run({ draft, critique }));
  if (options.stopAfter === "refinement") return { canonical, analysis, plan, draft, critique, refined, traces };

  const formatter = new OutputFormatter();
  const formatted = await traced(traces, formatter.stage, refined, () => formatter.run(refined));

  return { canonical, analysis, plan, draft, critique, refined, formatted, traces };
}

export async function runStage(stage: StageName, rawInput: RawInput, voiceProfile = defaultVoiceProfile, llmMode: LlmMode = "mock") {
  return runPipeline({ rawInput, voiceProfile, llmMode, stopAfter: stage });
}
