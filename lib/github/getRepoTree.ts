import { githubFetch } from "@/lib/github/client";

export interface GitHubTreeItem {
    path: string;
    mode: string;
    type: "blob" | "tree" | "commit" | string;
    sha: string;
    size?: number;
    url: string;
}

export interface GitHubTreeResponse {
    sha: string;
    url: string;
    tree: GitHubTreeItem[];
    truncated: boolean;
}

export async function getRepoTree(
    owner: string,
    repo: string,
    branch: string
): Promise<GitHubTreeItem[]> {
    const response = await githubFetch<GitHubTreeResponse>(
        `repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
    );

    return response.tree;
}
