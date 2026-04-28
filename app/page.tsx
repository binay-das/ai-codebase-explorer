"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Sidebar } from "@/components/layout/Sidebar";
import { ingestRepo } from "@/lib/domain/ingestRepo";
import { useStoredRepositories } from "@/lib/hooks/useStoredRepositories";

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

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { repositories, isLoading: isLoadingRepositories, error: repositoriesError } =
    useStoredRepositories();

  const repositoryItems = repositories.map((repository) => ({
    label: repository.fullName,
    href: `/repo/${repository.owner}/${repository.name}`,
    meta: repository.language ?? `${repository.hydratedFileCount} files`,
  }));

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
    <div className="flex h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <Sidebar
        appName="Codebase Explorer"
        navigationItems={[{ label: "Home", href: "/" }]}
        repositoryItems={repositoryItems}
      />

      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 lg:px-8">
          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-8">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 dark:bg-zinc-100">
                  <CodeIcon className="h-7 w-7 text-white dark:text-zinc-900" />
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                  Codebase Explorer
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
                  Open repos you already pulled from storage, or ingest a new one once and
                  keep browsing it from the app.
                </p>
              </div>

              <div className="space-y-5">
                <div className="relative">
                  <GithubIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    className="h-14 w-full rounded-xl border border-zinc-200 bg-white pl-12 pr-4 text-base text-zinc-900 outline-none transition focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                    placeholder="https://github.com/owner/repository"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                    disabled={isLoading}
                  />
                </div>

                {error ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-950 dark:bg-red-950/40 dark:text-red-300">
                    {error}
                  </div>
                ) : null}

                <button
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  onClick={handleAnalyze}
                  disabled={isLoading || !url.trim()}
                >
                  {isLoading ? (
                    <>
                      <SpinnerIcon className="h-5 w-5 animate-spin" />
                      <span>Pulling repository...</span>
                    </>
                  ) : (
                    <>
                      <SearchIcon className="h-5 w-5" />
                      <span>Pull and explore</span>
                      <ArrowRightIcon className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="mt-8 border-t border-zinc-100 pt-6 dark:border-zinc-800">
                <p className="mb-4 text-xs font-medium uppercase tracking-[0.15em] text-zinc-400">
                  Quick start
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "facebook/react",
                    "vercel/next.js",
                    "twbs/bootstrap",
                    "microsoft/vscode",
                  ].map((example) => (
                    <button
                      key={example}
                      onClick={() => setUrl(`https://github.com/${example}`)}
                      className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:text-white"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-zinc-950 dark:text-white">
                    Pulled repositories
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Loaded from your database records and S3-backed file inventory.
                  </p>
                </div>
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {repositories.length} available
                </span>
              </div>

              <div className="space-y-3">
                {isLoadingRepositories ? (
                  <div className="flex items-center gap-2 rounded-xl border border-dashed border-zinc-200 px-4 py-6 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                    <SpinnerIcon className="h-4 w-4 animate-spin" />
                    Loading stored repositories...
                  </div>
                ) : repositoriesError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-950 dark:bg-red-950/40 dark:text-red-300">
                    {repositoriesError}
                  </div>
                ) : repositories.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-zinc-200 px-4 py-6 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                    No pulled repositories yet. Pull one once, then it will stay available here.
                  </div>
                ) : (
                  repositories.map((repository) => (
                    <Link
                      key={repository.id}
                      href={`/repo/${repository.owner}/${repository.name}`}
                      className="block rounded-xl border border-zinc-200 p-4 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/60"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-zinc-950 dark:text-white">
                            {repository.fullName}
                          </p>
                          <p className="mt-1 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
                            {repository.description || "Stored repository ready to browse."}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                          Open
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                        <span>{repository.hydratedFileCount} stored files</span>
                        <span>{repository.fileCount} indexed nodes</span>
                        <span>Updated {formatUpdatedAt(repository.updatedAt)}</span>
                        {repository.language ? <span>{repository.language}</span> : null}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </section>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                <TreeIcon className="h-5 w-5 text-zinc-700 dark:text-zinc-200" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">File Explorer</h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Browse the stored tree without reaching back to GitHub.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                <CodeIcon className="h-5 w-5 text-zinc-700 dark:text-zinc-200" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">Stored Viewer</h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Open file contents from S3-backed storage through the existing viewer.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                <BotIcon className="h-5 w-5 text-zinc-700 dark:text-zinc-200" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">AI Assistant</h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Ask questions about the repository once it is opened.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
