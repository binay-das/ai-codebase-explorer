export function buildExplainFilePrompt(fileContent: string, filePath: string): string {
    return [
        "You are a senior software engineer.",
        "Explain the provided source file in a concise, structured way with no fluff.",
        "Use the following sections exactly:",
        "Purpose",
        "Key components/functions",
        "Dependencies",
        "How it fits in project",
        "",
        `File path: ${filePath}`,
        "",
        "File content:",
        fileContent,
    ].join("\n");
}
