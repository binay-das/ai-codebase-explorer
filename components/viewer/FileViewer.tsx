"use client";

import { useEffect, useState, memo, useCallback, useMemo, useRef } from "react";
import { useExplorerStore } from "@/lib/store/explorerStore";
import { fetchFileForViewer, MAX_LINES } from "@/lib/services/fileService";
import { detectLanguage, isBinaryFile } from "@/lib/viewer/detectLanguage";
import { tokenizeCode } from "@/lib/viewer/highlight";
import { explainFile } from "@/lib/ai/explainFileClient";
import type { ExplainFileResult } from "@/lib/ai/explainFile";
import type { CSSProperties } from "react";
import type { ThemedToken } from "shiki";

type ViewerStatus = "idle" | "loading" | "ready" | "error" | "binary";

interface ViewerState {
    status: ViewerStatus;
    tokens: ThemedToken[][];
    rawContent: string;
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

function normalizeSnippet(text: string): string {
    return text.replace(/\s+/g, " ").trim().toLowerCase();
}

function findHighlightRange(content: string, snippet: string | null): HighlightRange | null {
    if (!snippet) return null;

    const lines = content.split("\n");
    const needle = normalizeSnippet(snippet);

    if (!needle) return null;

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
    if (!fallback) return null;

    const lineIndex = lines.findIndex((line) => normalizeSnippet(line).includes(fallback));
    if (lineIndex === -1) return null;

    return { start: lineIndex + 1, end: lineIndex + 1 };
}

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

function CodeIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
        </svg>
    );
}

function SparklesIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            <path d="M5 3v4" />
            <path d="M19 17v4" />
            <path d="M3 5h4" />
            <path d="M17 19h4" />
        </svg>
    );
}

function SpinnerIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            className={className}
        >
            <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="31.4 31.4"
                strokeDashoffset="0"
            />
        </svg>
    );
}

function EmptyState() {
    return (
        <div className="flex h-full items-center justify-center">
            <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100">
                    <CodeIcon className="h-6 w-6 text-zinc-400" />
                </div>
                <p className="text-sm font-medium text-zinc-500">No file selected</p>
                <p className="mt-1 text-xs text-zinc-400">
                    Select a file from the explorer to view its contents
                </p>
            </div>
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-3 p-5" aria-label="Loading file content">
            {Array.from({ length: 14 }).map((_, i) => (
                <div
                    key={i}
                    className="flex items-center gap-3"
                >
                    <div className="h-3 w-8 animate-pulse rounded bg-zinc-200" />
                    <div
                        className="h-3 animate-pulse rounded bg-zinc-200"
                        style={{ width: `${45 + ((i * 23) % 45)}%` }}
                    />
                </div>
            ))}
        </div>
    );
}

