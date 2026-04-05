import type { AIProvider } from "@/lib/ai/types";
import { OllamaProvider } from "@/lib/ai/ollamaClient";

export function getAIProvider(): AIProvider {
    return new OllamaProvider();
}
