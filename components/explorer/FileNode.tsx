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
    depth?: number;
}

function sortNodes(nodes: FileNodeType[]): FileNodeType[] {
    return [...nodes].sort((a, b) => {
        if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
        return a.name.localeCompare(b.name);
    });
}

function getFileExtension(filename: string): string {
    const parts = filename.split(".");
    return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

function FileIcon({ extension, className }: { extension: string; className?: string }) {
    const ext = extension;
    
    const colors: Record<string, string> = {
        ts: "text-blue-400",
        tsx: "text-blue-400",
        js: "text-amber-400",
        jsx: "text-amber-400",
        py: "text-green-400",
        rb: "text-red-400",
        go: "text-cyan-400",
        rs: "text-orange-400",
        java: "text-red-500",
        md: "text-zinc-500",
        json: "text-amber-500",
        css: "text-pink-400",
        scss: "text-pink-400",
        html: "text-orange-400",
        svg: "text-amber-400",
        png: "text-purple-400",
        jpg: "text-purple-400",
        gitignore: "text-zinc-400",
        env: "text-emerald-400",
        toml: "text-zinc-400",
        yaml: "text-pink-400",
        yml: "text-pink-400",
    };

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`h-3.5 w-3.5 ${colors[ext] || "text-zinc-400"} ${className || ""}`}
        >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
        </svg>
    );
}

function FolderOpenIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`h-4 w-4 text-amber-500 ${className || ""}`}
        >
            <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" />
        </svg>
    );
}

function FolderClosedIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`h-4 w-4 text-amber-500 ${className || ""}`}
        >
            <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
        </svg>
    );
}

function ChevronIcon({ isOpen, className }: { isOpen: boolean; className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`h-3 w-3 text-zinc-400 transition-transform duration-150 ${isOpen ? "rotate-90" : ""} ${className || ""}`}
        >
            <polyline points="9 18 15 12 9 6" />
        </svg>
    );
}

export const FileNode = memo(function FileNode({
    node,
    onFocusPath,
    siblings = [],
    depth = 0,
}: FileNodeProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { selectedFilePath, setSelectedFile } = useExplorerStore();
    const { repo } = useRepoStore();

    const isSelected = selectedFilePath === node.path;
    const isDir = node.type === "dir";
    const sortedChildren = isDir && node.children ? sortNodes(node.children) : [];
    const fileExtension = !isDir ? getFileExtension(node.name) : "";

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
                    "group flex w-full items-center gap-1.5 rounded-md py-1 pl-2 pr-3 text-left text-[13px] transition-all duration-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/50 focus-visible:ring-offset-1",
                    isSelected
                        ? "bg-zinc-900 text-white"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
                ].join(" ")}
                style={{ paddingLeft: `${depth * 12 + 8}px` }}
                role="treeitem"
                aria-selected={isSelected}
                aria-expanded={isDir ? isOpen : undefined}
                aria-level={depth + 1}
            >
                {isDir && (
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                        <ChevronIcon isOpen={isOpen} />
                    </span>
                )}
                {!isDir && <span className="w-4" />}
                
                <span className="shrink-0">
                    {isDir ? (
                        isOpen ? (
                            <FolderOpenIcon />
                        ) : (
                            <FolderClosedIcon />
                        )
                    ) : (
                        <FileIcon extension={fileExtension} />
                    )}
                </span>
                
                <span className="truncate font-mono text-[12px]">
                    {node.name}
                </span>
            </button>

            {isDir && isOpen && sortedChildren.length > 0 && (
                <ul className="relative">
                    <li className="absolute left-4 top-0 h-full w-px bg-zinc-200" />
                    {sortedChildren.map((child) => (
                        <FileNode
                            key={child.path}
                            node={child}
                            siblings={sortedChildren}
                            depth={depth + 1}
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
