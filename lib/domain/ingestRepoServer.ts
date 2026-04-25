import { scheduleRepositoryIndexFromGitHubTree, scheduleRepositoryIndexFromNormalizedTree } from "@/lib/ai/indexing/indexRepo";
import { syncActiveRepo } from "@/lib/ai/indexing/repoIndexState";
import { chatCache } from "@/lib/cache/chatCache";
import { fileCache } from "@/lib/cache/fileCache";
import { repoCache } from "@/lib/cache/repoCache";
import { hydrateRepositoryFileContents, repositoryHasMissingFileContent } from "@/lib/domain/repositoryFiles";
import { getRepo } from "@/lib/github/getRepo";
import { getRepoTree } from "@/lib/github/getRepoTree";
import { parseRepoUrl } from "@/lib/github/parseRepoUrl";
import type { RepoInfo } from "@/lib/github/types";
import { normalizeTree, type FileNode } from "./normalizeTree";
import { prisma } from "@/lib/prisma";

export interface IngestedRepo {
    repo: RepoInfo;
    tree: FileNode[];
}

const pendingIngests = new Map<string, Promise<IngestedRepo>>();

export async function ingestRepoServer(repoUrl: string, userId: string): Promise<IngestedRepo> {
    const { owner, repo } = parseRepoUrl(repoUrl);
    const repoKey = `${owner}/${repo}`;

    chatCache.clear();
    fileCache.clear();
    syncActiveRepo(repoKey);

    const cached = repoCache.get(owner, repo);
    if (cached) {
        scheduleRepositoryIndexFromNormalizedTree(owner, repo, cached.tree);
        return cached;
    }

    const pendingIngest = pendingIngests.get(repoKey);
    if (pendingIngest) {
        return pendingIngest;
    }

    const request = (async () => {
        const dbRepo = await prisma.repository.findUnique({
            where: { fullName: repoKey },
            include: { files: true }
        });

        if (dbRepo) {
            await prisma.repository.update({
                where: { id: dbRepo.id },
                data: {
                    users: { connect: { id: userId } }
                }
            });

            const repoInfo: RepoInfo = {
                name: dbRepo.name,
                full_name: dbRepo.fullName,
                description: dbRepo.description,
                stargazers_count: dbRepo.stargazersCount,
                forks_count: dbRepo.forksCount,
                language: dbRepo.language,
                default_branch: dbRepo.defaultBranch
            };

            if (await repositoryHasMissingFileContent(dbRepo.id)) {
                const latestTree = await getRepoTree(owner, repo, dbRepo.defaultBranch);
                await hydrateRepositoryFileContents(dbRepo.id, owner, repo, latestTree);
            }

            const rawTree = dbRepo.files.map(f => ({
                path: f.path,
                type: f.type === "FILE" ? "blob" : "tree"
            }));

            const normalizedTree = normalizeTree(rawTree);
            const payload: IngestedRepo = { repo: repoInfo, tree: normalizedTree };

            repoCache.set(owner, repo, payload);
            scheduleRepositoryIndexFromNormalizedTree(owner, repo, normalizedTree);

            return payload;
        }

        const repoInfo = await getRepo(owner, repo);
        const rawTree = await getRepoTree(owner, repo, repoInfo.default_branch);
        
        const createdRepo = await prisma.repository.create({
            data: {
                owner,
                name: repo,
                fullName: repoKey,
                description: repoInfo.description,
                stargazersCount: repoInfo.stargazers_count,
                forksCount: repoInfo.forks_count,
                language: repoInfo.language,
                defaultBranch: repoInfo.default_branch,
                users: { connect: { id: userId } },
                files: {
                    create: rawTree.map(item => ({
                        path: item.path,
                        name: item.path.split("/").pop() || "",
                        type: item.type === "blob" ? "FILE" : "DIR",
                        sha: item.sha,
                        size: item.size ?? null,
                    }))
                }
            },
            select: {
                id: true
            },
        });

        await hydrateRepositoryFileContents(createdRepo.id, owner, repo, rawTree);

        const normalizedTree = normalizeTree(rawTree);
        const payload: IngestedRepo = { repo: repoInfo, tree: normalizedTree };

        repoCache.set(owner, repo, payload);
        scheduleRepositoryIndexFromGitHubTree(owner, repo, rawTree);

        return payload;
    })().finally(() => {
        pendingIngests.delete(repoKey);
    });

    pendingIngests.set(repoKey, request);
    return request;
}
