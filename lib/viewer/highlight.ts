import { createHighlighter, type Highlighter, type ThemedToken } from "shiki";

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

// tokenize code for viewer rendering
export async function tokenizeCode(
    code: string,
    language: string
): Promise<ThemedToken[][]> {
    try {
        const hl = await getHighlighter();

        // Shiki throws if language is not loaded — fall back gracefully
        const availableLangs = hl.getLoadedLanguages();
        const lang = availableLangs.includes(language) ? language : "plaintext";

        return await hl.codeToTokensBase(code, { lang, theme: "github-light" });
    } catch {
        return code.split("\n").map((line) => [
            {
                content: line,
                offset: 0,
            },
        ]);
    }
}
