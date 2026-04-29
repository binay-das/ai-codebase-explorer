// import { scheduleRepositoryIndexFromGitHubTree, scheduleRepositoryIndexFromNormalizedTree } from "@/lib/ai/indexing/indexRepo";
// import { syncActiveRepo } from "@/lib/ai/indexing/repoIndexState";
// import { chatCache } from "@/lib/cache/chatCache"; // Commented out - unnecessary
// import { fileCache } from "@/lib/cache/fileCache"; // Commented out - unnecessary
// import { repoCache } from "@/lib/cache/repoCache"; // Commented out - unnecessary
import { hydrateRepositoryFileContents } from "@/lib/domain/repositoryFiles";
import { getRepo } from "@/lib/github/getRepo";
import { getRepoTree } from "@/lib/github/getRepoTree";
import { parseRepoUrl } from "@/lib/github/parseRepoUrl";
import type { RepoInfo } from "@/lib/github/types";
import { normalizeTree, type FileNode } from "./normalizeTree";
import { prisma } from "@/lib/prisma";
import type { Repository, RepositoryFile } from "@prisma/client";

export interface IngestedRepo {
    repo: RepoInfo;
    tree: FileNode[];
}

// const pendingIngests = new Map<string, Promise<IngestedRepo>>(); // Commented out - unnecessary

type RepositoryWithFiles = Repository & {
    files: RepositoryFile[];
};

function toRepoInfo(repo: Repository): RepoInfo {
    return {
        name: repo.name,
        full_name: repo.fullName,
        description: repo.description,
        stargazers_count: repo.stargazersCount,
        forks_count: repo.forksCount,
        language: repo.language,
        default_branch: repo.defaultBranch,
    };
}

function toIngestedRepo(repo: RepositoryWithFiles): IngestedRepo {
    const rawTree = repo.files.map((file) => ({
        path: file.path,
        type: file.type === "FILE" ? "blob" : "tree",
    }));

    return {
        repo: toRepoInfo(repo),
        tree: normalizeTree(rawTree),
    };
}

export async function loadStoredRepoServer(repoUrl: string, userId: string): Promise<IngestedRepo> {
    const { owner, repo } = parseRepoUrl(repoUrl);
    const repoKey = `${owner}/${repo}`;

    const dbRepo = await prisma.repository.findUnique({
        where: { fullName: repoKey },
        include: {
            users: {
                where: { id: userId },
                select: { id: true },
            },
            files: {
                orderBy: { path: "asc" },
            },
        },
    });

    if (!dbRepo) {
        throw new Error("Repository has not been ingested yet.");
    }

    if (dbRepo.users.length === 0) {
        throw new Error("You don't have access to this repository.");
    }

    return toIngestedRepo(dbRepo);
}

export async function ingestRepoServer(repoUrl: string, userId: string): Promise<IngestedRepo> {
    const { owner, repo } = parseRepoUrl(repoUrl);
    const repoKey = `${owner}/${repo}`;

    // chatCache.clear(); // Commented out - unnecessary
    // fileCache.clear(); // Commented out - unnecessary
    // syncActiveRepo(repoKey); // Commented out - ingestion disabled

    // const cached = repoCache.get(owner, repo); // Commented out - unnecessary
    // if (cached) { // Commented out - unnecessary
    //     // scheduleRepositoryIndexFromNormalizedTree(owner, repo, cached.tree); // Commented out - ingestion disabled
    //     return cached; // Commented out - unnecessary
    // } // Commented out - unnecessary

    // const pendingIngest = pendingIngests.get(repoKey); // Commented out - unnecessary
    // if (pendingIngest) { // Commented out - unnecessary
    //     return pendingIngest; // Commented out - unnecessary
    // } // Commented out - unnecessary

    // Simple flow: fetch from GitHub, store in DB and S3, return tree
    const repoInfo = await getRepo(owner, repo);
    const rawTree = await getRepoTree(owner, repo, repoInfo.default_branch);

    const createdRepo = await prisma.$transaction(async (tx) => {
        const storedRepo = await tx.repository.upsert({
            where: { fullName: repoKey },
            create: {
                owner,
                name: repo,
                fullName: repoKey,
                description: repoInfo.description,
                stargazersCount: repoInfo.stargazers_count,
                forksCount: repoInfo.forks_count,
                language: repoInfo.language,
                defaultBranch: repoInfo.default_branch,
                users: { connect: { id: userId } },
            },
            update: {
                owner,
                name: repo,
                description: repoInfo.description,
                stargazersCount: repoInfo.stargazers_count,
                forksCount: repoInfo.forks_count,
                language: repoInfo.language,
                defaultBranch: repoInfo.default_branch,
                users: { connect: { id: userId } },
            },
            select: {
                id: true,
            },
        });

        await tx.repositoryFile.deleteMany({
            where: { repositoryId: storedRepo.id },
        });

        await tx.repositoryFile.createMany({
            data: rawTree.map((item) => ({
                repositoryId: storedRepo.id,
                path: item.path,
                name: item.path.split("/").pop() || "",
                type: item.type === "blob" ? "FILE" : "DIR",
                sha: item.sha,
                size: item.size ?? null,
            })),
        });

        return storedRepo;
    });

    /*
    // Original create-only DB write commented out while refresh/upsert flow is active.
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
            // users: { connect: { id: userId } }, // Commented out - causes error when user not in DB
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
    */

    // Store all files to S3 bucket
    await hydrateRepositoryFileContents(createdRepo.id, owner, repo, rawTree);

    const normalizedTree = normalizeTree(rawTree);
    const payload: IngestedRepo = { repo: repoInfo, tree: normalizedTree };

    // repoCache.set(owner, repo, payload); // Commented out - unnecessary
    // scheduleRepositoryIndexFromGitHubTree(owner, repo, rawTree); // Commented out - ingestion disabled

    return payload;
}
