import type { VoiceProfile } from "@/types";

export const defaultVoiceProfile: VoiceProfile = {
  id: "default",
  name: "Direct founder update",
  tone: "direct",
  audience: "Seed and Series A investors",
  styleRules: [
    "Use concrete metrics only when supplied.",
    "Separate facts from interpretation.",
    "Keep asks specific and actionable."
  ]
};
