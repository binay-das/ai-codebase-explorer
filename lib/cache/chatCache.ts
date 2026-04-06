import type { AskRepoResult } from "@/lib/ai/repoChat";
import { normalizeQuery } from "@/lib/ai/utils/normalizeQuery";

// normalize a question for cache lookup
function toCacheKey(question: string): string {
    return normalizeQuery(question);
}

const cache = new Map<string, AskRepoResult>();

export const chatCache = {
    get(question: string): AskRepoResult | undefined {
        return cache.get(toCacheKey(question));
    },

    set(question: string, value: AskRepoResult): void {
        cache.set(toCacheKey(question), value);
    },

    has(question: string): boolean {
        return cache.has(toCacheKey(question));
    },

    clear(): void {
        cache.clear();
    },
};
