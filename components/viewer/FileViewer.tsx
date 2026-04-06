"use client";

import { useEffect, useState, memo, useCallback, useMemo, useRef } from "react";
import { useExplorerStore } from "@/lib/store/explorerStore";
import { fetchFileForViewer, MAX_LINES } from "@/lib/services/fileService";
import { detectLanguage, isBinaryFile } from "@/lib/viewer/detectLanguage";
import { tokenizeCode } from "@/lib/viewer/highlight";
import { explainFile, type ExplainFileResult } from "@/lib/ai/explainFile";
import type { CSSProperties } from "react";
import type { ThemedToken } from "shiki";


type ViewerStatus = "idle" | "loading" | "ready" | "error" | "binary";

interface ViewerState {
    status: ViewerStatus;
    tokens: ThemedToken[][];
    rawContent: string;      // kept to pass to AI without re-fetching
    error: string;
    truncated: boolean;
    tooLarge: boolean;
    lineCount: number;
}

const initialState: ViewerState = {
    status: "idle",
    tokens: [],
    rawContent: "",
    error: "",
    truncated: false,
    tooLarge: false,
    lineCount: 0,
};



type AIStatus = "idle" | "loading" | "done" | "error";

interface AIState {
    status: AIStatus;
    result: ExplainFileResult | null;
    error: string;
    filePath: string | null;
}

const aiInitial: AIState = { status: "idle", result: null, error: "", filePath: null };

type HighlightRange = {
    start: number;
    end: number;
};

// collapse whitespace for source matching
function normalizeSnippet(text: string): string {
    return text.replace(/\s+/g, " ").trim().toLowerCase();
}

// find the visible lines that best match a source snippet
function findHighlightRange(content: string, snippet: string | null): HighlightRange | null {
    if (!snippet) {
        return null;
    }

    const lines = content.split("\n");
    const needle = normalizeSnippet(snippet);

    if (!needle) {
        return null;
    }

    for (let start = 0; start < lines.length; start++) {
        let window = "";

        for (let end = start; end < Math.min(lines.length, start + 12); end++) {
            window = `${window} ${lines[end]}`.trim();

            if (normalizeSnippet(window).includes(needle)) {
                return { start: start + 1, end: end + 1 };
            }
        }
    }

    const fallback = needle.slice(0, 80).trim();

    if (!fallback) {
        return null;
    }

    const lineIndex = lines.findIndex((line) => normalizeSnippet(line).includes(fallback));

    if (lineIndex === -1) {
        return null;
    }

    return { start: lineIndex + 1, end: lineIndex + 1 };
}

// build inline styles for highlighted code tokens
function getTokenStyle(token: ThemedToken): CSSProperties {
    return {
        color: token.htmlStyle?.color ?? token.color,
        backgroundColor: token.htmlStyle?.backgroundColor ?? token.bgColor,
        fontStyle: token.fontStyle === 1 ? "italic" : undefined,
        fontWeight: token.fontStyle === 2 ? 700 : undefined,
        textDecoration: token.fontStyle === 4 ? "underline" : undefined,
        ...token.htmlStyle,
    };
}


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

function AILoadingSkeleton() {
    return (
        <div className="space-y-3 p-4" aria-label="Generating explanation">
            <div className="h-3 w-24 animate-pulse rounded bg-zinc-100" />
            {Array.from({ length: 4 }).map((_, i) => (
                <div
                    key={i}
                    className="h-3 animate-pulse rounded bg-zinc-100"
                    style={{ width: `${50 + ((i * 23) % 40)}%` }}
                />
            ))}
        </div>
    );
}

interface SectionCardProps {
    title: string;
    content: string;
}

function SectionCard({ title, content }: SectionCardProps) {
    if (!content.trim()) return null;
    return (
        <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                {title}
            </p>
            <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-700">
                {content}
            </p>
        </div>
    );
}

interface ExplanationPanelProps {
    aiState: AIState;
    onRequestExplain: () => void;
    canExplain: boolean;
}

