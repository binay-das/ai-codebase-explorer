import type { ExplainFileResult } from "@/lib/ai/explainFile";

export async function explainFile(fileContent: string, filePath: string): Promise<ExplainFileResult> {
    const response = await fetch("/api/ai/explain", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileContent, filePath }),
    });

    const data = (await response.json()) as ExplainFileResult | { error?: string };
    if (!response.ok) {
        throw new Error("error" in data && data.error ? data.error : "Failed to generate explanation.");
    }

    return data as ExplainFileResult;
}
