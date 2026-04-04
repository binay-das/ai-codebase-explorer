export type FileNode = {
    name: string;
    path: string;
    type: "file" | "dir";
    children?: FileNode[];
};

export type RawTreeNode = {
    path: string;
    type: string;
};

export function normalizeTree(flatTree: RawTreeNode[]): FileNode[] {
    const root: FileNode[] = [];
    const nodeMap = new Map<string, FileNode>();

    const getOrCreateDir = (dirPath: string): FileNode => {
        if (nodeMap.has(dirPath)) {
            return nodeMap.get(dirPath)!;
        }

        const parts = dirPath.split("/");
        const name = parts[parts.length - 1];

        const dirNode: FileNode = {
            name,
            path: dirPath,
            type: "dir",
            children: [],
        };

        nodeMap.set(dirPath, dirNode);

        const parentPath = parts.slice(0, -1).join("/");
        if (parentPath) {
            const parentNode = getOrCreateDir(parentPath);
            parentNode.children!.push(dirNode);
        } else {
            root.push(dirNode);
        }

        return dirNode;
    };

    for (const item of flatTree) {
        if (item.type !== "blob" && item.type !== "tree") continue;

        if (item.type === "tree") {
            getOrCreateDir(item.path);
            continue;
        }

        // It's a blob (file)
        const lastSlashIdx = item.path.lastIndexOf("/");
        const name = item.path.substring(lastSlashIdx + 1);

        const fileNode: FileNode = {
            name,
            path: item.path,
            type: "file",
        };
        nodeMap.set(item.path, fileNode);

        if (lastSlashIdx === -1) {
            root.push(fileNode);
        } else {
            const parentPath = item.path.substring(0, lastSlashIdx);
            const parentNode = getOrCreateDir(parentPath);
            parentNode.children!.push(fileNode);
        }
    }

    return root;
}
