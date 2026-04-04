export default function RepoPage() {
  return (
    <section className="p-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
            Repo
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
            Repository view
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-600">
            This route is reserved for repository-level information and serves
            as the second primary destination in the base routing structure.
          </p>
        </div>

        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6">
          <h2 className="text-lg font-semibold text-zinc-950">
            Placeholder content
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Add repository summaries, file insights, or analysis panels here as
            the feature set grows.
          </p>
        </div>
      </div>
    </section>
  );
}
