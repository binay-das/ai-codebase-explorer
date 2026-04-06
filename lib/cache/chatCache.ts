import type { AskRepoResult } from "@/lib/ai/repoChat";

// normalize a question for cache lookup
function toCacheKey(question: string): string {
    return question.trim().toLowerCase();
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
