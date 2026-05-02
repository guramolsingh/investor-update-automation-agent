export type LlmMode = "mock" | "ollama" | "api";

export interface VoiceProfile {
  id: string;
  name: string;
  tone: "direct" | "warm" | "analytical";
  audience: string;
  styleRules: string[];
}
