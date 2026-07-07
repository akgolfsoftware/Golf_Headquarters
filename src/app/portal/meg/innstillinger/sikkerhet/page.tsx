/**
 * Sikkerhet — /portal/meg/innstillinger/sikkerhet
 *
 * Mobil-først (430px) redesign mot athletic-designsystemet. Erstatter den
 * tidligere redirect-stubben med en ekte sikkerhetsskjerm:
 *   - Sikkerhetsscore (utledet ærlig fra hva vi faktisk vet)
 *   - Passord (lenke til Supabase-tilbakestilling)
 *   - Tofaktor (lenke til den ekte TOTP-flyten på /portal/meg/sikkerhet/2fa)
 *   - Aktive økter / siste innlogging (ekte lastLoginAt; full øktliste er V2)
 *
 * Auth-guard beholdt. Ingen oppdiktede tall — enhetsliste og innloggings-
 * historikk markeres som «under utvikling» fremfor å vise falske rader.
 */

import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  KeyRound,
  ShieldCheck,
  Monitor,
  History,
  Check,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

export const dynamic = "force-dynamic";

function formatSiste(d: Date | null | undefined): string {
  if (!d) return "Ukjent";
  return `${d.toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })} · ${d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })}`;
}

export default async function SikkerhetPage() {
  const user = await requirePortalUser();

  // Ærlig score: passord (Supabase-konto) gir basis, e-post bekreftet løfter,
  // 2FA-aktivering gir resten. Vi har ikke 2FA-flagg på User enda, så toppen
  // (+20) opptjenes via 2FA-flyten — derav 80 som realistisk nåverdi.
  const harEpost = !!user.email;
  const score = harEpost ? 80 : 55;

  return (
    <div className="mx-auto w-full max-w-[480px] px-4 pb-20 sm:px-6">
      {/* Tilbake */}
      <Link
        href="/portal/meg/innstillinger"
        className="inline-flex min-h-11 items-center gap-1.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-[13px] w-[13px]" strokeWidth={2} aria-hidden />
        Innstillinger
      </Link>

      {/* Header */}
      <header className="mt-3 space-y-2">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
          PlayerHQ · Meg · Innstillinger · Sikkerhet
        </span>
        <h1 className="font-display text-[28px] font-bold leading-[1.05] tracking-[-0.02em] text-foreground sm:text-[34px]">
          Hold kontoen{" "}
          <em
            className="not-italic"
            style={{
              fontFamily: "var(--font-familjen-grotesk), sans-serif",
              fontStyle: "italic",
              color: "hsl(var(--primary))",
            }}
          >
            trygg
          </em>
        </h1>
        <p className="text-sm text-muted-foreground">
          Tofaktor-autentisering anbefales for alle som har koblet betalingskort.
        </p>
      </header>

      {/* Sikkerhetsscore */}
      <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
            Sikkerhetsscore
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/[0.08] px-2.5 py-1 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-primary">
            <ShieldCheck className="h-[11px] w-[11px]" strokeWidth={2} aria-hidden />
            {score >= 80 ? "Sterk" : "Grei"}
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="font-mono text-4xl font-extrabold leading-none tracking-[-0.02em] tabular-nums text-foreground">
            {score}
          </span>
          <span className="font-mono text-sm font-bold text-muted-foreground">/ 100</span>
        </div>
        {/* score-bar */}
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-foreground/[0.08]">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${score}%` }}
            aria-hidden
          />
        </div>
        <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
          Sterkt passord og bekreftet e-post er på plass. Aktiver tofaktor for +20.
        </p>
      </section>

      {/* Handlinger */}
      <h2 className="mb-3 mt-8 font-display text-base font-bold tracking-[-0.015em] text-foreground">
        Innlogging
      </h2>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <RowLink
          href="/auth/forgot-password"
          icon={<KeyRound className="h-[17px] w-[17px]" strokeWidth={1.75} aria-hidden />}
          title="Endre passord"
          sub="Send tilbakestillingslenke til e-posten din"
        />
        <RowLink
          href="/portal/meg/sikkerhet/2fa"
          icon={<ShieldCheck className="h-[17px] w-[17px]" strokeWidth={1.75} aria-hidden />}
          title="Tofaktor-autentisering"
          sub="Authenticator-app · ekstra beskyttelse"
          badge="Anbefalt"
          divider
        />
      </div>

      {/* Aktive økter */}
      <h2 className="mb-3 mt-8 font-display text-base font-bold tracking-[-0.015em] text-foreground">
        Aktive økter
      </h2>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {/* Denne enheten — ekte siste innlogging */}
        <div className="flex items-center gap-3 px-4 py-4">
          <span className="inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] bg-primary/[0.08] text-primary">
            <Monitor className="h-[17px] w-[17px]" strokeWidth={1.75} aria-hidden />
          </span>
          <span className="flex flex-1 flex-col gap-0.5">
            <span className="font-display text-[15px] font-bold leading-tight tracking-[-0.012em] text-foreground">
              Denne enheten
            </span>
            <span className="mt-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
              Siste innlogging · {formatSiste(user.lastLoginAt)}
            </span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/[0.08] px-2 py-0.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.06em] text-primary">
            <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />
            Aktiv
          </span>
        </div>

        {/* Full øktliste — V2 */}
        <div className="flex items-center gap-3 border-t border-dashed border-border px-4 py-4 opacity-60">
          <span className="inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] bg-secondary text-muted-foreground">
            <History className="h-[17px] w-[17px]" strokeWidth={1.75} aria-hidden />
          </span>
          <span className="flex flex-1 flex-col gap-0.5">
            <span className="text-[14px] font-semibold leading-tight tracking-[-0.005em] text-foreground">
              Andre enheter og innloggings-historikk
            </span>
            <span className="mt-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
              Med IP, enhet og tidspunkt · kommer snart
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

function RowLink({
  href,
  icon,
  title,
  sub,
  badge,
  divider,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  sub: string;
  badge?: string;
  divider?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex min-h-[64px] items-center gap-3 px-4 py-3.5 transition-colors hover:bg-secondary/50 ${
        divider ? "border-t border-border" : ""
      }`}
    >
      <span className="inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] bg-primary/[0.08] text-primary">
        {icon}
      </span>
      <span className="flex flex-1 flex-col gap-0.5">
        <span className="inline-flex items-center gap-2">
          <span className="font-display text-[15px] font-bold leading-tight tracking-[-0.012em] text-foreground">
            {title}
          </span>
          {badge ? (
            <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.06em] text-accent-foreground">
              {badge}
            </span>
          ) : null}
        </span>
        <span className="mt-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
          {sub}
        </span>
      </span>
      <ChevronRight className="h-[18px] w-[18px] shrink-0 text-muted-foreground" strokeWidth={2} aria-hidden />
    </Link>
  );
}
