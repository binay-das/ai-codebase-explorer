import { add } from "@/lib/ai/vectorStore";
import { chunkFileContent } from "@/lib/ai/embeddings/chunkFile";
import { generateEmbeddings } from "@/lib/ai/embeddings/generateEmbeddings";


// index file content for rag
export async function indexFile(filePath: string, content: string): Promise<void> {
    const chunks = chunkFileContent(content);
    if (chunks.length === 0) {
        return;
    }

    const vectors = await generateEmbeddings(chunks);
    
    for (let i = 0; i < chunks.length; i++) {
        const entry = {
            id: crypto.randomUUID(),
            vector: vectors[i],
            filePath,
            content: chunks[i],
        }
        add(entry)
    }
}
