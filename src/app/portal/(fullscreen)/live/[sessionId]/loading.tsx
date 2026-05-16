export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="space-y-4 text-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-border border-t-primary mx-auto" />
        <p className="font-mono text-sm text-muted-foreground">Laster økt…</p>
      </div>
    </div>
  );
}