function ExplanationPanel({ aiState, onRequestExplain, canExplain }: ExplanationPanelProps) {
    const isLoading = aiState.status === "loading";

    return (
        <div className="border-t border-zinc-100 bg-white">
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                    <span className="text-base" aria-hidden>✨</span>
                    <p className="text-sm font-medium text-zinc-800">AI Explanation</p>
                    {aiState.result?.fromCache && (
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                            cached
                        </span>
                    )}
                    {aiState.result?.usedFallback && (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-500">
                            fallback
                        </span>
                    )}
                </div>

                <button
                    id="explain-file-btn"
                    onClick={onRequestExplain}
                    disabled={!canExplain || isLoading}
                    className={[
                        "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                        canExplain && !isLoading
                            ? "bg-zinc-900 text-white hover:bg-zinc-700"
                            : "cursor-not-allowed bg-zinc-100 text-zinc-400",
                    ].join(" ")}
                    aria-busy={isLoading}
                >
                    {isLoading ? (
                        <span className="flex items-center gap-1.5">
                            <span
                                className="inline-block h-2.5 w-2.5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700"
                                aria-hidden
                            />
                            Explaining…
                        </span>
                    ) : aiState.status === "done" ? (
                        "Re-explain"
                    ) : (
                        "Explain File"
                    )}
                </button>
            </div>

            {aiState.status === "loading" && <AILoadingSkeleton />}

            {aiState.status === "error" && (
                <div className="px-4 pb-4">
                    <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
                        {aiState.error}
                    </p>
                </div>
            )}

            {aiState.status === "done" && aiState.result && (
                <div className="flex max-h-[360px] flex-col gap-3 overflow-y-auto px-4 pb-4">
                    <SectionCard title="Purpose" content={aiState.result.sections.purpose} />
                    <SectionCard
                        title="Key Functions / Components"
                        content={aiState.result.sections.keyComponents}
                    />
                    <SectionCard title="Dependencies" content={aiState.result.sections.dependencies} />
                    <SectionCard title="Project Role" content={aiState.result.sections.projectRole} />
                    {/* Fallback: show raw if all sections are empty */}
                    {!aiState.result.sections.purpose &&
                        !aiState.result.sections.keyComponents &&
                        !aiState.result.sections.dependencies &&
                        !aiState.result.sections.projectRole && (
                            <SectionCard title="Explanation" content={aiState.result.sections.raw} />
                        )}
                </div>
            )}
        </div>
    );
}


export const FileViewer = memo(function FileViewer() {
    const { selectedFilePath, highlightedSnippet } = useExplorerStore();
    const [state, setState] = useState<ViewerState>(initialState);
    const [aiState, setAIState] = useState<AIState>(aiInitial);
    const viewerRef = useRef<HTMLDivElement>(null);
    const visibleAIState = aiState.filePath === selectedFilePath ? aiState : aiInitial;

    useEffect(() => {
        if (!selectedFilePath) {
            return;
        }

        let cancelled = false;

        async function load() {
            if (isBinaryFile(selectedFilePath as string)) {
                if (!cancelled) {
                    setState({ ...initialState, status: "binary" });
                }
                return;
            }

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
                const tokens = await tokenizeCode(content, language);

                if (cancelled) return;

                setState({
                    status: "ready",
                    tokens,
                    rawContent: content,
                    truncated,
                    tooLarge: false,
                    error: "",
                    lineCount: content.split("\n").length,
                });
            } catch (err) {
                if (cancelled) return;
                const msg = err instanceof Error ? err.message : "Failed to load file.";

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

    const highlightRange = useMemo(
        () => findHighlightRange(state.rawContent, highlightedSnippet),
        [highlightedSnippet, state.rawContent]
    );

    useEffect(() => {
        if (state.status !== "ready" || !highlightRange || !viewerRef.current) {
            return;
        }

        const target = viewerRef.current.querySelector<HTMLElement>(
            `[data-line-number="${highlightRange.start}"]`
        );

        target?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, [highlightRange, state.status]);

    // AI explanation handler
    const handleExplain = useCallback(async () => {
        if (!selectedFilePath || !state.rawContent) return;

        setAIState({ status: "loading", result: null, error: "", filePath: selectedFilePath });

        try {
            const result = await explainFile(state.rawContent, selectedFilePath);
            setAIState({ status: "done", result, error: "", filePath: selectedFilePath });
        } catch (err) {
            const msg =
                err instanceof Error ? err.message : "Failed to generate explanation.";
            setAIState({ status: "error", result: null, error: msg, filePath: selectedFilePath });
        }
    }, [selectedFilePath, state.rawContent]);

    const fileName = selectedFilePath?.split("/").pop() ?? "";
    const canExplain = state.status === "ready" && !!state.rawContent;

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
                        <div
                            ref={viewerRef}
                            className="h-full overflow-auto bg-white px-4 py-4 font-mono text-xs leading-5"
                        >
                            <pre className="min-h-full">
                                {state.tokens.map((lineTokens, index) => {
                                    const lineNumber = index + 1;
                                    const isHighlighted =
                                        !!highlightRange &&
                                        lineNumber >= highlightRange.start &&
                                        lineNumber <= highlightRange.end;

                                    return (
                                        <div
                                            key={lineNumber}
                                            data-line-number={lineNumber}
                                            className={[
                                                "grid grid-cols-[3rem,minmax(0,1fr)] rounded px-2 transition-colors",
                                                isHighlighted ? "bg-amber-50 ring-1 ring-amber-200/70" : "",
                                            ].join(" ")}
                                        >
                                            <span className="select-none pr-4 text-right text-zinc-400">
                                                {lineNumber}
                                            </span>
                                            <span className="whitespace-pre-wrap break-words">
                                                {lineTokens.length === 0 ? " " : lineTokens.map((token, tokenIndex) => (
                                                    <span key={`${lineNumber}-${tokenIndex}`} style={getTokenStyle(token)}>
                                                        {token.content}
                                                    </span>
                                                ))}
                                            </span>
                                        </div>
                                    );
                                })}
                            </pre>
                        </div>
                    </div>
                )}
            </div>

            {selectedFilePath && state.status !== "binary" && (
                <ExplanationPanel
                    aiState={visibleAIState}
                    onRequestExplain={handleExplain}
                    canExplain={canExplain}
                />
            )}
        </div>
    );
});
