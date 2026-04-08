import { getAll, type VectorEntry } from "@/lib/ai/vectorStore";
import { cosineSimilarity } from "@/lib/ai/retrieval/similarity";

export type ScoredEntry = VectorEntry & { score: number };
export type RetrievalStatus = "ready" | "empty_index" | "no_match" | "low_confidence";

export type RetrievalAssessment = {
    status: RetrievalStatus;
    results: ScoredEntry[];
    topScore: number | null;
};

const MIN_RELEVANT_SCORE = 0.2;
const MIN_CONFIDENT_SCORE = 0.35;

// retrieve top-k most similar entries from the vector store
export function retrieveTopK(queryVector: number[], k: number): ScoredEntry[] {
    const entries = getAll();

    const scored: ScoredEntry[] = entries.map((entry) => ({
        ...entry,
        score: cosineSimilarity(queryVector, entry.vector),
    }));

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, k);
}

export function assessRetrieval(queryVector: number[], k: number): RetrievalAssessment {
    const entries = getAll();

    if (entries.length === 0) {
        return {
            status: "empty_index",
            results: [],
            topScore: null,
        };
    }

    const scored = retrieveTopK(queryVector, k);
    const topScore = scored[0]?.score ?? null;

    if (topScore === null || topScore < MIN_RELEVANT_SCORE) {
        return {
            status: "no_match",
            results: [],
            topScore,
        };
    }

    if (topScore < MIN_CONFIDENT_SCORE) {
        return {
            status: "low_confidence",
            results: [],
            topScore,
        };
    }

    return {
        status: "ready",
        results: scored,
        topScore,
    };
}
