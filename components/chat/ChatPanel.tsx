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
        ready: "border-emerald-200 bg-emerald-50 text-emerald-700",
        empty_index: "border-zinc-200 bg-zinc-100 text-zinc-600",
        no_match: "border-amber-200 bg-amber-50 text-amber-700",
        low_confidence: "border-amber-200 bg-amber-50 text-amber-700",
    };

    return (
        <span
            className={[
                "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em]",
                toneMap[status],
            ].join(" ")}
        >
            {labelMap[status]}
        </span>
    );
}

export default function ChatPanel() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const setSelectedFile = useExplorerStore((state) => state.setSelectedFile);

    // scroll to the bottom when messages change
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
        <div className="flex h-full min-h-[420px] flex-col rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="mb-1 text-lg font-semibold text-zinc-950">
                Ask Repository
            </h2>
            <p className="mb-4 text-sm leading-6 text-zinc-500">
                Ask about files, symbols, or behavior. Retrieval status is shown on each answer.
            </p>

            <div
                className="grow space-y-4 overflow-y-auto pr-1"
                ref={scrollRef}
            >
                {messages.length === 0 && (
                    <div className="mt-10 text-center text-sm text-zinc-400">
                        Ask a repository question to see grounded answers and fallback states.
                    </div>
                )}
                {messages.map((m, i) => (
                    <div
                        key={i}
                        className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[85%] rounded-2xl p-3 ${m.role === "user"
                                    ? "bg-zinc-900 text-white"
                                    : "border border-zinc-200 bg-zinc-50 text-zinc-900"
                                }`}
                        >
                            <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] opacity-50">
                                {m.role}
                            </div>
                            {m.role === "user" ? (
                                <div className="whitespace-pre-wrap">{m.content}</div>
                            ) : (
                                <div className="space-y-3">
                                    {m.retrievalStatus && (
                                        <RetrievalStatusBadge status={m.retrievalStatus} />
                                    )}
                                    <ReactMarkdown
                                        className="prose max-w-none prose-zinc prose-p:my-0 prose-pre:rounded prose-pre:bg-zinc-950 prose-pre:p-2"
                                        components={{
                                            p: ({ children }) => <p className="mb-2 last:mb-0 text-sm leading-6 text-zinc-700">{children}</p>,
                                            ul: ({ children }) => <ul className="mb-2 list-disc pl-4 text-sm leading-6 text-zinc-700">{children}</ul>,
                                            ol: ({ children }) => <ol className="mb-2 list-decimal pl-4 text-sm leading-6 text-zinc-700">{children}</ol>,
                                            li: ({ children }) => <li className="mb-1">{children}</li>,
                                            code: ({ children }) => (
                                                <code className="rounded bg-zinc-950 px-1 text-sm font-mono leading-relaxed text-blue-300">
                                                    {children}
                                                </code>
                                            ),
                                            pre: ({ children }) => (
                                                <pre className="mb-2 mt-2 overflow-x-auto rounded-md border border-zinc-800 bg-zinc-950 p-4">
                                                    {children}
                                                </pre>
                                            )
                                        }}
                                    >
                                        {m.content}
                                    </ReactMarkdown>

                                    {!!m.sources?.length && (
                                        <div className="rounded-xl border border-zinc-200 bg-white p-3">
                                            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                                                sources
                                            </div>
                                            <div className="space-y-2">
                                                {m.sources.map((source) => (
                                                    <div
                                                        key={`${source.filePath}-${source.snippet}`}
                                                        className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2"
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedFile(source.filePath, source.snippet)}
                                                            className="text-left text-sm font-medium text-blue-700 transition hover:text-blue-800 hover:underline"
                                                        >
                                                            {source.filePath}
                                                        </button>
                                                        <p className="mt-1 text-sm leading-6 text-zinc-600">
                                                            {source.snippet}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about a file, symbol, or behavior..."
                    disabled={loading}
                    className="grow rounded-xl border border-zinc-300 bg-white p-3 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-xl bg-zinc-900 p-3 px-5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50"
                >
                    {loading ? "..." : "Ask"}
                </button>
            </form>
        </div>
    );
}
