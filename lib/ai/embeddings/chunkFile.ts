import { chunkText } from "@/lib/ai/utils/chunkText";

const MAX_CHUNK_CHARS = 2_000;
const MAX_CHUNK_LINES = 80;

// split file content into bounded chunks for embedding
export function chunkFileContent(content: string): string[] {
    if (!content) {
        return [];
    }

    const boundedByChars = chunkText(content, MAX_CHUNK_CHARS);
    const chunks: string[] = [];

    for (const block of boundedByChars) {
        const lines = block.split("\n");

        for (let i = 0; i < lines.length; i += MAX_CHUNK_LINES) {
            const chunk = lines.slice(i, i + MAX_CHUNK_LINES).join("\n").trim();
            if (chunk) {
                chunks.push(chunk);
            }
        }
    }

    return chunks;
}
