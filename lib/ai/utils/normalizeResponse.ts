

export interface ExplanationSections {
    purpose: string;
    keyComponents: string;
    dependencies: string;
    projectRole: string;
    raw: string;
}




// lines that purely mark an AI's verbose preamble and should be discarded
const JUNK_PREFIXES = [
    "sure,",
    "of course,",
    "here is",
    "here's",
    "below is",
    "certainly,",
    "happy to",
    "as requested",
    "i'll explain",
    "let me explain",
    "i will explain",
];


function isJunkLine(line: string): boolean {
    const lower = line.toLowerCase().trimStart();
    return JUNK_PREFIXES.some((prefix) => lower.startsWith(prefix));
}


function stripJunkLines(text: string): string {
    return text
        .split("\n")
        .filter((line) => !isJunkLine(line))
        .join("\n");
}

function collapseBlankLines(text: string): string {
    return text.replace(/\n{3,}/g, "\n\n").trim();
}

// attempts to extract the content after a section heading.
// headings are matched case-insensitively and may have markdown (#, **) decorators.

function extractSection(text: string, ...labels: string[]): string {
    const escapedLabels = labels.map((l) =>
        l.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    );

    // match heading patterns: "## Purpose", "**Purpose**", "Purpose:", "Purpose\n"
    const sectionPattern = new RegExp(
        `(?:^|\\n)(?:#+\\s*|\\*{1,2})?(?:${escapedLabels.join("|")})(?:\\*{1,2})?[:\\s]*\\n([\\s\\S]*?)(?=\\n(?:#+\\s*|\\*{1,2})?(?:key|dependencies|how it fits|purpose|project role)|$)`,
        "i"
    );

    const match = sectionPattern.exec(text);
    return match?.[1]?.trim() ?? "";
}


// trims and de-junks raw AI text without structural parsing
// use when we only need a clean string, not section breakdown

export function normalizeRawResponse(raw: string): string {
    if (typeof raw !== "string") return "";
    return collapseBlankLines(stripJunkLines(raw));
}

// parses a structured AI explanation into discrete sections.
// falls back gracefully if the model didn't follow the expected format.

export function parseExplanationResponse(raw: string): ExplanationSections {
    const cleaned = normalizeRawResponse(raw);

    const purpose = extractSection(cleaned, "Purpose");
    const keyComponents = extractSection(
        cleaned,
        "Key components/functions",
        "Key components",
        "Key functions",
        "Key components\\/functions"
    );
    const dependencies = extractSection(cleaned, "Dependencies");
    const projectRole = extractSection(
        cleaned,
        "How it fits in project",
        "Project role",
        "How it fits"
    );

    const allEmpty = !purpose && !keyComponents && !dependencies && !projectRole;

    return {
        purpose: allEmpty ? cleaned : purpose,
        keyComponents: allEmpty ? "" : keyComponents,
        dependencies: allEmpty ? "" : dependencies,
        projectRole: allEmpty ? "" : projectRole,
        raw: cleaned,
    };
}
