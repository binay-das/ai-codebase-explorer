import { getFallbackAIProvider, getPrimaryAIProvider } from "@/lib/ai/provider";

const primaryProvider = getPrimaryAIProvider();
const fallbackProvider = getFallbackAIProvider();

type ProviderName = "primary" | "fallback";

interface AIRequestLog {
    operation: string;
    providerName: ProviderName;
    promptLength: number;
    attempt: number;
    success: boolean;
    errorMessage?: string;
    durationMs: number;
}

function logAIRequest(entry: AIRequestLog): void {
    const status = entry.success ? "✓" : "✗";
    const parts = [
        `[AI] ${status} ${entry.operation}`,
        `provider=${entry.providerName}`,
        `attempt=${entry.attempt}`,
        `promptLength=${entry.promptLength}`,
        `duration=${entry.durationMs}ms`,
    ];

    if (!entry.success && entry.errorMessage) {
        parts.push(`error=${entry.errorMessage}`);
    }

    console.debug(parts.join(" | "));
}


const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 300;

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}


async function withRetry<T>(
    fn: () => Promise<T>,
    operation: string,
    providerName: ProviderName,
    promptLength: number
): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        const start = Date.now();
        try {
            const result = await fn();
            logAIRequest({
                operation,
                providerName,
                promptLength,
                attempt,
                success: true,
                durationMs: Date.now() - start,
            });
            return result;
        } catch (error) {
            lastError = error;
            logAIRequest({
                operation,
                providerName,
                promptLength,
                attempt,
                success: false,
                errorMessage: error instanceof Error ? error.message : "Unknown error",
                durationMs: Date.now() - start,
            });

            const isLastAttempt = attempt === MAX_RETRIES;
            if (!isLastAttempt) {
                await delay(RETRY_BASE_DELAY_MS * attempt);
            }
        }
    }

    throw lastError;
}



async function withFallback<T>(
    operation: string,
    promptLength: number,
    fn: (useFallback: boolean) => Promise<T>
): Promise<T> {
    try {
        return await withRetry(() => fn(false), operation, "primary", promptLength);
    } catch {
        // primary exhausted — attempt fallback once (no retry on mock provider)
        const start = Date.now();
        try {
            const result = await fn(true);
            logAIRequest({
                operation,
                providerName: "fallback",
                promptLength,
                attempt: 1,
                success: true,
                durationMs: Date.now() - start,
            });
            return result;
        } catch (fallbackError) {
            logAIRequest({
                operation,
                providerName: "fallback",
                promptLength,
                attempt: 1,
                success: false,
                errorMessage:
                    fallbackError instanceof Error ? fallbackError.message : "Unknown error",
                durationMs: Date.now() - start,
            });
            throw fallbackError;
        }
    }
}


export async function generateText(prompt: string, context?: string): Promise<string> {
    return withFallback("generateText", prompt.length, (useFallback) => {
        const provider = useFallback ? fallbackProvider : primaryProvider;
        return provider.generateText({ prompt, context });
    });
}

export async function generateEmbedding(text: string): Promise<number[]> {
    return withFallback("generateEmbedding", text.length, (useFallback) => {
        const provider = useFallback ? fallbackProvider : primaryProvider;
        return provider.generateEmbedding({ text });
    });
}
