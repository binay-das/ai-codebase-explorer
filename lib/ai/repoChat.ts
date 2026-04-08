import { generateEmbedding, generateText } from "@/lib/ai/aiService";
import {
    assessRetrieval,
    type RetrievalStatus,
} from "@/lib/ai/retrieval/retrieve";
import { buildContext } from "@/lib/ai/retrieval/buildContext";
import { buildRagPrompt } from "@/lib/ai/prompts/ragPrompt";
import { chatCache } from "@/lib/cache/chatCache";

const errorMsg = "i'm sorry, i encountered an error while searching the repository. please try again later.";

export type AskRepoSource = {
    filePath: string;
    snippet: string;
    score: number;
};

export type AskRepoResult = {
    answer: string;
    sources: AskRepoSource[];
    retrievalStatus: RetrievalStatus;
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

function buildFallbackAnswer(status: RetrievalStatus): string {
    switch (status) {
        case "empty_index":
            return [
                "I couldn't find any indexed repository content to search yet.",
                "Try ingesting and indexing the repository before asking a codebase question.",
            ].join("\n\n");
        case "no_match":
            return [
                "I couldn't find any relevant repository context for that question.",
                "Try using exact filenames, symbols, directories, or error messages so I can retrieve a closer match.",
            ].join("\n\n");
        case "low_confidence":
            return [
                "I found a few possible matches, but they weren't strong enough to answer reliably.",
                "Please rephrase with a more specific file path, function name, class name, or code snippet.",
            ].join("\n\n");
        case "ready":
            return "";
    }
}

// query the repository using a rag pipeline with error handling
export async function askRepo(question: string): Promise<AskRepoResult> {
    try {
        const cached = chatCache.get(question);

        if (cached) {
            return cached;
        }

        const queryVector = await generateEmbedding(question);
        const retrieval = assessRetrieval(queryVector, 10);

        if (retrieval.status !== "ready") {
            const result = {
                answer: buildFallbackAnswer(retrieval.status),
                sources: [],
                retrievalStatus: retrieval.status,
            };
            chatCache.set(question, result);
            return result;
        }

        const context = buildContext(retrieval.results);
        if (!context.trim()) {
            const result = {
                answer: buildFallbackAnswer("no_match"),
                sources: [],
                retrievalStatus: "no_match" as const,
            };
            chatCache.set(question, result);
            return result;
        }

        const prompt = buildRagPrompt(question, context);
        const answer = await generateText(prompt, context);
        const sources = retrieval.results.slice(0, 4).map((chunk) => ({
            filePath: chunk.filePath,
            snippet: toSnippet(chunk.content),
            score: chunk.score,
        }));

        const result = {
            answer,
            sources,
            retrievalStatus: "ready" as const,
        };
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