function AILoadingSkeleton() {
    return (
        <div className="space-y-3 p-4" aria-label="Generating explanation">
            <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-pulse rounded bg-zinc-200" />
                <div className="h-3 w-20 animate-pulse rounded bg-zinc-200" />
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
                <div
                    key={i}
                    className="h-3 animate-pulse rounded bg-zinc-100"
                    style={{ width: `${60 + ((i * 17) % 35)}%` }}
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
        <div className="rounded-lg border border-zinc-100 bg-zinc-50/50 p-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-400">
                {title}
            </p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
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
                    <SparklesIcon className="h-4 w-4 text-zinc-500" />
                    <p className="text-sm font-medium text-zinc-700">AI Explanation</p>
                    {aiState.result?.fromCache && (
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                            cached
                        </span>
                    )}
                    {aiState.result?.usedFallback && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-600">
                            fallback
                        </span>
                    )}
                </div>

                <button
                    id="explain-file-btn"
                    onClick={onRequestExplain}
                    disabled={!canExplain || isLoading}
                    className={[
                        "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                        canExplain && !isLoading
                            ? "bg-zinc-900 text-white hover:bg-zinc-800 active:bg-zinc-950"
                            : "cursor-not-allowed bg-zinc-100 text-zinc-400",
                    ].join(" ")}
                    aria-busy={isLoading}
                >
                    {isLoading ? (
                        <>
                            <SpinnerIcon className="h-3 w-3 animate-spin" />
                            Analyzing...
                        </>
                    ) : aiState.status === "done" ? (
                        "Re-analyze"
                    ) : (
                        "Explain File"
                    )}
                </button>
            </div>

            {aiState.status === "loading" && <AILoadingSkeleton />}

            {aiState.status === "error" && (
                <div className="px-4 pb-4">
                    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                        {aiState.error}
                    </p>
                </div>
            )}

            {aiState.status === "done" && aiState.result && (
                <div className="flex max-h-[320px] flex-col gap-3 overflow-y-auto px-4 pb-4">
                    <SectionCard title="Purpose" content={aiState.result.sections.purpose} />
                    <SectionCard
                        title="Key Functions"
                        content={aiState.result.sections.keyComponents}
                    />
                    <SectionCard title="Dependencies" content={aiState.result.sections.dependencies} />
                    <SectionCard title="Project Role" content={aiState.result.sections.projectRole} />
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
        if (!selectedFilePath) return;

        let cancelled = false;

        async function load() {
            if (isBinaryFile(selectedFilePath as string)) {
                if (!cancelled) setState({ ...initialState, status: "binary" });
                return;
            }

            setState({ ...initialState, status: "loading" });

            try {
                const { content, truncated, tooLarge } = await fetchFileForViewer(selectedFilePath!);

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
        if (state.status !== "ready" || !highlightRange || !viewerRef.current) return;

        const target = viewerRef.current.querySelector<HTMLElement>(
            `[data-line-number="${highlightRange.start}"]`
        );

        target?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, [highlightRange, state.status]);

    const handleExplain = useCallback(async () => {
        if (!selectedFilePath || !state.rawContent) return;

        setAIState({ status: "loading", result: null, error: "", filePath: selectedFilePath });

        try {
            const result = await explainFile(state.rawContent, selectedFilePath);
            setAIState({ status: "done", result, error: "", filePath: selectedFilePath });
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to generate explanation.";
            setAIState({ status: "error", result: null, error: msg, filePath: selectedFilePath });
        }
    }, [selectedFilePath, state.rawContent]);

    const fileName = selectedFilePath?.split("/").pop() ?? "";
    const canExplain = state.status === "ready" && !!state.rawContent;

    return (
        <div className="flex h-full flex-col overflow-hidden">
            {selectedFilePath && (
                <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/80 px-4 py-2.5 backdrop-blur-sm">
                    <div className="flex items-center gap-3 min-w-0">
                        <CodeIcon className="h-4 w-4 shrink-0 text-zinc-400" />
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-zinc-800 font-mono">
                                {fileName}
                            </p>
                            <p className="truncate text-[11px] text-zinc-400">
                                {selectedFilePath}
                            </p>
                        </div>
                    </div>
                    {state.status === "ready" && (
                        <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-500">
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
                        <div className="text-center">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-zinc-400">
                                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                    <polyline points="14 2 14 8 20 8" />
                                </svg>
                            </div>
                            <p className="text-sm text-zinc-500">Binary file</p>
                            <p className="mt-1 text-xs text-zinc-400">Cannot preview this file type</p>
                        </div>
                    </div>
                )}

                {state.status === "error" && state.tooLarge && (
                    <div className="flex h-full flex-col items-center justify-center gap-2">
                        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-amber-600">
                                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                                <path d="M12 9v4" />
                                <path d="M12 17h.01" />
                            </svg>
                        </div>
                        <p className="text-sm font-medium text-amber-700">File too large</p>
                        <p className="text-xs text-zinc-400">
                            Exceeds 200 KB limit
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
                            <div className="border-b border-amber-200 bg-amber-50/80 px-4 py-2 text-xs text-amber-700 backdrop-blur-sm">
                                Showing first {MAX_LINES} lines — file truncated for performance
                            </div>
                        )}
                        <div
                            ref={viewerRef}
                            className="h-full overflow-auto bg-white px-4 py-4 font-mono text-[12px] leading-6"
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
                                                "group grid grid-cols-[3.5rem,minmax(0,1fr)] rounded transition-colors",
                                                isHighlighted 
                                                    ? "bg-amber-50/80 ring-1 ring-amber-200" 
                                                    : "hover:bg-zinc-50/50",
                                            ].join(" ")}
                                        >
                                            <span className="select-none pr-4 text-right text-zinc-400/60 group-hover:text-zinc-400 transition-colors">
                                                {lineNumber}
                                            </span>
                                            <span className="whitespace-pre-wrap break-words text-zinc-800">
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
