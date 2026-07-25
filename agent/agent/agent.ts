import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { defineAgent } from "eve";

const ollama = createOpenAICompatible({
  name: "ollama",
  baseURL: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1",
});

export default defineAgent({
  model: ollama(process.env.OLLAMA_MODEL ?? "gemma4:12b-it-qat"),
  // Ollama isn't in the AI Gateway model catalog, so eve can't look up its
  // context window automatically. This is a conservative estimate for local
  // hardware, not the model's architectural max (256K for gemma4, 128K for
  // llama3.1) — Ollama's real runtime context is capped much lower by default.
  modelContextWindowTokens: 8192,
});
