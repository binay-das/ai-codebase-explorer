// split file content into line‑based chunks for embedding


export function chunkFileContent(content: string): string[] {
    if (!content) {
        return [];
    }

    const lines = content.split("\n");
    const maxLines = 200;
    const chunks: string[] = [];
    for (let i = 0; i < lines.length; i += maxLines) {
        const slice = lines.slice(i, i + maxLines);
        const chunk = slice.join("\n").trim();

        if (chunk) {
            chunks.push(chunk);
        }

    }

    return chunks;
}
