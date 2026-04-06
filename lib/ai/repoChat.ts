import { generateEmbedding, generateText } from "@/lib/ai/aiService";
import { retrieveTopK } from "@/lib/ai/retrieval/retrieve";
import { buildContext } from "@/lib/ai/retrieval/buildContext";
import { buildRagPrompt } from "@/lib/ai/prompts/ragPrompt";

const errorMsg = "i'm sorry, i encountered an error while searching the repository. please try again later.";


// query the repository using a rag pipeline with error handling
export async function askRepo(question: string): Promise<string> {
    try {
        const queryVector = await generateEmbedding(question);
        const topChunks = retrieveTopK(queryVector, 10);
        const context = buildContext(topChunks);
        const prompt = buildRagPrompt(question, context);

        return await generateText(prompt);
    } catch (error) {
        console.error("error in askRepo:", error);
        return errorMsg;
    }
}
