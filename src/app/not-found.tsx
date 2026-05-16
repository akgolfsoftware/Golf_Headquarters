import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Side ikke funnet — AK Golf Academy",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-foreground px-6">
      <p className="font-mono text-8xl font-semibold text-muted-foreground/30 tabular-nums">
        404
      </p>
      <h1 className="text-2xl font-semibold tracking-tight">
        Siden ble ikke funnet
      </h1>
      <p className="text-center text-muted-foreground max-w-sm">
        Siden du leter etter eksisterer ikke, eller har blitt flyttet.
      </p>
      <Link
        href="/"
        className="mt-4 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        Tilbake til forsiden
      </Link>
    </div>
  );
}
