"use client";

import { useState, useRef, useEffect } from "react";
import {
    askRepo,
    type AskRepoSource,
    type AskRepoResult,
} from "@/lib/ai/repoChat";
import { useExplorerStore } from "@/lib/store/explorerStore";
import ReactMarkdown from "react-markdown";

type Message = {
    role: "user" | "assistant";
    content: string;
    sources?: AskRepoSource[];
    retrievalStatus?: AskRepoResult["retrievalStatus"];
};

function MessageIcon({ role, className }: { role: "user" | "assistant"; className?: string }) {
    if (role === "user") {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className={className}
            >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        );
    }
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

function SendIcon({ className }: { className?: string }) {
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
            <path d="m22 2-7 20-4-9-9-4Z" />
            <path d="M22 2 11 13" />
        </svg>
    );
}

function ChevronRightIcon({ className }: { className?: string }) {
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
            <path d="m9 18 6-6-6-6" />
        </svg>
    );
}

function RetrievalStatusBadge({
    status,
}: {
    status: AskRepoResult["retrievalStatus"];
}) {
    const labelMap: Record<AskRepoResult["retrievalStatus"], string> = {
        ready: "Grounded",
        empty_index: "No Index",
        no_match: "No Match",
        low_confidence: "Low Confidence",
    };

    const toneMap: Record<AskRepoResult["retrievalStatus"], string> = {
        ready: "border-emerald-200/80 bg-emerald-50/80 text-emerald-700",
        empty_index: "border-zinc-200 bg-zinc-50 text-zinc-600",
        no_match: "border-amber-200/80 bg-amber-50/80 text-amber-700",
        low_confidence: "border-amber-200/80 bg-amber-50/80 text-amber-700",
    };

    return (
        <span
            className={[
                "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em]",
                toneMap[status],
            ].join(" ")}
        >
            {labelMap[status]}
        </span>
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

export default function ChatPanel() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const setSelectedFile = useExplorerStore((state) => state.setSelectedFile);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        const response = await askRepo(userMessage.content);
        const assistantMessage: Message = {
            role: "assistant",
            content: response.answer,
            sources: response.sources,
            retrievalStatus: response.retrievalStatus,
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setLoading(false);
    };

    return (
        <div className="flex h-full min-h-[480px] flex-col overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-sm">
            <div className="border-b border-zinc-100 bg-zinc-50/50 px-5 py-4 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-zinc-900 to-zinc-800 shadow-sm">
                        <MessageIcon role="assistant" className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-zinc-900">
                            Ask Repository
                        </h2>
                        <p className="text-[11px] text-zinc-500">
                            Get AI-powered answers grounded in the codebase
                        </p>
                    </div>
                </div>
            </div>

            <div
                className="flex-1 space-y-4 overflow-y-auto p-5"
                ref={scrollRef}
            >
                {messages.length === 0 && (
                    <div className="mt-8 flex flex-col items-center text-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 border border-zinc-200/50">
                            <MessageIcon role="assistant" className="h-7 w-7 text-zinc-400" />
                        </div>
                        <p className="text-sm font-medium text-zinc-600">
                            Ask about this repository
                        </p>
                        <p className="mt-1 text-xs text-zinc-400 max-w-xs">
                            Questions about files, symbols, or behavior will be answered with citations from the codebase.
                        </p>
                    </div>
                )}
                {messages.map((m, i) => (
                    <div
                        key={i}
                        className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`flex max-w-[88%] flex-col ${
                                m.role === "user" ? "items-end" : "items-start"
                            }`}
                        >
                            <div
                                className={[
                                    "group flex items-start gap-2.5",
                                    m.role === "user" ? "flex-row-reverse" : "flex-row",
                                ].join(" ")}
                            >
                                <div className={[
                                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                                    m.role === "user" 
                                        ? "bg-zinc-900 text-white" 
                                        : "bg-zinc-100 text-zinc-600"
                                ].join(" ")}>
                                    <MessageIcon role={m.role} className="h-3.5 w-3.5" />
                                </div>
                                <div
                                    className={[
                                        "rounded-2xl px-4 py-3",
                                        m.role === "user"
                                            ? "bg-zinc-900 text-white rounded-tr-sm"
                                            : "bg-zinc-50/80 border border-zinc-200/60 text-zinc-800 rounded-tl-sm backdrop-blur-sm",
                                    ].join(" ")}
                                >
                                    {m.role === "assistant" && m.retrievalStatus && (
                                        <div className="mb-2">
                                            <RetrievalStatusBadge status={m.retrievalStatus} />
                                        </div>
                                    )}
                                    <div className="prose max-w-none prose-sm prose-zinc prose-p:my-0 prose-p:last:mb-0 prose-pre:rounded-lg prose-pre:bg-zinc-900 prose-pre:p-3">
                                        <ReactMarkdown
                                            components={{
                                                p: ({ children }) => <p className="mb-2 last:mb-0 text-sm leading-relaxed">{children}</p>,
                                                ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-4 text-sm leading-relaxed">{children}</ul>,
                                                ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-4 text-sm leading-relaxed">{children}</ol>,
                                                li: ({ children }) => <li className="text-sm leading-relaxed">{children}</li>,
                                                code: ({ children, className }) => {
                                                    const isInline = !className;
                                                    return isInline ? (
                                                        <code className="rounded bg-zinc-900/20 px-1.5 py-0.5 font-mono text-xs text-zinc-700">
                                                            {children}
                                                        </code>
                                                    ) : (
                                                        <code className="rounded bg-zinc-900 px-1.5 py-0.5 font-mono text-xs text-blue-300">
                                                            {children}
                                                        </code>
                                                    );
                                                },
                                                pre: ({ children }) => (
                                                    <pre className="mb-2 mt-3 overflow-x-auto rounded-lg border border-zinc-800/50 bg-zinc-900 p-4">
                                                        {children}
                                                    </pre>
                                                ),
                                                strong: ({ children }) => (
                                                    <strong className="font-semibold text-zinc-900">{children}</strong>
                                                ),
                                            }}
                                        >
                                            {m.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>

                            {m.role === "assistant" && !!m.sources?.length && (
                                <div className="mt-2 ml-9 w-full max-w-sm rounded-xl border border-zinc-200/60 bg-white p-3 shadow-sm">
                                    <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                            <polyline points="14 2 14 8 20 8" />
                                        </svg>
                                        Sources
                                    </div>
                                    <div className="space-y-1.5">
                                        {m.sources.map((source) => (
                                            <button
                                                key={`${source.filePath}-${source.snippet}`}
                                                type="button"
                                                onClick={() => setSelectedFile(source.filePath, source.snippet)}
                                                className="flex w-full items-start gap-2 rounded-lg border border-zinc-100 bg-zinc-50/50 px-3 py-2 text-left transition-all hover:border-zinc-300 hover:bg-zinc-100/50"
                                            >
                                                <ChevronRightIcon className="h-3 w-3 mt-1 shrink-0 text-zinc-400" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-medium text-zinc-700 truncate font-mono">
                                                        {source.filePath}
                                                    </p>
                                                    <p className="mt-0.5 text-[11px] text-zinc-500 line-clamp-2">
                                                        {source.snippet}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="flex items-start gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
                                <MessageIcon role="assistant" className="h-3.5 w-3.5" />
                            </div>
                            <div className="rounded-2xl rounded-tl-sm border border-zinc-200/60 bg-zinc-50/80 px-4 py-3 backdrop-blur-sm">
                                <div className="flex items-center gap-2">
                                    <SpinnerIcon className="h-4 w-4 animate-spin text-zinc-400" />
                                    <span className="text-sm text-zinc-500">Thinking...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="border-t border-zinc-100 p-4">
                <div className="flex items-center gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about the codebase..."
                        disabled={loading}
                        className="h-10 flex-1 rounded-lg border border-zinc-200 bg-white px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 focus:outline-none disabled:opacity-50 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-white transition-all hover:bg-zinc-800 active:bg-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        <SendIcon className="h-4 w-4" />
                    </button>
                </div>
            </form>
        </div>
    );
}
