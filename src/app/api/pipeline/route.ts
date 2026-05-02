import { NextResponse } from "next/server";
import { runPipeline, type StageName } from "@/lib/pipeline";
import type { LlmMode, VoiceProfile } from "@/types";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    rawInput: unknown;
    voiceProfile?: VoiceProfile;
    llmMode?: LlmMode;
    stopAfter?: StageName;
  };

  const result = await runPipeline({
    rawInput: body.rawInput as never,
    voiceProfile: body.voiceProfile,
    llmMode: body.llmMode || "mock",
    stopAfter: body.stopAfter
  });

  return NextResponse.json(result);
}
