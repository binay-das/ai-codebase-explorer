"use client";

import { useEffect, useState } from "react";

export type StoredRepositorySummary = {
  id: string;
  owner: string;
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  updatedAt: string;
  fileCount: number;
  hydratedFileCount: number;
};

export function useStoredRepositories() {
  const [repositories, setRepositories] = useState<StoredRepositorySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRepositories() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/repo/stored");
        const data = (await response.json()) as {
          repositories?: StoredRepositorySummary[];
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error || "Failed to load stored repositories");
        }

        if (!cancelled) {
          setRepositories(data.repositories ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load stored repositories"
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadRepositories();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    repositories,
    isLoading,
    error,
  };
}
