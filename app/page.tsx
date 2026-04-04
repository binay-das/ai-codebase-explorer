"use client";

import { githubFetch } from "@/lib/github/client";
import { parseRepoUrl } from "@/lib/github/parseRepoUrl";
import { RepoInfo } from "@/lib/github/types";
import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    console.log("URL: ", url);

    try {
      const parsed = parseRepoUrl(url);
      console.log("parseRepoUrl result:", parsed);

      const apiEndpoint = `repos/${parsed.owner}/${parsed.repo}`;
      console.log(`Fetching from: ${apiEndpoint}`);

      const repoData = await githubFetch<RepoInfo>(apiEndpoint);
      console.log("githubFetch result:", repoData);

      alert("Check console for successful test logs!");
    } catch (error) {
      console.error(" Test failed:", error);
      if (error instanceof Error) {
        alert(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="p-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
            Home
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
            Workspace overview
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-600">
            Paste a GitHub repository URL below to test the parsing and API client utilities. Open your browser console to view the detailed logs.
          </p>

          <div className="mt-6 flex gap-3">
            <input
              type="text"
              className="flex-1 rounded-md border border-zinc-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="e.g., https://github.com/facebook/react"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
              onClick={handleTest}
              disabled={loading || !url}
            >
              {loading ? "Loading..." : "Get insights"}
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-950">Navigation</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Use the sidebar to move between the home page and the repository
              page.
            </p>
          </article>

          <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-950">Next step</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              The repo route is ready for repository-specific data and future
              exploration features.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
