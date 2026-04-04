import { IngestedRepo } from "../github/ingestRepo";

const cache = new Map<string, IngestedRepo>();

export const repoCache = {
    get: (owner: string, repo: string): IngestedRepo | undefined => {
        return cache.get(`${owner}/${repo}`);
    },
    set: (owner: string, repo: string, data: IngestedRepo): void => {
        cache.set(`${owner}/${repo}`, data);
    },
    has: (owner: string, repo: string): boolean => {
        return cache.has(`${owner}/${repo}`);
    },
    clear: () => {
        cache.clear();
    }
};
