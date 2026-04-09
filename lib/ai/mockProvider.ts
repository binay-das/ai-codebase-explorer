import type { AIProvider, GenerateEmbeddingInput, GenerateTextInput } from "@/lib/ai/types";

const MOCK_EMBEDDING_SIZE = 128;
const TOKEN_PATTERN = /[a-z0-9_./-]+/gi;

function tokenize(text: string): string[] {
    return text.toLowerCase().match(TOKEN_PATTERN) ?? [];
}

function hashToken(token: string): number {
    let hash = 0;

    for (let i = 0; i < token.length; i++) {
        hash = (hash * 31 + token.charCodeAt(i)) >>> 0;
    }

    return hash;
}

function buildMockEmbedding(text: string): number[] {
    const vector = Array.from({ length: MOCK_EMBEDDING_SIZE }, () => 0);
    const tokens = tokenize(text);

    if (tokens.length === 0) {
        return vector;
    }

    for (const token of tokens) {
        const hash = hashToken(token);
        const index = hash % MOCK_EMBEDDING_SIZE;
        const weight = 1 + (token.length % 5);
        vector[index] += weight;
    }

    const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
    if (magnitude === 0) {
        return vector;
    }

    return vector.map((value) => value / magnitude);
}

function buildMockSummary(prompt: string, context?: string): string {
    const normalizedPrompt = prompt.trim();

    if (!normalizedPrompt) {
        return "Mock fallback response: the prompt was empty.";
    }

    if (!context?.trim()) {
        return `Mock fallback response: no indexed repository context was available for "${normalizedPrompt.slice(0, 120)}".`;
    }

    const files = Array.from(
        new Set(
            context
                .split("\n")
                .filter((line) => line.startsWith("FILE: "))
                .map((line) => line.replace("FILE: ", "").trim())
        )
    ).slice(0, 3);

    const fileSummary = files.length > 0 ? files.join(", ") : "the retrieved files";
    return `Mock fallback response grounded in ${fileSummary}.`;
}

function buildMockDetails(context?: string): string[] {
    if (!context?.trim()) {
        return [
            "Key points:",
            "- Ollama was unavailable, so the offline fallback provider answered instead.",
            "- No repository context was available to ground the answer.",
        ];
    }

    const excerpts = context
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("FILE: "))
        .slice(0, 4)
        .map((line) => `- ${line.slice(0, 160)}`);

    return [
        "Key points:",
        "- Ollama was unavailable, so the offline fallback provider answered instead.",
        "- The answer is grounded in retrieved repository snippets.",
        "Relevant excerpts:",
        ...excerpts,
    ];
}

export class MockAIProvider implements AIProvider {
    async generateText(input: GenerateTextInput): Promise<string> {
        const summary = buildMockSummary(input.prompt, input.context);
        const details = buildMockDetails(input.context);

        return [summary, ...details].join("\n");
    }

    async generateEmbedding(input: GenerateEmbeddingInput): Promise<number[]> {
        return buildMockEmbedding(input.text);
    }
}
