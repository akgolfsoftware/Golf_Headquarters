export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-foreground">
      <div className="space-y-4 text-center">
        <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-background/20 border-t-accent" />
        <p className="font-mono text-sm text-background/65">Laster økt…</p>
      </div>
    </div>
  );
}
