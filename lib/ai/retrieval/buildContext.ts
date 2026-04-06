import type { VectorEntry } from "@/lib/ai/vectorStore";

const MAX_CONTEXT_CHARS = 6_000;

// build context string from retrieved vector entries
export function buildContext(results: VectorEntry[]): string {
    const sections: string[] = [];
    let totalLength = 0;

    for (const entry of results) {
        const section = `FILE: ${entry.filePath}\n${entry.content}`;

        if (totalLength + section.length > MAX_CONTEXT_CHARS) {
            const remaining = MAX_CONTEXT_CHARS - totalLength;
            if (remaining > 50) {
                sections.push(section.slice(0, remaining));
            }
            break;
        }

        sections.push(section);
        totalLength += section.length;
    }

    return sections.join("\n\n");
}
