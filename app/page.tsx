export default function Home() {
  return (
    <section className="p-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
            Home
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
            Workspace overview
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-600">
            This home route is the starting point for the application shell. It
            gives the layout a structured landing page while additional
            repository views are added under dedicated routes.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-950">Navigation</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Use the sidebar to move between the home page and the repository
              page.
            </p>
          </article>

          <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-950">Next step</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              The repo route is ready for repository-specific data and future
              exploration features.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
