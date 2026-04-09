import { fileCache } from "@/lib/cache/fileCache";
import { ensureFileIndexed } from "@/lib/ai/indexing/indexRepo";
import { isBinaryFile } from "@/lib/viewer/detectLanguage";
import { useRepoStore } from "@/lib/store/repoStore";

const MAX_SIZE_BYTES = 200 * 1024; // 200 KB
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
    const rawContent = await fileCache.fetchOrGet(owner, repoName, filePath);
    void ensureFileIndexed(owner, repoName, filePath, rawContent);

    const byteSize = new TextEncoder().encode(rawContent).length;
    if (byteSize > MAX_SIZE_BYTES) {
        return { content: "", truncated: false, tooLarge: true };
    }

    const lines = rawContent.split("\n");
    if (lines.length > MAX_LINES) {
        return {
            content: lines.slice(0, MAX_LINES).join("\n"),
            truncated: true,
            tooLarge: false,
        };
    }

    return { 
        content: rawContent, 
        truncated: false, 
        tooLarge: false 
    };

    
}
