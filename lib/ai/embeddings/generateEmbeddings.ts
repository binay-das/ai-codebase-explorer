import { generateEmbedding } from "@/lib/ai/aiService";

const EMBEDDING_BATCH_SIZE = 1;

function toBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];

    for (let index = 0; index < items.length; index += batchSize) {
        batches.push(items.slice(index, index + batchSize));
    }

    return batches;
}

// generate embeddings for file chunks in small concurrent batches
export async function generateEmbeddings(chunks: string[]): Promise<number[][]> {
    const vectors: number[][] = [];

    for (const batch of toBatches(chunks, EMBEDDING_BATCH_SIZE)) {
        const batchVectors = await Promise.all(
            batch.map((chunk) => generateEmbedding(chunk))
        );
        vectors.push(...batchVectors);
    }

    return vectors;
}
