type HeaderProps = {
  title: string;
};

export function Header({ title }: HeaderProps) {
  return (
    <header className="border-b border-zinc-200 bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-zinc-950">{title}</h2>
      </div>
    </header>
  );
}
