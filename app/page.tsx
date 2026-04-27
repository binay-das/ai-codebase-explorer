"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ingestRepo } from "@/lib/domain/ingestRepo";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
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
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
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

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
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

function BotIcon({ className }: { className?: string }) {
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
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  );
}

function TreeIcon({ className }: { className?: string }) {
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
      <path d="M17 5H2" />
      <path d="M22 12H7" />
      <path d="M22 19H12" />
    </svg>
  );
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAnalyze = async () => {
    if (!url.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await ingestRepo(url.trim());
      const owner = result.repo.full_name.split("/")[0];
      router.push(`/repo/${owner}/${result.repo.name}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze repository");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 mb-6 shadow-lg shadow-violet-500/25">
            <CodeIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
            Codebase Explorer
          </h1>
          <p className="text-lg">
            Explore and understand any GitHub repository with AI-powered analysis
          </p>
        </div>

        <div className=" -900/50 backdrop-blur-xl rounded-2xl border p-8 shadow-2xl shadow-black/20">
          <div className="space-y-6">
            <div className="relative">
              <GithubIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-  -500" />
              <input
                type="text"
                className="w-full h-14 rounded-xl border pl-12 pr-4 focus:border-black-500/50 focus:ring-2 focus:ring-violet-500/20 focus:outline-none transition-all text-base"
                placeholder="https://github.com/owner/repository"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              className="w-full h-12 rounded-xl bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
              onClick={handleAnalyze}
              disabled={isLoading || !url.trim()}
            >
              {isLoading ? (
                <>
                  <SpinnerIcon className="w-5 h-5 animate-spin" />
                  <span>Analyzing repository...</span>
                </>
              ) : (
                <>
                  <SearchIcon className="w-5 h-5" />
                  <span>Analyze Repository</span>
                  <ArrowRightIcon className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-  -800/50">
            <p className="text-xs text-  -500 text-center mb-4">
              Try these popular repositories
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                "facebook/react",
                "vercel/next.js",
                "twbs/bootstrap",
                "microsoft/vscode",
              ].map((example) => (
                <button
                  key={example}
                  onClick={() => setUrl(`https://github.com/${example}`)}
                  className="px-3 py-1.5 rounded-lg  -800/50 hover: -700/50 border border-  -700/50 text-xs text-  -400 hover:text-white transition-all"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className=" -900/30 backdrop-blur rounded-xl border border-  -800/30 p-4 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-violet-500/10 mb-3">
              <TreeIcon className="w-5 h-5 text-violet-400" />
            </div>
            <h3 className="text-sm font-medium text-  -300 mb-1">File Explorer</h3>
            <p className="text-xs text-  -500">Navigate the codebase structure</p>
          </div>

          <div className=" -900/30 backdrop-blur rounded-xl border border-  -800/30 p-4 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/10 mb-3">
              <CodeIcon className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-sm font-medium text-  -300 mb-1">Code Viewer</h3>
            <p className="text-xs text-  -500">Syntax highlighted source code</p>
          </div>

          <div className=" -900/30 backdrop-blur rounded-xl border border-  -800/30 p-4 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-fuchsia-500/10 mb-3">
              <BotIcon className="w-5 h-5 text-fuchsia-400" />
            </div>
            <h3 className="text-sm font-medium text-  -300 mb-1">AI Assistant</h3>
            <p className="text-xs text-  -500">Ask questions about the code</p>
          </div>
        </div>
      </div>
    </div>
  );
}
