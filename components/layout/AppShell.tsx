import type { ReactNode } from "react";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

type AppShellProps = {
  children: ReactNode;
};

const navigationItems = [
  { label: "Home", href: "/" },
  { label: "Repository", href: "/repo" },
];

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen bg-zinc-50/50 text-zinc-900">
      <Sidebar appName="Codebase Explorer" navigationItems={navigationItems} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header title="Codebase Explorer" />
        <main className="min-h-0 flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
