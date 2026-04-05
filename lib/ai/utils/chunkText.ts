
// splits a large text body into chunks no larger than maxChars
// splits on newline boundaries where possible to avoid breaking mid-line.

export function chunkText(text: string, maxChars: number = 3_000): string[] {
    if (!text || text.length <= maxChars) {
        return [text];
    }

    const chunks: string[] = [];
    const lines = text.split("\n");
    let current = "";

    for (const line of lines) {
        const addition = current.length === 0 ? line : `\n${line}`;

        if (current.length + addition.length > maxChars) {
            if (current.length > 0) {
                chunks.push(current);
                current = line;
            } else {
                // Single line longer than maxChars — hard split
                chunks.push(line.slice(0, maxChars));
                current = line.slice(maxChars);
            }
        } else {
            current += addition;
        }
    }

    if (current.length > 0) {
        chunks.push(current);
    }

    return chunks;
}

// builds a representative sample for AI consumption when a file is too large
// to send in full. Keeps the head (imports, module declaration) and tail
// (likely exports) while skipping the middle body.

// @param text     Full file content
// @param maxChars Character budget for the sample
 
export function sampleLargeText(text: string, maxChars: number = 3_000): string {
    if (text.length <= maxChars) {
        return text;
    }

    const headBudget = Math.floor(maxChars * 0.6);
    const tailBudget = maxChars - headBudget;

    const head = text.slice(0, headBudget);
    const tail = text.slice(text.length - tailBudget);

    return [
        head,
        "\n\n// ... [middle section omitted for brevity] ...\n\n",
        tail,
    ].join("");
}
