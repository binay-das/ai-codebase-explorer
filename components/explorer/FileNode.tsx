"use client";

import { memo, useState } from "react";
import { FileNode as FileNodeType } from "@/lib/domain/normalizeTree";
import { useExplorerStore } from "@/lib/store/explorerStore";

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
        ts: "text-sky-500 dark:text-sky-400",
        tsx: "text-sky-500 dark:text-sky-400",
        js: "text-amber-500 dark:text-amber-400",
        jsx: "text-amber-500 dark:text-amber-400",
        py: "text-emerald-500 dark:text-emerald-400",
        rb: "text-rose-500 dark:text-rose-400",
        go: "text-cyan-500 dark:text-cyan-400",
        rs: "text-orange-500 dark:text-orange-400",
        java: "text-red-500 dark:text-red-400",
        md: "text-zinc-400 dark:text-zinc-500",
        json: "text-yellow-600 dark:text-yellow-400",
        css: "text-pink-500 dark:text-pink-400",
        scss: "text-pink-500 dark:text-pink-400",
        html: "text-orange-500 dark:text-orange-400",
        svg: "text-fuchsia-500 dark:text-fuchsia-400",
        png: "text-violet-500 dark:text-violet-400",
        jpg: "text-violet-500 dark:text-violet-400",
        jpeg: "text-violet-500 dark:text-violet-400",
        gitignore: "text-zinc-400 dark:text-zinc-500",
        env: "text-emerald-500 dark:text-emerald-400",
        toml: "text-stone-500 dark:text-stone-400",
        yaml: "text-pink-500 dark:text-pink-400",
        yml: "text-pink-500 dark:text-pink-400",
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
            className={`h-3.5 w-3.5 ${colors[ext] || "text-zinc-400 dark:text-zinc-500"} ${className || ""}`}
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
        <li className="relative">
            <button
                id={`file-node-${node.path.replace(/\//g, "-")}`}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                className={[
                    "group relative flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/50 focus-visible:ring-offset-1 dark:focus-visible:ring-zinc-500/50",
                    isSelected
                        ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100",
                ].join(" ")}
                style={{ paddingLeft: `${depth * 14 + 8}px` }}
                role="treeitem"
                aria-selected={isSelected}
                aria-expanded={isDir ? isOpen : undefined}
                aria-level={depth + 1}
            >
                {depth > 0 ? (
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute bottom-1 left-0 top-1 w-px bg-zinc-200 dark:bg-zinc-800"
                        style={{ left: `${depth * 14 + 2}px` }}
                    />
                ) : null}
                {isDir && (
                    <span
                        className={[
                            "flex h-4 w-4 shrink-0 items-center justify-center",
                            isSelected ? "text-zinc-500 dark:text-zinc-400" : "text-zinc-400",
                        ].join(" ")}
                    >
                        <ChevronIcon isOpen={isOpen} />
                    </span>
                )}
                {!isDir && <span className="w-4 shrink-0" />}
                
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
                
                <span className="min-w-0 flex-1 truncate font-mono text-[12px]">
                    {node.name}
                </span>
            </button>

            {isDir && isOpen && sortedChildren.length > 0 && (
                <ul className="relative mt-1 flex flex-col gap-0.5">
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
