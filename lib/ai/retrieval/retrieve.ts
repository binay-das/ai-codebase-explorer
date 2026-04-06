import { getAll, type VectorEntry } from "@/lib/ai/vectorStore";
import { cosineSimilarity } from "@/lib/ai/retrieval/similarity";

export type ScoredEntry = VectorEntry & { score: number };

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
