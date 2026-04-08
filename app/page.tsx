"use client";

import { useRepoStore } from "@/lib/store/repoStore";
import { ingestRepo } from "@/lib/domain/ingestRepo";
import { useState } from "react";
import { FileTree } from "@/components/explorer/FileTree";
import { FileViewer } from "@/components/viewer/FileViewer";
import ChatPanel from "@/components/chat/ChatPanel";

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

function StarIcon({ className }: { className?: string }) {
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
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function ForkIcon({ className }: { className?: string }) {
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
      <circle cx="12" cy="18" r="3" />
      <circle cx="6" cy="6" r="3" />
      <circle cx="18" cy="6" r="3" />
      <path d="M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9" />
      <path d="M12 12v3" />
    </svg>
  );
}

function BranchIcon({ className }: { className?: string }) {
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
      <line x1="6" x2="6" y1="3" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
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

export default function Home() {
  const [url, setUrl] = useState("");
  const { repo, tree, status, error, reset } = useRepoStore();

  const handleIngest = async () => {
    if (!url) return;
    try {
      await ingestRepo(url);
    } catch {
    }
  };

  const isLoading = status === "loading";

  return (
    <section className="p-5">
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <div className="rounded-xl border border-zinc-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-zinc-900 to-zinc-800 shadow-sm">
              <SearchIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">
                Analyze Repository
              </h1>
              <p className="text-sm text-zinc-500">
                Enter a public GitHub repository to explore its codebase
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <GithubIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                className="h-11 w-full rounded-lg border border-zinc-200 bg-white pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 focus:outline-none transition-all"
                placeholder="https://github.com/owner/repository"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleIngest()}
              />
            </div>
            <button
              className="h-11 rounded-lg bg-zinc-900 px-6 text-sm font-medium text-white hover:bg-zinc-800 active:bg-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              onClick={handleIngest}
              disabled={isLoading || !url}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <SpinnerIcon className="h-4 w-4 animate-spin" />
                  Analyzing...
                </span>
              ) : (
                "Analyze Repository"
              )}
            </button>
            {repo && (
              <button
                className="h-11 rounded-lg border border-zinc-200 bg-white px-5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-all"
                onClick={() => {
                  setUrl("");
                  reset();
                }}
              >
                Reset
              </button>
            )}
          </div>
          {error && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>

        {repo ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="rounded-xl border border-zinc-200/80 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 border border-zinc-200/50">
                    <GithubIcon className="h-6 w-6 text-zinc-700" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">
                      {repo.name}
                    </h2>
                    <p className="text-sm text-zinc-500">{repo.full_name}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-white border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 shadow-sm">
                    <StarIcon className="h-3.5 w-3.5 text-amber-500" />
                    <span>{repo.stargazers_count.toLocaleString()}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-white border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 shadow-sm">
                    <ForkIcon className="h-3.5 w-3.5 text-zinc-500" />
                    <span>{repo.forks_count.toLocaleString()}</span>
                  </div>
                  {repo.language && (
                    <div className="inline-flex items-center rounded-full bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white shadow-sm">
                      {repo.language}
                    </div>
                  )}
                </div>
              </div>

              {repo.description && (
                <p className="mt-5 text-sm leading-relaxed text-zinc-600 max-w-3xl">
                  {repo.description}
                </p>
              )}

              <div className="mt-5 flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-lg border border-zinc-100 bg-zinc-50/50 px-4 py-2">
                  <BranchIcon className="h-4 w-4 text-zinc-500" />
                  <span className="text-xs text-zinc-500">Default branch</span>
                  <span className="text-sm font-medium text-zinc-900">
                    {repo.default_branch}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[260px_minmax(0,1fr)_360px]">
              <div className="rounded-xl border border-zinc-200/80 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-zinc-100 bg-zinc-50/50 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-900">Files</h3>
                    <span className="text-xs text-zinc-400">
                      {tree?.length ?? 0} items
                    </span>
                  </div>
                </div>
                <div className="max-h-[600px] overflow-y-auto p-3">
                  {tree ? <FileTree nodes={tree} /> : null}
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-sm">
                <FileViewer />
              </div>

              <ChatPanel />
            </div>
          </div>
        ) : (
          !isLoading && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/30 p-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm border border-zinc-100">
                <SearchIcon className="h-8 w-8 text-zinc-300" />
              </div>
              <p className="text-sm font-medium text-zinc-500">
                No repository loaded
              </p>
              <p className="mt-1 text-xs text-zinc-400 max-w-xs">
                Enter a GitHub URL above to start exploring a codebase with AI-powered analysis.
              </p>
            </div>
          )
        )}
      </div>
    </section>
  );
}
