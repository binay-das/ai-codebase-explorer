
//  builds the structured prompt sent to the AI provider for file explanation

//  the prompt explicitly instructs the model to use the four section headings
//  that `normalizeResponse.parseExplanationResponse` expects to parse
//  do NOT move prompt strings into components or services

export function buildExplainFilePrompt(fileContent: string, filePath: string): string {
    return [
        "You are a senior software engineer doing a code review.",
        "Explain the provided source file concisely and without fluff.",
        "Your response MUST use exactly these four section headings (plain text, no markdown bold/italic):",
        "",
        "Purpose",
        "Key components/functions",
        "Dependencies",
        "How it fits in project",
        "",
        "Each section heading must appear on its own line followed immediately by content.",
        "Do NOT add any preamble, greeting, or closing remarks.",
        "",
        `File path: ${filePath}`,
        "",
        "File content:",
        fileContent,
    ].join("\n");
}
