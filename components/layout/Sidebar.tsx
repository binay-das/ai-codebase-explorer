"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarProps = {
  appName: string;
  navigationItems?: ReadonlyArray<{
    label: string;
    href: string;
  }>;
  repositoryItems?: ReadonlyArray<{
    label: string;
    href: string;
    meta?: string | null;
  }>;
};

function CodeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home: HomeIcon,
  Repository: FolderIcon,
};

export function Sidebar({
  appName,
  navigationItems = [],
  repositoryItems = [],
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col bg-white dark:bg-zinc-950 border-r border-zinc-200/60 dark:border-zinc-800/80">
      <div className="px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-800">
            <CodeIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-zinc-400">
              Powered by AI
            </p>
            <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {appName}
            </h1>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2" aria-label="Primary navigation">
        <div className="mb-2 px-2">
          <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-zinc-400">
            Navigation
          </p>
        </div>
        <ul className="space-y-0.5">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = iconMap[item.label] || HomeIcon;

            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={[
                    "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-zinc-900 text-white shadow-sm dark:bg-zinc-800"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100",
                  ].join(" ")}
                >
                  <Icon
                    className={[
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive ? "text-white/80" : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300",
                    ].join(" ")}
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mb-2 mt-6 px-2">
          <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-zinc-400">
            Pulled Repositories
          </p>
        </div>
        {repositoryItems.length > 0 ? (
          <ul className="space-y-1">
            {repositoryItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={[
                      "block rounded-lg px-3 py-2 transition-all duration-150",
                      isActive
                        ? "bg-zinc-900 text-white shadow-sm dark:bg-zinc-800"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100",
                    ].join(" ")}
                  >
                    <p className="truncate text-sm font-medium">{item.label}</p>
                    {item.meta ? (
                      <p
                        className={[
                          "truncate text-xs",
                          isActive ? "text-white/70" : "text-zinc-400",
                        ].join(" ")}
                      >
                        {item.meta}
                      </p>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="px-3 text-xs text-zinc-400">
            No pulled repositories yet.
          </p>
        )}
      </nav>

      <div className="border-t border-zinc-100 dark:border-zinc-800/80 px-5 py-4">
        <p className="text-[10px] text-zinc-400">
          Built with Next.js & AI
        </p>
      </div>
    </aside>
  );
}
