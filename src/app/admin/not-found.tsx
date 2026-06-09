import { Compass } from "lucide-react";
import Link from "next/link";
import { AthleticHero } from "@/components/athletic/hero";

export default function AdminNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col">
      <AthleticHero eyebrow="404 · IKKE FUNNET" height="lg">
        <div className="px-6 pb-10 md:px-10">
          <Compass
            className="mb-4 h-10 w-10 text-accent"
            strokeWidth={1.5}
            aria-hidden
          />
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl">
            Siden <em className="font-normal italic text-accent">finnes ikke</em>
          </h1>
          <p className="mt-2 max-w-md text-sm text-white/80">
            Sjekk URLen eller naviger tilbake til AgencyOS-hjem.
          </p>
        </div>
      </AthleticHero>

      <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 sm:flex-row">
        <Link
          href="/admin/agencyos"
          className="font-display inline-flex items-center justify-center gap-1.5 rounded-full bg-accent px-6 py-2 text-sm font-bold tracking-[-0.005em] text-primary shadow-[0_6px_14px_rgba(209,248,67,0.25)] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Tilbake til AgencyOS
        </Link>
        <Link
          href="/admin/messages"
          className="font-display inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-card px-6 py-2 text-sm font-bold tracking-[-0.005em] text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Kontakt support
        </Link>
      </div>
    </div>
  );
}
