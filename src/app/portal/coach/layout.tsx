export default function CoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Coach
        </span>
        <h1 className="mt-2 font-display text-3xl font-semibold italic leading-tight tracking-tight">
          <em className="font-normal text-primary md:italic">Min</em> coach
        </h1>
      </header>

      <div>{children}</div>
    </div>
  );
}
