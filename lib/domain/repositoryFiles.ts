import { prisma } from "@/lib/prisma";
import type { GitHubTreeItem } from "@/lib/github/getRepoTree";
import { githubFetch } from "@/lib/github/client";
import {
    ensureBucketExists,
    storeFileToStorage,
    getStorageKey,
} from "@/lib/storage/fileStorage";

const HYDRATION_CONCURRENCY = 4;
const BINARY_CONTENT_PREFIX = "__CODEBASE_EXPLORER_BASE64__:";

interface GitHubBlobResponse {
    content: string;
    encoding: string;
}

function toRepoKey(owner: string, repo: string): string {
    return `${owner}/${repo}`;
}

function decodeBlobContent(base64Content: string): string {
    const normalized = base64Content.replace(/\n/g, "");
    const buffer = Buffer.from(normalized, "base64");

    try {
        return new TextDecoder("utf-8", { fatal: true }).decode(buffer);
    } catch {
        return `${BINARY_CONTENT_PREFIX}${normalized}`;
    }
}

async function fetchBlobContent(url: string): Promise<string> {
    const blob = await githubFetch<GitHubBlobResponse>(url);

    if (blob.encoding !== "base64") {
        throw new Error(`Unsupported blob encoding: ${blob.encoding}`);
    }

    return decodeBlobContent(blob.content);
}


export async function hydrateRepositoryFileContents(
    repositoryId: string,
    owner: string,
    repo: string,
    tree: GitHubTreeItem[]
): Promise<void> {
    await ensureBucketExists();

    const blobs = tree.filter((item) => item.type === "blob");
    let index = 0;

    async function worker(): Promise<void> {
        while (index < blobs.length) {
            const current = blobs[index];
            index += 1;

            const content = await fetchBlobContent(current.url);
            const storageKey = getStorageKey(owner, repo, current.path);

            await storeFileToStorage(owner, repo, current.path, content);

            await prisma.repositoryFile.update({
                where: {
                    repositoryId_path: {
                        repositoryId,
                        path: current.path,
                    },
                },
                data: {
                    storageKey,
                    sha: current.sha,
                    size: current.size ?? null,
                },
            });
        }
    }

    await Promise.all(
        Array.from({ length: Math.min(HYDRATION_CONCURRENCY, blobs.length) }, () => worker())
    );
}


export async function repositoryHasMissingFileContent(repositoryId: string): Promise<boolean> {
    const missing = await prisma.repositoryFile.findFirst({
        where: {
            repositoryId,
            type: "FILE",
            storageKey: null,
        },
        select: {
            id: true,
        },
    });

    return Boolean(missing);
}


export function splitFullName(fullName: string): { owner: string; repo: string } {
    const [owner, repo] = fullName.split("/");
    return { owner, repo };
}


export { toRepoKey };
