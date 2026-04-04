import { githubFetch } from "@/lib/github/client";
import { RepoInfo } from "@/lib/github/types";

export async function getRepo(owner: string, repo: string): Promise<RepoInfo> {
    return await githubFetch<RepoInfo>(`repos/${owner}/${repo}`);
}
