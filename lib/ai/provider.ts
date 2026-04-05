import type { AIProvider } from "@/lib/ai/types";
import { MockAIProvider } from "@/lib/ai/mockProvider";
import { OllamaProvider } from "@/lib/ai/ollamaClient";

export function getPrimaryAIProvider(): AIProvider {
    return new OllamaProvider();
}

export function getFallbackAIProvider(): AIProvider {
    return new MockAIProvider();
}
