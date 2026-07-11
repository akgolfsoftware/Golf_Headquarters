import { Compass } from "lucide-react";
import Link from "next/link";

export default function PortalNotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col justify-center gap-4 px-6 py-16">
      <Compass className="h-10 w-10 text-primary" strokeWidth={1.5} aria-hidden />
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">404 · Ikke funnet</span>
      <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
        Siden <em className="font-normal italic text-primary">finnes ikke</em>
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Sjekk URLen eller gå tilbake til PlayerHQ-hjem.
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Link href="/portal" className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 font-mono text-[12px] font-bold uppercase tracking-[0.06em] text-primary-foreground transition-opacity hover:opacity-90">
          Tilbake til hjem
        </Link>
        <Link href="/auth/login" className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-card px-5 font-mono text-[12px] font-bold uppercase tracking-[0.06em] text-muted-foreground transition-colors hover:text-foreground">
          Logg inn på nytt
        </Link>
      </div>
    </div>
  );
}
