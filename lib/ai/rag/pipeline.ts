import { generateEmbedding, generateText } from "@/lib/ai/aiService";
import { buildRagPrompt } from "@/lib/ai/prompts/ragPrompt";
import { buildContext } from "@/lib/ai/retrieval/buildContext";
import {
    assessRetrieval,
    type RetrievalStatus,
} from "@/lib/ai/retrieval/retrieve";

const TOP_K_RESULTS = 10;
const MAX_SOURCE_COUNT = 4;

export type RagSource = {
    filePath: string;
    snippet: string;
    score: number;
};

export type RagAnswer = {
    answer: string;
    sources: RagSource[];
    retrievalStatus: RetrievalStatus;
};

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

export async function runRepoRagPipeline(question: string): Promise<RagAnswer> {
    const queryVector = await generateEmbedding(question);
    const retrieval = assessRetrieval(queryVector, TOP_K_RESULTS);

    if (retrieval.status !== "ready") {
        return {
            answer: buildFallbackAnswer(retrieval.status),
            sources: [],
            retrievalStatus: retrieval.status,
        };
    }

    const context = buildContext(retrieval.results);

    if (!context.trim()) {
        return {
            answer: buildFallbackAnswer("no_match"),
            sources: [],
            retrievalStatus: "no_match",
        };
    }

    const prompt = buildRagPrompt(question, context);
    const answer = await generateText(prompt, context);
    const sources = retrieval.results.slice(0, MAX_SOURCE_COUNT).map((chunk) => ({
        filePath: chunk.filePath,
        snippet: toSnippet(chunk.content),
        score: chunk.score,
    }));

    return {
        answer,
        sources,
        retrievalStatus: "ready",
    };
}
