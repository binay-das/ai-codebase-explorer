import { askRepoServer } from "@/lib/ai/repoChatServer";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as {
            question?: string;
            repoKey?: string;
        };

        const question = body.question?.trim();
        const repoKey = body.repoKey?.trim();

        if (!question || !repoKey) {
            return NextResponse.json({ error: "Missing question or repo key." }, { status: 400 });
        }

        const result = await askRepoServer(question, repoKey);
        return NextResponse.json(result);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to query the repository.";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
