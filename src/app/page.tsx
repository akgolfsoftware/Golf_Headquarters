// Foundation-placeholder med v2-tokens.
// Booking, portal, CoachHQ etc. bygges i andre prosjekter.

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <div className="max-w-2xl rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-4 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Foundation · v0.2.0
        </div>
        <h1 className="font-display text-5xl leading-[1.05] tracking-tight">
          AK Golf <em className="text-primary">HQ</em>
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Designsystem v2 lastet. Booking, coaching og spillerutvikling bygges i
          påfølgende faser.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <span className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Primary
          </span>
          <span className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground">
            Accent
          </span>
          <span className="rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground">
            Secondary
          </span>
        </div>
      </div>
    </main>
  );
}