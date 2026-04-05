import { getFallbackAIProvider, getPrimaryAIProvider } from "@/lib/ai/provider";

const primaryProvider = getPrimaryAIProvider();
const fallbackProvider = getFallbackAIProvider();

async function withFallback<T>(operation: (useFallback: boolean) => Promise<T>): Promise<T> {
    try {
        return await operation(false);
    } catch {
        return operation(true);
    }
}

export async function generateText(prompt: string, context?: string): Promise<string> {
    return withFallback((useFallback) => {
        const provider = useFallback ? fallbackProvider : primaryProvider;
        return provider.generateText({ prompt, context });
    });
}

export async function generateEmbedding(text: string): Promise<number[]> {
    return withFallback((useFallback) => {
        const provider = useFallback ? fallbackProvider : primaryProvider;
        return provider.generateEmbedding({ text });
    });
}
