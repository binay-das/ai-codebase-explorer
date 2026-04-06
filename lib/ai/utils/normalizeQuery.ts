// normalize repeated user queries for cache lookups
export function normalizeQuery(question: string): string {
    return question
        .toLowerCase()
        .trim()
        .replace(/[“”]/g, "\"")
        .replace(/[‘’]/g, "'")
        .replace(/[–—]/g, "-")
        .replace(/\s*([,.;:!?])\s*/g, "$1 ")
        .replace(/([,.;:!?])\1+/g, "$1")
        .replace(/\s+/g, " ")
        .trim();
}
