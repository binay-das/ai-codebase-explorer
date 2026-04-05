export interface GenerateTextInput {
    prompt: string;
    context?: string;
}


export interface GenerateEmbeddingInput {
    text: string;
}



export interface AIProvider {
    generateText(input: GenerateTextInput): Promise<string>;
    generateEmbedding(input: GenerateEmbeddingInput): Promise<number[]>;
}
