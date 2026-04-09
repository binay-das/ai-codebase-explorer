import { isBinaryFile } from "@/lib/viewer/detectLanguage";
import { useRepoStore } from "@/lib/store/repoStore";

export const MAX_LINES = 500;

export interface FileServiceResult {
    content: string;
    truncated: boolean;
    tooLarge: boolean;
}

export async function fetchFileForViewer(
    filePath: string
): Promise<FileServiceResult> {
    const { repo } = useRepoStore.getState();

    if (!repo) {
        throw new Error("No repository loaded.");
    }

    if (isBinaryFile(filePath)) {
        throw new Error("BINARY");
    }

    const [owner, repoName] = repo.full_name.split("/");
    const response = await fetch("/api/repo/file", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            owner,
            repo: repoName,
            filePath,
        }),
    });

    const data = (await response.json()) as FileServiceResult | { error?: string };
    if (!response.ok) {
        if ("error" in data && data.error) {
            throw new Error(data.error);
        }
        throw new Error("Failed to load file.");
    }

    return data as FileServiceResult;
}
