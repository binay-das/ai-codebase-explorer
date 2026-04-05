import type { AIProvider, GenerateEmbeddingInput, GenerateTextInput } from "@/lib/ai/types";

const MOCK_EMBEDDING_SIZE = 128;

function buildMockSummary(prompt: string): string {
    const normalizedPrompt = prompt.trim();

    if (!normalizedPrompt) {
        return "This is a mock AI response for an empty prompt.";
    }

    const firstLine = normalizedPrompt.split("\n")[0]?.trim() || normalizedPrompt;
    return `This is a mock analysis of: ${firstLine.slice(0, 120)}.`;
}

function buildMockDetails(context?: string): string[] {
    const hasContext = Boolean(context?.trim());

    return [
        "Key points:",
        "- The mock provider is active, so this response is safe for offline development.",
        hasContext
            ? "- Context was supplied and would normally help ground a real AI response."
            : "- No extra context was supplied, so the analysis is based only on the prompt.",
        "- The structure matches the expected production response shape for UI integration.",
        "Analysis:",
        "The file or request appears to be part of the codebase exploration workflow. Replace this fallback with a live provider response when Ollama is available.",
    ];
}

export class MockAIProvider implements AIProvider {
    async generateText(input: GenerateTextInput): Promise<string> {
        const summary = buildMockSummary(input.prompt);
        const details = buildMockDetails(input.context);

        return [summary, ...details].join("\n");
    }

    async generateEmbedding(input: GenerateEmbeddingInput): Promise<number[]> {
        void input;
        return Array.from({ length: MOCK_EMBEDDING_SIZE }, (_, index) => index * 0.01);
    }
}
