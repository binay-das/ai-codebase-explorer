import { RepoInfo } from "@/lib/github/types";
import { useRepoStore } from "@/lib/store/repoStore";
import { FileNode } from "./normalizeTree";

export interface IngestedRepo {
    repo: RepoInfo;
    tree: FileNode[];
}

let pendingIngest:
    | {
        repoUrl: string;
        request: Promise<IngestedRepo>;
    }
    | null = null;

export async function ingestRepo(repoUrl: string): Promise<IngestedRepo> {
    const normalizedRepoUrl = repoUrl.trim();
    const store = useRepoStore.getState();

    if (pendingIngest?.repoUrl === normalizedRepoUrl) {
        return pendingIngest.request;
    }

    store.setLoading();

    const request = (async () => {
        const response = await fetch("/api/repo/ingest", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ repoUrl: normalizedRepoUrl }),
        });

        const data = (await response.json()) as IngestedRepo | { error?: string };
        if (!response.ok) {
            throw new Error("error" in data && data.error ? data.error : "Repository ingestion failed.");
        }

        const payload = data as IngestedRepo;
        store.setRepoData(payload.repo, payload.tree);
        return payload;
    })();

    pendingIngest = {
        repoUrl: normalizedRepoUrl,
        request: request.finally(() => {
            if (pendingIngest?.repoUrl === normalizedRepoUrl) {
                pendingIngest = null;
            }
        }),
    };

    try {
        return await pendingIngest.request;
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
