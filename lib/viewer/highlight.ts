import { createHighlighter, type Highlighter } from "shiki";

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
    if (!highlighterPromise) {
        highlighterPromise = createHighlighter({
            themes: ["github-light"],
            langs: [
                "typescript", "tsx", "javascript", "jsx",
                "html", "css", "scss", "json", "yaml", "toml",
                "python", "rust", "go", "java", "kotlin", "ruby",
                "php", "csharp", "cpp", "c", "swift", "bash",
                "markdown", "sql", "graphql", "dockerfile", "plaintext",
            ],
        });
    }
    return highlighterPromise;
}

export async function highlightCode(
    code: string,
    language: string
): Promise<string> {
    try {
        const hl = await getHighlighter();

        // Shiki throws if language is not loaded — fall back gracefully
        const availableLangs = hl.getLoadedLanguages();
        const lang = availableLangs.includes(language) ? language : "plaintext";

        return hl.codeToHtml(code, { lang, theme: "github-light" });
    } catch {
        // Return escaped plain text as fallback
        return `<pre><code>${escapeHtml(code)}</code></pre>`;
    }
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
