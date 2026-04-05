"use client";

import { useRepoStore } from "@/lib/store/repoStore";
import { ingestRepo } from "@/lib/domain/ingestRepo";
import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const { repo, status, error, reset } = useRepoStore();

  const handleIngest = async () => {
    if (!url) return;
    try {
      await ingestRepo(url);
    } catch (e) {
    }
  };

  const isLoading = status === "loading";

  return (
    <section className="p-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
            Explorer
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
            Analyze Repository
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-600">
            Enter a public GitHub repository URL to ingest its metadata and file tree for analysis.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              className="flex-1 rounded-md border border-zinc-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="e.g., https://github.com/facebook/react"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleIngest()}
            />
            <button
              className="rounded-md bg-zinc-900 px-6 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 transition-colors"
              onClick={handleIngest}
              disabled={isLoading || !url}
            >
              {isLoading ? "Ingesting..." : "Ingest Repository"}
            </button>
            {repo && (
              <button
                className="rounded-md border border-zinc-200 bg-white px-6 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
                onClick={() => {
                  setUrl("");
                  reset();
                }}
              >
                Clear
              </button>
            )}
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </div>

        {repo ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-zinc-950">
                    {repo.name}
                  </h2>
                  <p className="text-sm text-zinc-500 mt-1">{repo.full_name}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                    ⭐ {repo.stargazers_count.toLocaleString()}
                  </div>
                  <div className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                    🍴 {repo.forks_count.toLocaleString()}
                  </div>
                  {repo.language && (
                    <div className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      {repo.language}
                    </div>
                  )}
                </div>
              </div>

              {repo.description && (
                <p className="mt-6 text-sm leading-7 text-zinc-600 max-w-3xl">
                  {repo.description}
                </p>
              )}

              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4">
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Default Branch
                  </p>
                  <p className="mt-1 text-sm font-semibold text-zinc-900">
                    {repo.default_branch}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          !isLoading && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/30 p-12 text-center">
              <p className="text-sm font-medium text-zinc-500">
                No repository loaded
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                Ingest a repository to view its details here.
              </p>
            </div>
          )
        )}
      </div>
    </section>
  );
}
