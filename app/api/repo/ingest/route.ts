import { ingestRepoServer, loadStoredRepoServer } from "@/lib/domain/ingestRepoServer";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const body = (await request.json()) as { repoUrl?: string; refresh?: boolean };
        const repoUrl = body.repoUrl?.trim();

        if (!repoUrl) {
            return NextResponse.json({ error: "Repository URL cannot be empty" }, { status: 400 });
        }

        const result = body.refresh
            ? await ingestRepoServer(repoUrl, session.user.id)
            : await loadStoredRepoServer(repoUrl);

        return NextResponse.json(result);
    } catch (error) {
        const message = error instanceof Error
            ? error.message
            : "An unexpected error occurred during repository ingestion.";

        return NextResponse.json({ error: message }, { status: 500 });
    }
}
