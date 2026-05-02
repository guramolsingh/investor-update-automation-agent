import { NextResponse } from "next/server";
import { defaultVoiceProfile } from "@/lib/defaults";
import { listJson, saveJson } from "@/lib/storage";
import type { VoiceProfile } from "@/types";

export async function GET() {
  const profiles = await listJson<VoiceProfile>("voice-profiles");
  return NextResponse.json(profiles.length ? profiles : [defaultVoiceProfile]);
}

export async function POST(request: Request) {
  const profile = (await request.json()) as VoiceProfile;
  return NextResponse.json(await saveJson("voice-profiles", profile));
}
