import { explainFile } from "@/lib/ai/explainFile";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as {
            fileContent?: string;
            filePath?: string;
        };

        const fileContent = body.fileContent ?? "";
        const filePath = body.filePath ?? "";
        const result = await explainFile(fileContent, filePath);

        return NextResponse.json(result);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to generate explanation.";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
