import type { AIProvider, GenerateEmbeddingInput, GenerateTextInput } from "@/lib/ai/types";

const OLLAMA_BASE_URL = "http://localhost:11434";
const CHAT_MODEL = "llama3.1:8b";
const EMBEDDING_MODEL = "nomic-embed-text:v1.5";
const REQUEST_TIMEOUT_MS = 15_000;

interface OllamaGenerateResponse {
    response?: unknown;
}

interface OllamaEmbeddingResponse {
    embedding?: unknown;
}

function buildPrompt({ prompt, context }: GenerateTextInput): string {
    const normalizedPrompt = prompt.trim();
    const normalizedContext = context?.trim();

    if (!normalizedPrompt) {
        throw new Error("Ollama text generation requires a non-empty prompt.");
    }

    if (!normalizedContext) {
        return normalizedPrompt;
    }

    return `Context:\n${normalizedContext}\n\nPrompt:\n${normalizedPrompt}`;
}

function createTimeoutSignal(timeoutMs: number): AbortSignal {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    controller.signal.addEventListener("abort", () => {
        clearTimeout(timeoutId);
    }, { once: true });

    return controller.signal;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

async function parseErrorResponse(response: Response): Promise<string> {
    try {
        const data = (await response.json()) as unknown;

        if (isRecord(data) && typeof data.error === "string" && data.error.trim()) {
            return data.error;
        }

        if (isRecord(data) && typeof data.message === "string" && data.message.trim()) {
            return data.message;
        }
    } catch {
        return response.statusText || "Unknown Ollama error";
    }

    return response.statusText || "Unknown Ollama error";
}

async function postToOllama<TResponse>(
    path: string,
    body: Record<string, unknown>
): Promise<TResponse> {
    const url = `${OLLAMA_BASE_URL}${path}`;

    let response: Response;

    try {
        response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
            signal: createTimeoutSignal(REQUEST_TIMEOUT_MS),
        });
    } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
            throw new Error(`Ollama request timed out after ${REQUEST_TIMEOUT_MS}ms. Make sure Ollama is running at ${OLLAMA_BASE_URL}.`);
        }

        if (error instanceof TypeError) {
            throw new Error(`Unable to connect to Ollama at ${OLLAMA_BASE_URL}. Make sure the Ollama server is running.`);
        }

        throw new Error(`Ollama request failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }

    if (!response.ok) {
        const details = await parseErrorResponse(response);
        throw new Error(`Ollama request failed with status ${response.status}: ${details}`);
    }

    try {
        return (await response.json()) as TResponse;
    } catch {
        throw new Error(`Ollama returned an invalid JSON response for ${path}.`);
    }
}

function parseGeneratedText(data: OllamaGenerateResponse): string {
    if (typeof data.response !== "string" || !data.response.trim()) {
        throw new Error("Ollama returned an invalid text generation response.");
    }

    return data.response.trim();
}

function parseEmbedding(data: OllamaEmbeddingResponse): number[] {
    if (!Array.isArray(data.embedding) || data.embedding.some((value) => typeof value !== "number")) {
        throw new Error("Ollama returned an invalid embedding response.");
    }

    return data.embedding;
}

export class OllamaProvider implements AIProvider {
    async generateText(input: GenerateTextInput): Promise<string> {
        const prompt = buildPrompt(input);
        const data = await postToOllama<OllamaGenerateResponse>("/api/generate", {
            model: CHAT_MODEL,
            prompt,
            stream: false,
        });

        return parseGeneratedText(data);
    }

    async generateEmbedding(input: GenerateEmbeddingInput): Promise<number[]> {
        const text = input.text.trim();

        if (!text) {
            throw new Error("Ollama embeddings require non-empty text.");
        }

        const data = await postToOllama<OllamaEmbeddingResponse>("/api/embeddings", {
            model: EMBEDDING_MODEL,
            prompt: text,
        });

        return parseEmbedding(data);
    }
}
