// in‑memory vector store for rag
export type VectorEntry = {
    id: string
    vector: number[]
    filePath: string
    content: string
}


const store: VectorEntry[] = [];

// add entry to store
export function add(entry: VectorEntry): void {
    store.push(entry);
}

// get all entries
export function getAll(): VectorEntry[] {
    return [...store];
}

// clear store
export function clear(): void {
    store.length = 0;
}
