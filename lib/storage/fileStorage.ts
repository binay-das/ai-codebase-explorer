import "server-only";

import {
    GetObjectCommand,
    PutObjectCommand,
    HeadBucketCommand,
    CreateBucketCommand,
} from "@aws-sdk/client-s3";
import { s3Client, BUCKET_NAME } from "./s3Client";


function toObjectKey(owner: string, repo: string, filePath: string): string {
    return `${owner}/${repo}/${filePath}`;
}

export async function ensureBucketExists(): Promise<void> {
    try {
        await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
    } catch {
        await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
    }
}

export async function getFileFromStorage(
    owner: string,
    repo: string,
    filePath: string
): Promise<string | null> {
    const key = toObjectKey(owner, repo, filePath);

    try {
        const response = await s3Client.send(
            new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key })
        );

        if (!response.Body) return null;

        // stream the body to a string
        const chunks: Uint8Array[] = [];
        for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
            chunks.push(chunk);
        }
        return Buffer.concat(chunks).toString("utf-8");
    } catch (err: unknown) {
        const code = (err as { Code?: string; name?: string }).Code ?? (err as { name?: string }).name;
        if (code === "NoSuchKey" || code === "NotFound" || code === "404") {
            return null;
        }
        throw err;
    }
}


export async function storeFileToStorage(
    owner: string,
    repo: string,
    filePath: string,
    content: string
): Promise<void> {
    const key = toObjectKey(owner, repo, filePath);

    await s3Client.send(
        new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: content,
            ContentType: "text/plain; charset=utf-8",
        })
    );
}


export function getStorageKey(owner: string, repo: string, filePath: string): string {
    return toObjectKey(owner, repo, filePath);
}
