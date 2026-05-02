import fs from "node:fs/promises";
import path from "node:path";
import type { LlmMode } from "@/types";

export interface GenerateOptions {
  temperature?: number;
  model?: string;
}

export interface GenerateResult<T = unknown> {
  output: T;
  tokens: {
    prompt: number;
    completion: number;
  };
  metadata: {
    mode: LlmMode;
    model: string;
    promptId: string;
    deterministic: boolean;
  };
}

export interface LlmAdapter {
  generate<T = unknown>(promptId: string, input: unknown, options?: GenerateOptions): Promise<GenerateResult<T>>;
}

export class MockLlmAdapter implements LlmAdapter {
  constructor(private readonly responseDir = path.join(process.cwd(), "mock-responses")) {}

  async generate<T = unknown>(promptId: string, input: unknown): Promise<GenerateResult<T>> {
    const filePath = path.join(this.responseDir, `${promptId}.json`);
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as { default: T; variants?: Record<string, T> };
    const variantKey = typeof input === "object" && input && "variant" in input ? String((input as { variant: string }).variant) : "";
    const output = (variantKey && parsed.variants?.[variantKey]) || parsed.default;

    return {
      output,
      tokens: {
        prompt: JSON.stringify(input).length,
        completion: JSON.stringify(output).length
      },
      metadata: {
        mode: "mock",
        model: "deterministic-fixture",
        promptId,
        deterministic: true
      }
    };
  }
}

export class OllamaAdapter implements LlmAdapter {
  constructor(private readonly endpoint = process.env.OLLAMA_HOST || "http://localhost:11434") {}

  async generate<T = unknown>(promptId: string, input: unknown, options: GenerateOptions = {}): Promise<GenerateResult<T>> {
    const promptPath = path.join(process.cwd(), "prompts", `${promptId}.json`);
    const template = JSON.parse(await fs.readFile(promptPath, "utf8"));
    const prompt = `${template.role}\n${template.instructions}\nInput:\n${JSON.stringify(input, null, 2)}\nReturn JSON only.`;
    const model = options.model || process.env.OLLAMA_MODEL || "llama3.2";

    const response = await fetch(`${this.endpoint}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt, stream: false, format: "json", options: { temperature: options.temperature ?? 0.1 } })
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as { response: string; prompt_eval_count?: number; eval_count?: number };
    return {
      output: JSON.parse(payload.response) as T,
      tokens: {
        prompt: payload.prompt_eval_count ?? prompt.length,
        completion: payload.eval_count ?? payload.response.length
      },
      metadata: {
        mode: "ollama",
        model,
        promptId,
        deterministic: false
      }
    };
  }
}

export class ApiPlaceholderAdapter implements LlmAdapter {
  async generate<T = unknown>(): Promise<GenerateResult<T>> {
    throw new Error("API mode is intentionally a placeholder. Configure your own provider adapter without storing secrets in this repo.");
  }
}

export function createLlmAdapter(mode: LlmMode = (process.env.LLM_MODE as LlmMode) || "mock"): LlmAdapter {
  if (mode === "ollama") return new OllamaAdapter();
  if (mode === "api") return new ApiPlaceholderAdapter();
  return new MockLlmAdapter();
}
