"use client";

import { useEffect } from "react";

type ErrorFallbackProps = {
  error: Error & { digest?: string };
  reset?: () => void;
  scope: "route" | "global";
};

export function ErrorFallback({
  error,
  reset,
  scope,
}: ErrorFallbackProps) {
  useEffect(() => {
    console.error(`Unhandled ${scope} error`, error);
  }, [error, scope]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 px-6">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">
          {scope === "global" ? "Application Error" : "Page Error"}
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          The app hit an unexpected error. You can try again, or refresh the page
          if the problem keeps happening.
        </p>

        {error.digest && (
          <p className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-500">
            Error reference: {error.digest}
          </p>
        )}

        <div className="mt-6 flex gap-3">
          {reset && (
            <button
              type="button"
              onClick={reset}
              className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              Try again
            </button>
          )}

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Reload
          </button>
        </div>
      </div>
    </div>
  );
}
