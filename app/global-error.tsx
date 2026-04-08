"use client";

import { ErrorFallback } from "@/components/feedback/ErrorFallback";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-100 text-zinc-950">
        <ErrorFallback error={error} reset={reset} scope="global" />
      </body>
    </html>
  );
}
