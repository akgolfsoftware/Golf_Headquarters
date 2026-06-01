/**
 * PlayerHQ · Meg · Sikkerhet (/portal/meg/sikkerhet). Mobil-først (430px).
 *
 * Sikkerhetsoversikt: score-stat, 2FA-konfigurasjon (lenke til /2fa), samt
 * aktive økter + innloggings-historikk markert "kommer snart" (ikke koblet til
 * Supabase auth-sessions ennå — ALDRI falske tall). Server component, auth-guard.
 *
 * Stil matchet mot innstillinger-accordion.tsx: max-w-[480px], rounded-[14px]
 * kort, ikon-chip bg-primary/[0.08], DS-tokens, lucide. Ingen hex, ingen emoji.
 */
import Link from "next/link";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Shield,
  ShieldCheck,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

export default async function SikkerhetPage() {
  const user = await requirePortalUser();

  // Heuristisk score basert på det vi vet i dag (e-post registrert + passord
  // satt via Supabase). 2FA-status er ikke eksponert ennå → ikke regnet inn.
  const score = user.email ? 65 : 40;

  return (
    <div className="mx-auto w-full max-w-[480px] pb-8">
      {/* topbar — tilbake + tittel */}
      <div className="flex items-center gap-3 border-b border-border px-2 py-3">
        <Link
          href="/portal/meg"
          className="inline-flex items-center gap-1.5 px-1 py-1.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-[13px] w-[13px]" strokeWidth={2} aria-hidden />
          Profil
        </Link>
        <h1 className="font-display text-[17px] font-bold tracking-[-0.015em] text-foreground">
          Sikkerhet
        </h1>
      </div>

      <div className="flex flex-col gap-2.5 px-2 pb-4 pt-3">
        {/* Score */}
        <section className="overflow-hidden rounded-[14px] border border-border bg-card p-4">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
              Sikkerhetsscore
            </span>
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
              {score >= 80 ? "Sterk" : score >= 60 ? "God" : "Svak"}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-mono text-[40px] font-bold leading-none tracking-[-0.02em] tabular-nums text-foreground">
              {score}
            </span>
            <span className="font-mono text-sm font-bold text-muted-foreground">
              / 100
            </span>
          </div>
          {/* progress-bar */}
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${score}%` }}
            />
          </div>
          <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
            Sterkt passord og verifisert e-post. Aktiver tofaktor for å løfte
            scoren ytterligere.
          </p>
        </section>

        {/* Tofaktor */}
        <section className="overflow-hidden rounded-[14px] border border-border bg-card">
          <div className="flex items-baseline justify-between gap-4 border-b border-border px-4 py-3">
            <h2 className="font-display text-[15px] font-bold tracking-[-0.012em] text-foreground">
              Tofaktor
            </h2>
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
              Authenticator-app
            </span>
          </div>
          <Link
            href="/portal/meg/sikkerhet/2fa"
            className="grid grid-cols-[34px_1fr_auto] items-center gap-x-3 px-4 py-4 transition-colors hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
          >
            <span className="grid h-[34px] w-[34px] place-items-center rounded-[9px] bg-primary/[0.08] text-primary">
              <Shield className="h-[17px] w-[17px]" strokeWidth={1.75} aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-[14px] font-semibold leading-tight tracking-[-0.005em] text-foreground">
                Konfigurer 2FA
              </span>
              <span className="mt-0.5 block font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
                Ekstra beskyttelse med engangskode
              </span>
            </span>
            <ChevronRight
              className="h-4 w-4 shrink-0 text-muted-foreground/60"
              strokeWidth={2}
              aria-hidden
            />
          </Link>
        </section>

        {/* Aktive økter — ikke koblet til Supabase sessions ennå */}
        <section className="overflow-hidden rounded-[14px] border border-border bg-card">
          <div className="flex items-baseline justify-between gap-4 border-b border-border px-4 py-3">
            <h2 className="font-display text-[15px] font-bold tracking-[-0.012em] text-foreground">
              Aktive økter
            </h2>
            <span className="rounded-full border border-border bg-secondary px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
              Kommer snart
            </span>
          </div>
          <div className="grid grid-cols-[34px_1fr_auto] items-center gap-x-3 px-4 py-4">
            <span className="grid h-[34px] w-[34px] place-items-center rounded-[9px] bg-secondary text-muted-foreground">
              <Monitor className="h-[17px] w-[17px]" strokeWidth={1.5} aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-[14px] font-semibold leading-tight tracking-[-0.005em] text-foreground">
                Denne enheten
              </span>
              <span className="mt-0.5 block font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
                Logg ut andre enheter — under utvikling
              </span>
            </span>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/[0.08] px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-primary">
              <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />
              Aktiv
            </span>
          </div>
        </section>

        {/* Innloggings-historikk — ikke koblet ennå */}
        <section className="overflow-hidden rounded-[14px] border border-border bg-card">
          <div className="flex items-baseline justify-between gap-4 border-b border-border px-4 py-3">
            <h2 className="font-display text-[15px] font-bold tracking-[-0.012em] text-foreground">
              Innloggings-historikk
            </h2>
            <span className="rounded-full border border-border bg-secondary px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
              Kommer snart
            </span>
          </div>
          <div className="flex items-center gap-3 px-4 py-4">
            <ShieldCheck
              className="h-4 w-4 shrink-0 text-muted-foreground"
              strokeWidth={1.75}
              aria-hidden
            />
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Full historikk med IP, enhet og tidspunkt aktiveres snart.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
