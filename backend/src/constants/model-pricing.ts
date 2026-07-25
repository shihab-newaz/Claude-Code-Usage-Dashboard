interface ModelPricing {
  inputCostPerM: number;
  outputCostPerM: number;
}

const MODEL_PRICING: Record<string, ModelPricing> = {
  "claude-opus-4-7": { inputCostPerM: 5.0, outputCostPerM: 25.0 },
  "claude-opus-4-6": { inputCostPerM: 5.0, outputCostPerM: 25.0 },
  "claude-opus-4-5": { inputCostPerM: 5.0, outputCostPerM: 25.0 },
  "claude-opus-4-5-20251101": { inputCostPerM: 5.0, outputCostPerM: 25.0 },
  "claude-opus-4-1": { inputCostPerM: 15.0, outputCostPerM: 75.0 },
  "claude-opus-4-1-20250805": { inputCostPerM: 15.0, outputCostPerM: 75.0 },
  "claude-opus-4-0": { inputCostPerM: 15.0, outputCostPerM: 75.0 },
  "claude-opus-4-20250514": { inputCostPerM: 15.0, outputCostPerM: 75.0 },
  "claude-sonnet-4-6": { inputCostPerM: 3.0, outputCostPerM: 15.0 },
  "claude-sonnet-4-5": { inputCostPerM: 3.0, outputCostPerM: 15.0 },
  "claude-sonnet-4-5-20250929": { inputCostPerM: 3.0, outputCostPerM: 15.0 },
  "claude-sonnet-4-0": { inputCostPerM: 3.0, outputCostPerM: 15.0 },
  "claude-sonnet-4-20250514": { inputCostPerM: 3.0, outputCostPerM: 15.0 },
  "claude-haiku-4-5": { inputCostPerM: 1.0, outputCostPerM: 5.0 },
  "claude-haiku-4-5-20251001": { inputCostPerM: 1.0, outputCostPerM: 5.0 },
};

const DEFAULT_PRICING: ModelPricing = { inputCostPerM: 3.0, outputCostPerM: 15.0 };

export function getModelPricing(model: string): ModelPricing {
  if (MODEL_PRICING[model]) return MODEL_PRICING[model];
  for (const [key, pricing] of Object.entries(MODEL_PRICING)) {
    if (model.startsWith(key)) return pricing;
  }
  return DEFAULT_PRICING;
}

export function estimateCostForModel(
  model: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const { inputCostPerM, outputCostPerM } = getModelPricing(model);
  return (inputTokens * inputCostPerM + outputTokens * outputCostPerM) / 1_000_000;
}
