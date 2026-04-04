
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
    const store = useRepoStore.getState();
    store.setLoading();

    try {
        const { owner, repo } = parseRepoUrl(repoUrl);

        const repoInfo = await getRepo(owner, repo);
        const rawTree = await getRepoTree(owner, repo, repoInfo.default_branch);
        const normalizedTree = normalizeTree(rawTree);

        store.setRepoData(repoInfo, normalizedTree);

        return {
            repo: repoInfo,
            tree: normalizedTree,
        };
    } catch (error) {
        let errorMessage = "An unexpected error occurred during repository ingestion.";

        if (error instanceof Error) {
            if (error.message.includes("rate limit")) {
                errorMessage = "GitHub API rate limit exceeded. Please try again later.";
            } else if (error.message.includes("404")) {
                errorMessage = "Repository not found. Ensure the URL is correct and the repository is public.";
            } else if (error.message.includes("Network") || error.message.includes("fetch")) {
                errorMessage = "A network error occurred while communicating with GitHub API.";
            } else {
                errorMessage = error.message;
            }
        }

        store.setError(errorMessage);
        throw new Error(errorMessage);
    }
}
