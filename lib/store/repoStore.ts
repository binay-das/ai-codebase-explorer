import { create } from "zustand";
import { RepoInfo } from "@/lib/github/types";
import { FileNode } from "@/lib/domain/normalizeTree";

interface RepoState {
    repo: RepoInfo | null;
    tree: FileNode[] | null;
    status: "idle" | "loading" | "success" | "error";
    error: string | null;

    setLoading: () => void;
    setRepoData: (repo: RepoInfo, tree: FileNode[]) => void;
    setError: (message: string) => void;
    reset: () => void;
}

export const useRepoStore = create<RepoState>((set) => ({
    repo: null,
    tree: null,
    status: "idle",
    error: null,

    setLoading: () => set({ status: "loading", error: null }),
    setRepoData: (repo, tree) => set({ repo, tree, status: "success", error: null }),
    setError: (message) => set({ status: "error", error: message }),
    reset: () => set({ repo: null, tree: null, status: "idle", error: null })
}));
