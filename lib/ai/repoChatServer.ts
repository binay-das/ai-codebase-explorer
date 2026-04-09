import { runRepoRagPipeline, type RagAnswer, type RagSource } from "@/lib/ai/rag/pipeline";

const errorMsg = "i'm sorry, i encountered an error while searching the repository. please try again later.";

export type AskRepoSource = RagSource;
export type AskRepoResult = RagAnswer;

const cache = new Map<string, AskRepoResult>();

function toCacheKey(repoKey: string, question: string): string {
    return `${repoKey}:${question.trim().toLowerCase()}`;
}

export async function askRepoServer(question: string, repoKey: string): Promise<AskRepoResult> {
    try {
        const cacheKey = toCacheKey(repoKey, question);
        const cached = cache.get(cacheKey);

        if (cached) {
            return cached;
        }

        const result = await runRepoRagPipeline(question);
        cache.set(cacheKey, result);
        return result;
    } catch (error) {
        console.error("error in askRepoServer:", error);
        return {
            answer: errorMsg,
            sources: [],
            retrievalStatus: "no_match",
        };
    }
}
