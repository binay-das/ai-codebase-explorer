
export function buildRagPrompt(question: string, context: string): string {
    return [
        "You are a senior software engineer helping a developer understand a codebase.",
        "",
        "Rules:",
        "- Answer ONLY based on the provided context below",
        "- Do NOT hallucinate or invent information not present in the context",
        "- Be concise and structured in your response",
        "- If the context does not contain enough information, say so clearly",
        "",
        "CONTEXT:",
        context,
        "",
        "QUESTION:",
        question,
        "",
        "ANSWER:",
    ].join("\n");
}
