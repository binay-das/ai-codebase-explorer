"use client";

import { FileNode as FileNodeType } from "@/lib/domain/normalizeTree";
import { FileNode } from "./FileNode";

interface FileTreeProps {
    nodes: FileNodeType[];
}

export function FileTree({ nodes }: FileTreeProps) {
    if (nodes.length === 0) {
        return (
            <p className="px-2 py-4 text-xs text-zinc-400">No files found.</p>
        );
    }

    return (
        <nav aria-label="File tree">
            <ul className="flex flex-col gap-0.5">
                {nodes.map((node) => (
                    <FileNode key={node.path} node={node} />
                ))}
            </ul>
        </nav>
    );
}
