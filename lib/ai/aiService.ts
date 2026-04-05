import { getFallbackAIProvider, getPrimaryAIProvider } from "@/lib/ai/provider";

const primaryProvider = getPrimaryAIProvider();
const fallbackProvider = getFallbackAIProvider();

// ---------------------------------------------------------------------------
// Retry helpers
// ---------------------------------------------------------------------------

const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 300;

/** Waits for `ms` milliseconds. */
function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}


// retries fn up to MAX_RETRIES times on failure
// using a simple exponential backoff (300ms, 600ms, 1200ms)
// returns the first successful result
// throws the last encountered error when all attempts are exhausted

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            const isLastAttempt = attempt === MAX_RETRIES;
            if (!isLastAttempt) {
                await delay(RETRY_BASE_DELAY_MS * attempt);
            }
        }
    }

    throw lastError;
}



// tries operation(false) (primary provider) with retries
// if all retries fail, falls through to `operation(true)` (fallback provider)
// without additional retries

async function withFallback<T>(operation: (useFallback: boolean) => Promise<T>): Promise<T> {
    try {
        return await withRetry(() => operation(false));
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
