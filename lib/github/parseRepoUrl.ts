export function parseRepoUrl(input: string): { owner: string; repo: string } {
    const trimmedUrl = input.trim();

    if (!trimmedUrl) {
        throw new Error("Repository URL cannot be empty");
    }

    let path = "";

    if (trimmedUrl.startsWith("git@github.com:")) {
        path = trimmedUrl.slice("git@github.com:".length);
    } else {
        let url: URL;
        try {
            url = new URL(trimmedUrl);
        } catch {
            throw new Error("Invalid URL format");
        }

        if (url.hostname !== "github.com" && url.hostname !== "www.github.com") {
            throw new Error("Repository must be hosted on github.com");
        }

        path = url.pathname.replace(/^\/+/, "");
    }

    const parts = path.split("/").filter(Boolean);

    if (parts.length < 2) {
        throw new Error("URL must contain both owner and repository name");
    }

    const owner = parts[0];
    let repo = parts[1];

    if (repo.endsWith(".git")) {
        repo = repo.slice(0, -4);
    }

    if (!owner || !repo) {
        throw new Error("Invalid owner or repository name");
    }

    return { owner, repo };
}
