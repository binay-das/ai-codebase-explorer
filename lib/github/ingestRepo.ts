
import { getRepo } from "@/lib/github/getRepo";
import { getRepoTree } from "@/lib/github/getRepoTree";
import { FileNode, normalizeTree } from "@/lib/github/normalizeTree";
import { parseRepoUrl } from "@/lib/github/parseRepoUrl";
import { RepoInfo } from "@/lib/github/types";
import { useRepoStore } from "@/lib/store/repoStore";

export interface IngestedRepo {
    repo: RepoInfo;
    tree: FileNode[];
}

export async function ingestRepo(repoUrl: string): Promise<IngestedRepo> {
    const { owner, repo } = parseRepoUrl(repoUrl);

    const repoInfo = await getRepo(owner, repo);
    const rawTree = await getRepoTree(owner, repo, repoInfo.default_branch);
    const normalizedTree = normalizeTree(rawTree);

    useRepoStore.getState().setRepoData(repoInfo, normalizedTree);

    return {
        repo: repoInfo,
        tree: normalizedTree,
    };
}
