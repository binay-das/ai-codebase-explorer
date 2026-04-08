import {
    runRepoRagPipeline,
    type RagAnswer,
    type RagSource,
} from "@/lib/ai/rag/pipeline";
import { chatCache } from "@/lib/cache/chatCache";

const errorMsg = "i'm sorry, i encountered an error while searching the repository. please try again later.";

export type AskRepoSource = RagSource;
export type AskRepoResult = RagAnswer;

// query the repository using a rag pipeline with error handling
export async function askRepo(question: string): Promise<AskRepoResult> {
    try {
        const cached = chatCache.get(question);

        if (cached) {
            return cached;
        }

        const result = await runRepoRagPipeline(question);
        chatCache.set(question, result);
        return result;
    } catch (error) {
        console.error("error in askRepo:", error);
        return {
            answer: errorMsg,
            sources: [],
            retrievalStatus: "no_match",
        };
    }
}
