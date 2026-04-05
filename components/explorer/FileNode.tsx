"use client";

import { memo, useState } from "react";
import { FileNode as FileNodeType } from "@/lib/domain/normalizeTree";
import { useExplorerStore } from "@/lib/store/explorerStore";
import { useRepoStore } from "@/lib/store/repoStore";
import { fileCache } from "@/lib/cache/fileCache";

interface FileNodeProps {
    node: FileNodeType;
    onFocusPath?: (path: string) => void;
    siblings?: FileNodeType[];
}

function sortNodes(nodes: FileNodeType[]): FileNodeType[] {
    return [...nodes].sort((a, b) => {
        if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
        return a.name.localeCompare(b.name);
    });
}

export const FileNode = memo(function FileNode({
    node,
    onFocusPath,
    siblings = [],
}: FileNodeProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { selectedFilePath, setSelectedFile } = useExplorerStore();
    const { repo } = useRepoStore();

    const isSelected = selectedFilePath === node.path;
    const isDir = node.type === "dir";
    const sortedChildren = isDir && node.children ? sortNodes(node.children) : [];

    const handleClick = async () => {
        if (isDir) {
            setIsOpen((prev) => !prev);
            return;
        }
        setSelectedFile(node.path);
        if (repo) {
            const [owner, repoName] = repo.full_name.split("/");
            await fileCache.fetchOrGet(owner, repoName, node.path);
        }
    };

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            await handleClick();
        }

        if (e.key === "ArrowRight" && isDir && !isOpen) {
            setIsOpen(true);
        }

        if (e.key === "ArrowLeft" && isDir && isOpen) {
            setIsOpen(false);
        }

        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            const myIdx = siblings.findIndex((s) => s.path === node.path);
            const next =
                e.key === "ArrowDown"
                    ? siblings[myIdx + 1]
                    : siblings[myIdx - 1];
            if (next && onFocusPath) {
                onFocusPath(next.path);
            }
        }
    };

    return (
        <li>
            <button
                id={`file-node-${node.path.replace(/\//g, "-")}`}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                className={[
                    "flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
                    isSelected
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-zinc-700 hover:bg-zinc-100",
                ].join(" ")}
                aria-selected={isSelected}
                aria-expanded={isDir ? isOpen : undefined}
            >
                <span className="shrink-0 select-none text-base leading-none">
                    {isDir ? (isOpen ? "📂" : "📁") : "📄"}
                </span>
                <span className="truncate">{node.name}</span>
            </button>

            {isDir && isOpen && sortedChildren.length > 0 && (
                <ul className="ml-4 mt-0.5 border-l border-zinc-100 pl-2">
                    {sortedChildren.map((child) => (
                        <FileNode
                            key={child.path}
                            node={child}
                            siblings={sortedChildren}
                            onFocusPath={(path) => {
                                const el = document.getElementById(
                                    `file-node-${path.replace(/\//g, "-")}`
                                );
                                el?.focus();
                            }}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
});
