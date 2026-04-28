"use client";

import Link from "next/link";
import { useStoredRepositories } from "@/lib/hooks/useStoredRepositories";

function FolderIcon({ className }: { className?: string }) {
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
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

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

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getLanguageColor(language: string | null): string {
  const colors: Record<string, string> = {
    TypeScript: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    JavaScript: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    Python: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    Java: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    Go: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
    Rust: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    "C++": "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
    C: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300",
    Shell: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300",
  };
  return colors[language ?? ""] ?? "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
}

export default function DashboardPage() {
  const { repositories, isLoading, error } = useStoredRepositories();

  return (
    <div className="flex h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 lg:px-8">
          <section>
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                  Repository Dashboard
                </h1>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Browse and manage your pulled repositories
                </p>
              </div>
              <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-900">
                {repositories.length} repos
              </span>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-200 py-20 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                <SpinnerIcon className="h-5 w-5 animate-spin" />
                Loading repositories...
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-950 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </div>
            ) : repositories.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-200 py-20 text-center dark:border-zinc-700">
                <FolderIcon className="mx-auto mb-4 h-12 w-12 text-zinc-300 dark:text-zinc-600" />
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  No repositories yet. Pull one from the home page to get started.
                </p>
                <Link
                  href="/"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  <GithubIcon className="h-4 w-4" />
                  Go to Home
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {repositories.map((repo) => (
                  <Link
                    key={repo.id}
                    href={`/repo/${repo.owner}/${repo.name}`}
                    className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-200 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                  >
                    <div className="p-5">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                          <GithubIcon className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                        </div>
                        {repo.language ? (
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${getLanguageColor(repo.language)}`}
                          >
                            {repo.language}
                          </span>
                        ) : null}
                      </div>

                      <h2 className="truncate text-sm font-semibold text-zinc-950 dark:text-white">
                        {repo.fullName}
                      </h2>
                      <p className="mt-1 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
                        {repo.description || "Stored repository ready to browse."}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2 border-t border-zinc-100 pt-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                        <span className="flex items-center gap-1">
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                          </svg>
                          {repo.hydratedFileCount} files
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          {formatUpdatedAt(repo.updatedAt)}
                        </span>
                      </div>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 h-1 scale-x-0 bg-zinc-900 transition-transform duration-200 group-hover:scale-x-100 dark:bg-zinc-100" />
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
