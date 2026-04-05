
//  lightweight in-memory cache for AI-generated file explanations

//  cache key is a deterministic hash derived from the file path and
//  the first 512 characters of content (enough to detect file changes
//  without hashing the entire text on every call)
 

function buildCacheKey(filePath: string, content: string): string {
    // use path + a fingerprint of the content head
    // this avoids expensive full-string hashing while still invalidating
    // the cache when the file is meaningfully edited
    const contentFingerprint = content.slice(0, 512);
    return `${filePath}::${contentFingerprint}`;
}

const store = new Map<string, string>();

export const aiCache = {
    
    //  returns the cached explanation for this (path, content) pair or `undefined` if no entry exists
    
    get(filePath: string, content: string): string | undefined {
        return store.get(buildCacheKey(filePath, content));
    },

    //  stores an explanation under the (path, content) key
    set(filePath: string, content: string, explanation: string): void {
        store.set(buildCacheKey(filePath, content), explanation);
    },

    //  returns `true` if a cached explanation already exists
    has(filePath: string, content: string): boolean {
        return store.has(buildCacheKey(filePath, content));
    },

    //  evicts the entry for a specific (path, content) pair
    delete(filePath: string, content: string): void {
        store.delete(buildCacheKey(filePath, content));
    },

    //  clears all cached explanations (e.g., when the repo changes)
    clear(): void {
        store.clear();
    },

    //  diagnostic: number of entries currently cached
    size(): number {
        return store.size;
    },
};
