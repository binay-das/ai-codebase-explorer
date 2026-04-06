import { generateEmbedding, generateText } from "@/lib/ai/aiService";
import { retrieveTopK } from "@/lib/ai/retrieval/retrieve";
import { buildContext } from "@/lib/ai/retrieval/buildContext";
import { buildRagPrompt } from "@/lib/ai/prompts/ragPrompt";

const errorMsg = "i'm sorry, i encountered an error while searching the repository. please try again later.";

export type AskRepoSource = {
    filePath: string;
    snippet: string;
    score: number;
};

export type AskRepoResult = {
    answer: string;
    sources: AskRepoSource[];
};

// build a compact snippet from a retrieved chunk
function toSnippet(content: string): string {
    const normalized = content.replace(/\s+/g, " ").trim();
    const maxLength = 180;

    if (normalized.length <= maxLength) {
        return normalized;
    }

    return `${normalized.slice(0, maxLength).trimEnd()}...`;
}

// query the repository using a rag pipeline with error handling
export async function askRepo(question: string): Promise<AskRepoResult> {
    try {
        const queryVector = await generateEmbedding(question);
        const topChunks = retrieveTopK(queryVector, 10);
        const context = buildContext(topChunks);
        const prompt = buildRagPrompt(question, context);
        const answer = await generateText(prompt);
        const sources = topChunks.slice(0, 4).map((chunk) => ({
            filePath: chunk.filePath,
            snippet: toSnippet(chunk.content),
            score: chunk.score,
        }));

        return { answer, sources };
    } catch (error) {
        console.error("error in askRepo:", error);
        return {
            answer: errorMsg,
            sources: [],
        };
    }
}
