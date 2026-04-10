import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

type AppShellProps = {
  children: ReactNode;
};

const navigationItems = [
  { label: "Home", href: "/" },
];

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isRepoPage = pathname?.startsWith("/repo/");

  return (
    <div className="flex h-screen bg-zinc-50/50 text-zinc-900">
      <Sidebar appName="Codebase Explorer" navigationItems={navigationItems} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {!isRepoPage && <Header title="Codebase Explorer" />}
        <main className="min-h-0 flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
