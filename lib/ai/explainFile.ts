import { generateText } from "@/lib/ai/aiService";
import { buildExplainFilePrompt } from "@/lib/ai/prompts/explainFilePrompt";
import { aiCache } from "@/lib/cache/aiCache";
import { parseExplanationResponse, type ExplanationSections } from "@/lib/ai/utils/normalizeResponse";
import { sampleLargeText } from "@/lib/ai/utils/chunkText";

// character budget sent to the AI - keeps prompts within safe token limits
const AI_INPUT_MAX_CHARS = 3_000;

// error classification

function isOllamaUnavailable(error: unknown): boolean {
    if (!(error instanceof Error)) return false;
    const msg = error.message.toLowerCase();
    return (
        msg.includes("unable to connect") ||
        msg.includes("timed out") ||
        msg.includes("fetch failed") ||
        msg.includes("econnrefused")
    );
}

export type { ExplanationSections };

export interface ExplainFileResult {
    sections: ExplanationSections;
    fromCache: boolean;
    usedFallback: boolean;
}


// generates a structured explanation for a source file
//  checks `aiCache` before hitting the AI provider
//  samples oversized files to stay within token limits
//  parses the raw response into labelled sections
//  classifies Ollama connectivity errors for user-friendly messaging
 

export async function explainFile(
    fileContent: string,
    filePath: string
): Promise<ExplainFileResult> {
    const normalizedPath = filePath.trim();
    const normalizedContent = fileContent.trim();

    if (!normalizedPath) {
        throw new Error("File explanation requires a valid file path.");
    }
    if (!normalizedContent) {
        throw new Error("File explanation requires non-empty file content.");
    }

    //  cache hit
    const cached = aiCache.get(normalizedPath, normalizedContent);
    if (cached !== undefined) {
        return {
            sections: parseExplanationResponse(cached),
            fromCache: true,
            usedFallback: false,
        };
    }

    const inputText = sampleLargeText(normalizedContent, AI_INPUT_MAX_CHARS);

    //  build prompt (all prompt strings live in prompts/)
    const prompt = buildExplainFilePrompt(inputText, normalizedPath);

    //  call AI service
    let rawResponse: string;
    let usedFallback = false;

    try {
        rawResponse = await generateText(prompt);
    } catch (error) {
        if (isOllamaUnavailable(error)) {
            throw new Error("AI unavailable. Using fallback.");
        }
        throw new Error(
            `Failed to generate explanation: ${error instanceof Error ? error.message : "Unknown AI error"
            }`
        );
    }

    if (rawResponse.toLowerCase().includes("mock fallback response")) {
        usedFallback = true;
    }

    aiCache.set(normalizedPath, normalizedContent, rawResponse);

    return {
        sections: parseExplanationResponse(rawResponse),
        fromCache: false,
        usedFallback,
    };
}
