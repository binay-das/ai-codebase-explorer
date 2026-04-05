"use client";

import { useEffect, useState, memo } from "react";
import { useExplorerStore } from "@/lib/store/explorerStore";
import { fetchFileForViewer, MAX_LINES } from "@/lib/services/fileService";
import { detectLanguage, isBinaryFile } from "@/lib/viewer/detectLanguage";
import { highlightCode } from "@/lib/viewer/highlight";



type ViewerStatus = "idle" | "loading" | "ready" | "error" | "binary";


interface ViewerState {
    status: ViewerStatus;
    html: string;
    error: string;
    truncated: boolean;
    tooLarge: boolean;
    lineCount: number;
}

const initialState: ViewerState = {
    status: "idle",
    html: "",
    error: "",
    truncated: false,
    tooLarge: false,
    lineCount: 0,
};


function EmptyState() {
    return (
        <div className="flex h-full items-center justify-center">
            <div className="text-center">
                <p className="text-sm font-medium text-zinc-400">No file selected</p>
                <p className="mt-1 text-xs text-zinc-300">
                    Pick a file from the explorer to view its content.
                </p>
            </div>
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-2 p-4" aria-label="Loading file content">
            {Array.from({ length: 12 }).map((_, i) => (
                <div
                    key={i}
                    className="h-4 animate-pulse rounded bg-zinc-100"
                    style={{ width: `${60 + ((i * 17) % 35)}%` }}
                />
            ))}
        </div>
    );
}



export const FileViewer = memo(function FileViewer() {
    const { selectedFilePath } = useExplorerStore();
    const [state, setState] = useState<ViewerState>(initialState);

    useEffect(() => {
        if (!selectedFilePath) {
            setState(initialState);
            return;
        }

        // binary shortcut — no fetch needed
        if (isBinaryFile(selectedFilePath)) {
            setState({ ...initialState, status: "binary" });
            return;
        }

        let cancelled = false;

        async function load() {
            setState({ ...initialState, status: "loading" });

            try {
                const { content, truncated, tooLarge } = await fetchFileForViewer(
                    selectedFilePath!
                );

                if (cancelled) return;

                if (tooLarge) {
                    setState({ ...initialState, status: "error", tooLarge: true, error: "" });
                    return;
                }

                const language = detectLanguage(selectedFilePath!);
                const html = await highlightCode(content, language);

                if (cancelled) return;

                setState({
                    status: "ready",
                    html,
                    truncated,
                    tooLarge: false,
                    error: "",
                    lineCount: content.split("\n").length,
                });
            } catch (err) {
                if (cancelled) return;
                const msg =
                    err instanceof Error ? err.message : "Failed to load file.";

                if (msg === "BINARY") {
                    setState({ ...initialState, status: "binary" });
                } else {
                    setState({ ...initialState, status: "error", error: msg });
                }
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [selectedFilePath]);


    const fileName = selectedFilePath?.split("/").pop() ?? "";

    return (
        <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">

            {selectedFilePath && (
                <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50 px-4 py-2">
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-zinc-800">
                            {fileName}
                        </p>
                        <p className="truncate text-[11px] text-zinc-400">
                            {selectedFilePath}
                        </p>
                    </div>
                    {state.status === "ready" && (
                        <span className="ml-4 shrink-0 text-[11px] text-zinc-400">
                            {state.lineCount} lines
                        </span>
                    )}
                </div>
            )}

            
            <div className="min-h-0 flex-1 overflow-auto">
                {state.status === "idle" && <EmptyState />}

                {state.status === "loading" && <LoadingSkeleton />}

                {state.status === "binary" && (
                    <div className="flex h-full items-center justify-center">
                        <p className="text-sm text-zinc-400">
                            Cannot preview this file — binary or unsupported type.
                        </p>
                    </div>
                )}

                {state.status === "error" && state.tooLarge && (
                    <div className="flex h-full flex-col items-center justify-center gap-2">
                        <p className="text-sm font-medium text-amber-600">File too large</p>
                        <p className="text-xs text-zinc-400">
                            This file exceeds 200 KB and cannot be rendered.
                        </p>
                    </div>
                )}

                {state.status === "error" && !state.tooLarge && (
                    <div className="flex h-full items-center justify-center">
                        <p className="text-sm text-red-500">{state.error}</p>
                    </div>
                )}

                {state.status === "ready" && (
                    <div className="h-full">
                        {state.truncated && (
                            <div className="border-b border-amber-100 bg-amber-50 px-4 py-2 text-xs text-amber-600">
                                Showing first {MAX_LINES} lines — file truncated for performance.
                            </div>
                        )}
                        {/* Shiki renders its own <pre><code> with inline colors */}
                        <div
                            className="h-full overflow-auto text-sm [&>pre]:h-full [&>pre]:overflow-auto [&>pre]:p-4 [&>pre]:font-mono [&>pre]:text-xs [&>pre]:leading-5"
                            dangerouslySetInnerHTML={{ __html: state.html }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
});
