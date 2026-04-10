import { indexFile } from "@/lib/ai/embeddings/indexFile";
import { isRepoFileIndexed, markRepoFileIndexed, syncActiveRepo } from "@/lib/ai/indexing/repoIndexState";
import { fileCache } from "@/lib/cache/fileCache";
import type { FileNode } from "@/lib/domain/normalizeTree";
import type { GitHubTreeItem } from "@/lib/github/getRepoTree";
import { isBinaryFile } from "@/lib/viewer/detectLanguage";

const MAX_INDEXABLE_FILE_SIZE_BYTES = 100 * 1024;
const MAX_INDEXABLE_FILE_COUNT = 20;
const INDEX_CONCURRENCY = 2;

type RepoFileCandidate = {
    path: string;
    size?: number;
};

function getRepoKey(owner: string, repo: string): string {
    return `${owner}/${repo}`;
}

function flattenTree(nodes: FileNode[]): string[] {
    const paths: string[] = [];

    for (const node of nodes) {
        if (node.type === "file") {
            paths.push(node.path);
            continue;
        }

        if (node.children) {
            paths.push(...flattenTree(node.children));
        }
    }

    return paths;
}

function scoreCandidate(path: string): number {
    const normalized = path.toLowerCase();
    let score = 0;

    if (normalized === "readme.md") score += 12;
    if (normalized.startsWith("src/")) score += 10;
    if (normalized.startsWith("app/")) score += 10;
    if (normalized.startsWith("lib/")) score += 8;
    if (normalized.startsWith("components/")) score += 8;
    if (normalized.startsWith("server/")) score += 8;
    if (normalized.startsWith("api/")) score += 7;
    if (normalized.includes("/test") || normalized.includes(".test.") || normalized.includes(".spec.")) score -= 3;
    if (normalized.endsWith(".ts") || normalized.endsWith(".tsx")) score += 6;
    if (normalized.endsWith(".js") || normalized.endsWith(".jsx")) score += 5;
    if (normalized.endsWith(".py") || normalized.endsWith(".go") || normalized.endsWith(".rs")) score += 5;
    if (normalized.endsWith(".md")) score += 2;

    return score;
}

function toCandidatesFromGitHubTree(tree: GitHubTreeItem[]): RepoFileCandidate[] {
    return tree
        .filter((item) => item.type === "blob")
        .map((item) => ({ path: item.path, size: item.size }));
}

function toCandidatesFromNormalizedTree(tree: FileNode[]): RepoFileCandidate[] {
    return flattenTree(tree).map((path) => ({ path }));
}

function selectIndexableFiles(files: RepoFileCandidate[]): RepoFileCandidate[] {
    return files
        .filter((file) => !isBinaryFile(file.path))
        .filter((file) => file.size === undefined || file.size <= MAX_INDEXABLE_FILE_SIZE_BYTES)
        .sort((a, b) => scoreCandidate(b.path) - scoreCandidate(a.path) || a.path.localeCompare(b.path))
        .slice(0, MAX_INDEXABLE_FILE_COUNT);
}

async function indexSingleFile(owner: string, repo: string, repoKey: string, file: RepoFileCandidate): Promise<void> {
    if (isRepoFileIndexed(repoKey, file.path)) {
        return;
    }

    const content = await fileCache.fetchOrGet(owner, repo, file.path);
    const size = new TextEncoder().encode(content).length;

    if (size > MAX_INDEXABLE_FILE_SIZE_BYTES) {
        return;
    }

    await indexFile(file.path, content);
    markRepoFileIndexed(repoKey, file.path);
}

async function runWorkers(
    owner: string,
    repo: string,
    repoKey: string,
    files: RepoFileCandidate[]
): Promise<void> {
    let index = 0;

    async function worker(): Promise<void> {
        while (index < files.length) {
            const current = files[index];
            index += 1;

            try {
                await indexSingleFile(owner, repo, repoKey, current);
            } catch (error) {
                console.warn(`Skipping indexing for ${current.path}:`, error);
            }
        }
    }

    await Promise.all(
        Array.from({ length: Math.min(INDEX_CONCURRENCY, files.length) }, () => worker())
    );
}

export async function indexRepositoryFromGitHubTree(
    owner: string,
    repo: string,
    tree: GitHubTreeItem[]
): Promise<void> {
    const repoKey = getRepoKey(owner, repo);
    syncActiveRepo(repoKey);
    await runWorkers(owner, repo, repoKey, selectIndexableFiles(toCandidatesFromGitHubTree(tree)));
}

export async function indexRepositoryFromNormalizedTree(
    owner: string,
    repo: string,
    tree: FileNode[]
): Promise<void> {
    const repoKey = getRepoKey(owner, repo);
    syncActiveRepo(repoKey);
    await runWorkers(owner, repo, repoKey, selectIndexableFiles(toCandidatesFromNormalizedTree(tree)));
}

export async function ensureFileIndexed(
    owner: string,
    repo: string,
    filePath: string,
    content: string
): Promise<void> {
    const repoKey = getRepoKey(owner, repo);
    syncActiveRepo(repoKey);

    if (isRepoFileIndexed(repoKey, filePath) || isBinaryFile(filePath)) {
        return;
    }

    const size = new TextEncoder().encode(content).length;
    if (size > MAX_INDEXABLE_FILE_SIZE_BYTES) {
        return;
    }

    await indexFile(filePath, content);
    markRepoFileIndexed(repoKey, filePath);
}
