"use client";

import { useState } from "react";
import { FileNode as FileNodeType } from "@/lib/domain/normalizeTree";
import { useExplorerStore } from "@/lib/store/explorerStore";
import { useRepoStore } from "@/lib/store/repoStore";
import { fileCache } from "@/lib/cache/fileCache";

interface FileNodeProps {
    node: FileNodeType;
}

export function FileNode({ node }: FileNodeProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { selectedFilePath, setSelectedFile } = useExplorerStore();
    const { repo } = useRepoStore();

    const isSelected = selectedFilePath === node.path;
    const isDir = node.type === "dir";

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

    return (
        <li>
            <button
                onClick={handleClick}
                className={[
                    "flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-sm transition-colors",
                    isSelected
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-zinc-700 hover:bg-zinc-100",
                ].join(" ")}
            >
                {/* Icon */}
                <span className="shrink-0 select-none text-base leading-none">
                    {isDir ? (isOpen ? "📂" : "📁") : "📄"}
                </span>

                {/* Name */}
                <span className="truncate">{node.name}</span>
            </button>

            {/* Children rendered recursively */}
            {isDir && isOpen && node.children && node.children.length > 0 && (
                <ul className="ml-4 mt-0.5 border-l border-zinc-100 pl-2">
                    {node.children.map((child) => (
                        <FileNode key={child.path} node={child} />
                    ))}
                </ul>
            )}
        </li>
    );
}
