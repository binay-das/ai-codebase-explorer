import { create } from "zustand";

interface ExplorerState {
    selectedFilePath: string | null;
    highlightedSnippet: string | null;
    setSelectedFile: (path: string, snippet?: string | null) => void;
}

export const useExplorerStore = create<ExplorerState>((set) => ({
    selectedFilePath: null,
    highlightedSnippet: null,
    setSelectedFile: (path, snippet = null) =>
        set({ selectedFilePath: path, highlightedSnippet: snippet }),
}));
