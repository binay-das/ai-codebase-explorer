import { ensureFileIndexed } from "@/lib/ai/indexing/indexRepo";
import { fileCache } from "@/lib/cache/fileCache";
import { isBinaryFile } from "@/lib/viewer/detectLanguage";
import { NextResponse } from "next/server";

const MAX_SIZE_BYTES = 200 * 1024;
const MAX_LINES = 500;

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as {
            owner?: string;
            repo?: string;
            filePath?: string;
        };

        const owner = body.owner?.trim();
        const repo = body.repo?.trim();
        const filePath = body.filePath?.trim();

        if (!owner || !repo || !filePath) {
            return NextResponse.json({ error: "Missing owner, repo, or file path." }, { status: 400 });
        }

        if (isBinaryFile(filePath)) {
            return NextResponse.json({ error: "BINARY" }, { status: 415 });
        }

        const rawContent = await fileCache.fetchOrGet(owner, repo, filePath);
        await ensureFileIndexed(owner, repo, filePath, rawContent);

        const byteSize = new TextEncoder().encode(rawContent).length;
        if (byteSize > MAX_SIZE_BYTES) {
            return NextResponse.json({ content: "", truncated: false, tooLarge: true });
        }

        const lines = rawContent.split("\n");
        if (lines.length > MAX_LINES) {
            return NextResponse.json({
                content: lines.slice(0, MAX_LINES).join("\n"),
                truncated: true,
                tooLarge: false,
            });
        }

        return NextResponse.json({ content: rawContent, truncated: false, tooLarge: false });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load file.";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
