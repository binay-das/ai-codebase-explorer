import { generateText } from "@/lib/ai/aiService";
import { buildExplainFilePrompt } from "@/lib/ai/prompts/explainFilePrompt";

const explanationCache = new Map<string, string>();

function getCacheKey(filePath: string, fileContent: string): string {
    return `${filePath}::${fileContent}`;
}

export async function explainFile(fileContent: string, filePath: string): Promise<string> {
    const normalizedContent = fileContent.trim();
    const normalizedPath = filePath.trim();

    if (!normalizedPath) {
        throw new Error("File explanation requires a valid file path.");
    }

    if (!normalizedContent) {
        throw new Error("File explanation requires non-empty file content.");
    }

    const cacheKey = getCacheKey(normalizedPath, normalizedContent);
    const cachedExplanation = explanationCache.get(cacheKey);

    if (cachedExplanation) {
        return cachedExplanation;
    }

    const prompt = buildExplainFilePrompt(normalizedContent, normalizedPath);

    try {
        const explanation = await generateText(prompt);
        explanationCache.set(cacheKey, explanation);
        return explanation;
    } catch (error) {
        throw new Error(
            `Failed to explain file ${normalizedPath}: ${error instanceof Error ? error.message : "Unknown AI error"}`
        );
    }
}
