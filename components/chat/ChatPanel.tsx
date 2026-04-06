"use client";

import { useState, useRef, useEffect } from "react";
import { askRepo, type AskRepoSource } from "@/lib/ai/repoChat";
import { useExplorerStore } from "@/lib/store/explorerStore";
import ReactMarkdown from "react-markdown";

type Message = {
    role: "user" | "assistant";
    content: string;
    sources?: AskRepoSource[];
};

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
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setLoading(false);
    };

    return (
        <div className="flex flex-col h-full bg-slate-900 text-slate-100 p-4 rounded-lg shadow-xl border border-slate-700">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                Ask Repository
            </h2>

            <div
                className="grow overflow-y-auto mb-4 space-y-4 pr-2 custom-scrollbar"
                ref={scrollRef}
            >
                {messages.length === 0 && (
                    <div className="text-slate-500 text-center mt-10">
                        exploration. ask a question about the codebase.
                    </div>
                )}
                {messages.map((m, i) => (
                    <div
                        key={i}
                        className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[85%] p-3 rounded-lg ${m.role === "user"
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-800 text-slate-100 border border-slate-700"
                                }`}
                        >
                            <div className="text-xs font-bold mb-1 uppercase opacity-50">
                                {m.role}
                            </div>
                            {m.role === "user" ? (
                                <div className="whitespace-pre-wrap">{m.content}</div>
                            ) : (
                                <div className="space-y-3">
                                    <ReactMarkdown
                                        className="prose prose-invert max-w-none prose-p:my-0 prose-pre:bg-slate-950 prose-pre:p-2 prose-pre:rounded prospect-code:text-blue-300"
                                        components={{
                                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                            ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                                            ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                                            li: ({ children }) => <li className="mb-1">{children}</li>,
                                            code: ({ children }) => (
                                                <code className="bg-slate-950 text-blue-300 px-1 rounded text-sm font-mono leading-relaxed">
                                                    {children}
                                                </code>
                                            ),
                                            pre: ({ children }) => (
                                                <pre className="bg-slate-950 p-4 rounded-md overflow-x-auto border border-slate-700 mb-2 mt-2">
                                                    {children}
                                                </pre>
                                            )
                                        }}
                                    >
                                        {m.content}
                                    </ReactMarkdown>

                                    {!!m.sources?.length && (
                                        <div className="rounded-md border border-slate-700/80 bg-slate-900/70 p-3">
                                            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                                sources
                                            </div>
                                            <div className="space-y-2">
                                                {m.sources.map((source) => (
                                                    <div
                                                        key={`${source.filePath}-${source.snippet}`}
                                                        className="rounded-md border border-slate-700 bg-slate-950/70 px-3 py-2"
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedFile(source.filePath)}
                                                            className="text-left text-sm font-medium text-blue-300 transition hover:text-blue-200 hover:underline"
                                                        >
                                                            {source.filePath}
                                                        </button>
                                                        <p className="mt-1 text-sm leading-6 text-slate-300">
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
                    placeholder="ask a question..."
                    disabled={loading}
                    className="grow p-3 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 p-3 px-6 rounded font-bold transition disabled:opacity-50"
                >
                    {loading ? "..." : "send"}
                </button>
            </form>
        </div>
    );
}
