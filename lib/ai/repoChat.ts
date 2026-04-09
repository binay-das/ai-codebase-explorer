import {
    type RagAnswer,
    type RagSource,
} from "@/lib/ai/rag/pipeline";
import { useRepoStore } from "@/lib/store/repoStore";

const errorMsg = "i'm sorry, i encountered an error while searching the repository. please try again later.";

export type AskRepoSource = RagSource;
export type AskRepoResult = RagAnswer;

// query the repository using a rag pipeline with error handling
export async function askRepo(question: string): Promise<AskRepoResult> {
    try {
        const repoKey = useRepoStore.getState().repo?.full_name;
        if (!repoKey) {
            return {
                answer: "No repository is loaded yet.",
                sources: [],
                retrievalStatus: "no_match",
            };
        }

        const response = await fetch("/api/ai/repo-chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ question, repoKey }),
        });

        const data = (await response.json()) as RagAnswer | { error?: string };
        if (!response.ok) {
            throw new Error("error" in data && data.error ? data.error : errorMsg);
        }

        return data as AskRepoResult;
    } catch (error) {
        console.error("error in askRepo:", error);
        return {
            answer: errorMsg,
            sources: [],
            retrievalStatus: "no_match",
        };
    }
}
