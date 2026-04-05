const EXTENSION_MAP: Record<string, string> = {
    // Web
    ts: "typescript",
    tsx: "tsx",
    js: "javascript",
    jsx: "jsx",
    mjs: "javascript",
    cjs: "javascript",
    html: "html",
    css: "css",
    scss: "scss",
    less: "less",

    // Data / Config
    json: "json",
    jsonc: "json",
    yaml: "yaml",
    yml: "yaml",
    toml: "toml",
    xml: "xml",
    csv: "plaintext",

    // Systems / Backend
    py: "python",
    rs: "rust",
    go: "go",
    java: "java",
    kt: "kotlin",
    rb: "ruby",
    php: "php",
    cs: "csharp",
    cpp: "cpp",
    cc: "cpp",
    c: "c",
    h: "c",
    swift: "swift",
    sh: "bash",
    bash: "bash",
    zsh: "bash",
    fish: "fish",

    // Docs / Markup
    md: "markdown",
    mdx: "markdown",
    txt: "plaintext",
    rst: "plaintext",

    // Infra
    dockerfile: "dockerfile",
    tf: "hcl",
    sql: "sql",
    graphql: "graphql",
    gql: "graphql",

    // Config
    env: "plaintext",
    gitignore: "plaintext",
    editorconfig: "plaintext",
};

const BINARY_EXTENSIONS = new Set([
    "png", "jpg", "jpeg", "gif", "svg", "ico", "webp", "bmp",
    "pdf", "zip", "tar", "gz", "bz2", "7z", "rar",
    "exe", "dll", "so", "dylib", "wasm",
    "mp3", "mp4", "avi", "mov", "wav", "ogg",
    "ttf", "otf", "woff", "woff2",
    "db", "sqlite", "lock",
]);

export function detectLanguage(filePath: string): string {
    const fileName = filePath.split("/").pop() ?? "";
    const dotIndex = fileName.lastIndexOf(".");

    // Special filenames with no extension
    if (dotIndex === -1 || dotIndex === 0) {
        const lower = fileName.toLowerCase();
        if (lower === "dockerfile") return "dockerfile";
        if (lower === "makefile") return "makefile";
        if (lower.endsWith("ignore") || lower.endsWith("rc")) return "plaintext";
        return "plaintext";
    }

    const ext = fileName.slice(dotIndex + 1).toLowerCase();
    return EXTENSION_MAP[ext] ?? "plaintext";
}

export function isBinaryFile(filePath: string): boolean {
    const ext = filePath.split(".").pop()?.toLowerCase() ?? "";
    return BINARY_EXTENSIONS.has(ext);
}
