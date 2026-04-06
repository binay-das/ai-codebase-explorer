import { generateEmbedding, generateText } from "@/lib/ai/aiService";
import { retrieveTopK } from "@/lib/ai/retrieval/retrieve";
import { buildContext } from "@/lib/ai/retrieval/buildContext";
import { buildRagPrompt } from "@/lib/ai/prompts/ragPrompt";

// query the repository using a rag pipeline
export async function askRepo(question: string): Promise<string> {
    const queryVector = await generateEmbedding(question);
    const topChunks = retrieveTopK(queryVector, 10);
    console.log(topChunks);
    const context = buildContext(topChunks);
    const prompt = buildRagPrompt(question, context);

    return await generateText(prompt);
}
