import { generateEmbedding } from "@/lib/ai/aiService"

// generate embeddings for file chunks
export async function generateEmbeddings(chunks: string[]): Promise<number[][]> {
    const vectors: number[][] = [];
    for (const chunk of chunks) {
        const vec = await generateEmbedding(chunk);
        vectors.push(vec);
    }
    return vectors;
}
