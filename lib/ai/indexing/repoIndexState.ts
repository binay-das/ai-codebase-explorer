import { clear as clearVectorStore } from "@/lib/ai/vectorStore";

let activeRepoKey: string | null = null;
const indexedFiles = new Set<string>();

export function syncActiveRepo(repoKey: string): void {
    if (activeRepoKey === repoKey) {
        return;
    }

    activeRepoKey = repoKey;
    indexedFiles.clear();
    clearVectorStore();
}

export function isRepoFileIndexed(repoKey: string, filePath: string): boolean {
    return activeRepoKey === repoKey && indexedFiles.has(filePath);
}

export function markRepoFileIndexed(repoKey: string, filePath: string): void {
    syncActiveRepo(repoKey);
    indexedFiles.add(filePath);
}
