import { githubFetch } from "@/lib/github/client";

interface GitHubContentResponse {
    type: string;
    encoding: string;
    content: string;
    name: string;
    path: string;
    sha: string;
    size: number;
    url: string;
}

export async function getFileContent(
    owner: string,
    repo: string,
    path: string
): Promise<string> {
    const data = await githubFetch<GitHubContentResponse>(
        `repos/${owner}/${repo}/contents/${path}`
    );

    if (data.type !== "file") {
        throw new Error(`Path "${path}" is not a file.`);
    }

    if (data.encoding !== "base64") {
        throw new Error(`Unsupported encoding: ${data.encoding}`);
    }

    // Clean base64 string (GitHub adds newlines) and decode
    const cleaned = data.content.replace(/\n/g, "");
    try {
        return atob(cleaned);
    } catch {
        throw new Error(`Could not decode file content for "${path}". It may be a binary file.`);
    }
}
