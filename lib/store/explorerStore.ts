import { create } from "zustand";

interface ExplorerState {
    selectedFilePath: string | null;
    setSelectedFile: (path: string) => void;
}

export const useExplorerStore = create<ExplorerState>((set) => ({
    selectedFilePath: null,
    setSelectedFile: (path) => set({ selectedFilePath: path }),
}));
