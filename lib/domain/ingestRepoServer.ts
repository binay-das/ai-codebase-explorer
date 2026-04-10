import { indexRepositoryFromGitHubTree, indexRepositoryFromNormalizedTree } from "@/lib/ai/indexing/indexRepo";
import { syncActiveRepo } from "@/lib/ai/indexing/repoIndexState";
import { chatCache } from "@/lib/cache/chatCache";
import { fileCache } from "@/lib/cache/fileCache";
import { repoCache } from "@/lib/cache/repoCache";
import { getRepo } from "@/lib/github/getRepo";
import { getRepoTree } from "@/lib/github/getRepoTree";
import { parseRepoUrl } from "@/lib/github/parseRepoUrl";
import type { RepoInfo } from "@/lib/github/types";
import { normalizeTree, type FileNode } from "./normalizeTree";

export interface IngestedRepo {
    repo: RepoInfo;
    tree: FileNode[];
}

const pendingIngests = new Map<string, Promise<IngestedRepo>>();

export async function ingestRepoServer(repoUrl: string): Promise<IngestedRepo> {
    const { owner, repo } = parseRepoUrl(repoUrl);
    const repoKey = `${owner}/${repo}`;

    chatCache.clear();
    fileCache.clear();
    syncActiveRepo(repoKey);

    const cached = repoCache.get(owner, repo);
    if (cached) {
        await indexRepositoryFromNormalizedTree(owner, repo, cached.tree);
        return cached;
    }

    const pendingIngest = pendingIngests.get(repoKey);
    if (pendingIngest) {
        return pendingIngest;
    }

    const request = (async () => {
        const repoInfo = await getRepo(owner, repo);
        const rawTree = await getRepoTree(owner, repo, repoInfo.default_branch);
        const normalizedTree = normalizeTree(rawTree);
        const payload: IngestedRepo = { repo: repoInfo, tree: normalizedTree };

        repoCache.set(owner, repo, payload);
        await indexRepositoryFromGitHubTree(owner, repo, rawTree);

        return payload;
    })().finally(() => {
        pendingIngests.delete(repoKey);
    });

    pendingIngests.set(repoKey, request);
    return request;
}
