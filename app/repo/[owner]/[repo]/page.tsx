"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRepoStore } from "@/lib/store/repoStore";
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

function HomeIcon({ className }: { className?: string }) {
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
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
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

export default function RepoPage() {
  const params = useParams();
  const router = useRouter();
  const { repo, tree, status, error, setLoading, setRepoData, setError, reset } = useRepoStore();
  const [isLoading, setIsLoading] = useState(true);

  const owner = params.owner as string;
  const repoName = params.repo as string;

  useEffect(() => {
    async function loadRepo() {
      if (!owner || !repoName) return;

      setLoading();
      setIsLoading(true);

      try {
        const response = await fetch("/api/repo/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ repoUrl: `https://github.com/${owner}/${repoName}` }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load repository");
        }

        setRepoData(data.repo, data.tree);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load repository");
      } finally {
        setIsLoading(false);
      }
    }

    loadRepo();
  }, [owner, repoName, setLoading, setRepoData, setError]);

  const handleBack = () => {
    reset();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white border border-zinc-200 shadow-sm mb-4">
            <GithubIcon className="w-8 h-8 text-zinc-600" />
          </div>
          <div className="flex items-center justify-center gap-3 text-zinc-500">
            <SpinnerIcon className="w-5 h-5 animate-spin" />
            <span>Loading repository...</span>
          </div>
          <p className="text-sm text-zinc-400 mt-2">{owner}/{repoName}</p>
        </div>
      </div>
    );
  }

  if (error || !repo) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 border border-red-100 mb-6">
            <GithubIcon className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Repository Not Found</h1>
          <p className="text-zinc-500 mb-6">{error || "Unable to load repository"}</p>
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium transition-all shadow-sm"
          >
            <HomeIcon className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-50 bg-white border-b border-zinc-200 shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-all"
            >
              <HomeIcon className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 border border-zinc-200/50">
                <GithubIcon className="h-5 w-5 text-zinc-700" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-zinc-900 tracking-tight">
                  {repo.name}
                </h1>
                <p className="text-xs text-zinc-500">{repo.full_name}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-white border border-zinc-200 px-3.5 py-1.5 shadow-sm">
              <StarIcon className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium text-zinc-700">
                {repo.stargazers_count.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white border border-zinc-200 px-3.5 py-1.5 shadow-sm">
              <ForkIcon className="h-4 w-4 text-zinc-500" />
              <span className="text-sm font-medium text-zinc-700">
                {repo.forks_count.toLocaleString()}
              </span>
            </div>
            {repo.language && (
              <div className="rounded-full bg-zinc-900 px-3.5 py-1.5 shadow-sm">
                <span className="text-sm font-medium text-white">{repo.language}</span>
              </div>
            )}
          </div>
        </div>

        {repo.description && (
          <div className="px-4 pb-3">
            <p className="text-sm text-zinc-500 max-w-2xl">{repo.description}</p>
          </div>
        )}
      </header>

      <main className="h-[calc(100vh-120px)]">
        <div className="h-full grid grid-cols-[280px_1fr_380px] gap-0">
          <div className="bg-white border-r border-zinc-200 flex flex-col">
            <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-900">Files</h2>
              <span className="text-xs text-zinc-400">{tree?.length ?? 0} items</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {tree && <FileTree nodes={tree} />}
            </div>
          </div>

          <div className="bg-zinc-50 flex flex-col overflow-hidden">
            <FileViewer />
          </div>

          <div className="bg-white border-l border-zinc-200 flex flex-col overflow-hidden">
            <ChatPanel />
          </div>
        </div>
      </main>
    </div>
  );
}
