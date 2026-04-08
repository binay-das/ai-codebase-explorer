"use client";

import { memo } from "react";
import { FileNode as FileNodeType } from "@/lib/domain/normalizeTree";
import { FileNode } from "./FileNode";

interface FileTreeProps {
    nodes: FileNodeType[];
}

function sortNodes(nodes: FileNodeType[]): FileNodeType[] {
    return [...nodes].sort((a, b) => {
        if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
        return a.name.localeCompare(b.name);
    });
}

export const FileTree = memo(function FileTree({ nodes }: FileTreeProps) {
    if (nodes.length === 0) {
        return (
            <div className="py-8 text-center">
                <p className="text-xs text-zinc-400">No files found</p>
            </div>
        );
    }

    const sorted = sortNodes(nodes);

    return (
        <nav aria-label="File tree">
            <ul className="flex flex-col">
                {sorted.map((node) => (
                    <FileNode
                        key={node.path}
                        node={node}
                        siblings={sorted}
                        onFocusPath={(path) => {
                            const el = document.getElementById(
                                `file-node-${path.replace(/\//g, "-")}`
                            );
                            el?.focus();
                        }}
                    />
                ))}
            </ul>
        </nav>
    );
});
