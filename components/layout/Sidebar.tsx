type SidebarProps = {
  appName: string;
  navigationItems?: ReadonlyArray<{
    label: string;
  }>;
};

export function Sidebar({
  appName,
  navigationItems = [],
}: SidebarProps) {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-zinc-200 bg-zinc-50">
      <div className="border-b border-zinc-200 px-6 py-5">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
          Application
        </p>
        <h1 className="mt-2 text-lg font-semibold text-zinc-950">{appName}</h1>
      </div>

      <nav className="flex-1 px-4 py-4" aria-label="Primary navigation">
        <ul className="space-y-1">
          {navigationItems.map((item) => (
            <li key={item.label}>
              <span className="flex rounded-lg px-3 py-2 text-sm font-medium text-zinc-600">
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
