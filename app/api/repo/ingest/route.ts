import { ingestRepoServer } from "@/lib/domain/ingestRepoServer";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as { repoUrl?: string };
        const repoUrl = body.repoUrl?.trim();

        if (!repoUrl) {
            return NextResponse.json({ error: "Repository URL cannot be empty" }, { status: 400 });
        }

        const result = await ingestRepoServer(repoUrl);
        return NextResponse.json(result);
    } catch (error) {
        const message = error instanceof Error
            ? error.message
            : "An unexpected error occurred during repository ingestion.";

        return NextResponse.json({ error: message }, { status: 500 });
    }
}
