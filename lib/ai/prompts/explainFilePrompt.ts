// the four section headings below should match what normalizeResponse.parseExplanationResponse expects to parse


export function buildExplainFilePrompt(fileContent: string, filePath: string): string {
    return [
        "You are a senior software engineer performing a precise code review.",
        "Your task: explain the source file at the path shown below.",
        "",
        "OUTPUT FORMAT — follow this exactly:",
        "  1. Write each section heading as plain text on its own line (no #, **, or *).",
        "  2. Immediately after the heading, write the section content on the next line(s).",
        "  3. Leave one blank line between sections.",
        "  4. Do NOT add a preamble, greeting, summary, or closing statement.",
        "  5. Do NOT use markdown formatting (no bold, no bullets, no headers).",
        "",
        "SECTIONS (use these exact headings):",
        "",
        "Purpose",
        "  Describe what this file does in 1-3 sentences.",
        "",
        "Key components/functions",
        "  List the most important exports, classes, or functions.",
        "  For each, give one sentence explaining its role.",
        "",
        "Dependencies",
        "  List the external packages and internal modules imported by this file.",
        "  Briefly explain why each dependency is needed.",
        "",
        "How it fits in project",
        "  Explain how this file connects to the rest of the codebase.",
        "  Mention what calls or consumes it, and what it depends on.",
        "",
        "---",
        `File path: ${filePath}`,
        "",
        "File content:",
        fileContent,
    ].join("\n");
}
