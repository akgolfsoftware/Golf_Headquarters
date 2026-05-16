"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-foreground px-6">
      <p className="font-mono text-8xl font-semibold text-muted-foreground/30 tabular-nums">
        500
      </p>
      <h1 className="text-2xl font-semibold tracking-tight">Noe gikk galt</h1>
      <p className="text-center text-sm text-muted-foreground max-w-sm">
        {error.message ?? "En uventet feil oppstod. Vi ser på det."}
      </p>
      <button
        onClick={reset}
        className="mt-4 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        Prøv igjen
      </button>
    </div>
  );
}
