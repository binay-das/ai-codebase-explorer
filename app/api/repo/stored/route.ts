import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const repositories = await prisma.repository.findMany({
      where: {
        files: {
          some: {
            storageKey: {
              not: null,
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        owner: true,
        name: true,
        fullName: true,
        description: true,
        language: true,
        updatedAt: true,
        _count: {
          select: {
            files: true,
          },
        },
        files: {
          where: {
            storageKey: {
              not: null,
            },
          },
          select: {
            id: true,
          },
        },
      },
      take: 12,
    });

    return NextResponse.json({
      repositories: repositories.map((repository) => ({
        id: repository.id,
        owner: repository.owner,
        name: repository.name,
        fullName: repository.fullName,
        description: repository.description,
        language: repository.language,
        updatedAt: repository.updatedAt.toISOString(),
        fileCount: repository._count.files,
        hydratedFileCount: repository.files.length,
      })),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load stored repositories.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
