// Foreldreportal — Innstillinger. Kontaktinfo + varsler + konto.
// Mock-data i versjon 1 — kobles til Prisma i neste sprint.

import {
  Mail,
  Phone,
  Bell,
  Lock,
  LogOut,
  User,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { ForelderHero } from "@/components/forelder/forelder-hero";

export const dynamic = "force-dynamic";

export default async function ForelderInnstillinger() {
  const user = await requirePortalUser({ allow: ["PARENT"] });

  const initials =
    user.name
      .split(" ")
      .map((w: string) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "??";

  return (
    <div className="space-y-8">
      <ForelderHero
        eyebrow="Foreldreportal · Innstillinger"
        titleLead="Konto og"
        titleItalic="varsler"
        sub="Kontaktinfo, varslingsvalg og kontosikkerhet."
        avatarInitials={initials}
        avatarUrl={user.avatarUrl}
      />

      {/* Kontaktinfo */}
      <section
        aria-labelledby="kontakt-overskrift"
        className="rounded-xl border border-border bg-card"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2
            id="kontakt-overskrift"
            className="inline-flex items-center gap-2 font-display text-base font-semibold tracking-tight"
          >
            <User
              className="h-4 w-4 text-muted-foreground"
              strokeWidth={1.5}
              aria-hidden
            />
            Kontaktinformasjon
          </h2>
          <button
            type="button"
            className="font-mono text-[10px] uppercase tracking-[0.10em] text-primary hover:underline"
          >
            Rediger
          </button>
        </div>
        <dl className="divide-y divide-border">
          <div className="flex items-center justify-between px-6 py-4 text-sm">
            <dt className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              <User className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
              Navn
            </dt>
            <dd className="font-medium">{user.name}</dd>
          </div>
          <div className="flex items-center justify-between px-6 py-4 text-sm">
            <dt className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              <Mail className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
              E-post
            </dt>
            <dd className="font-medium">{user.email}</dd>
          </div>
          <div className="flex items-center justify-between px-6 py-4 text-sm">
            <dt className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              <Phone className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
              Telefon
            </dt>
            <dd className="text-muted-foreground">Ikke registrert</dd>
          </div>
        </dl>
      </section>

      {/* Varsler */}
      <section
        aria-labelledby="varsler-overskrift"
        className="rounded-xl border border-border bg-card"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2
            id="varsler-overskrift"
            className="inline-flex items-center gap-2 font-display text-base font-semibold tracking-tight"
          >
            <Bell
              className="h-4 w-4 text-muted-foreground"
              strokeWidth={1.5}
              aria-hidden
            />
            Varsler
          </h2>
          <a
            href="/forelder/varsler"
            className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.10em] text-primary hover:underline"
          >
            Detaljer
            <ChevronRight className="h-3 w-3" strokeWidth={1.5} aria-hidden />
          </a>
        </div>
        <ul className="divide-y divide-border">
          {[
            { label: "Ny okt planlagt", sub: "Naar coach legger inn okt", aktiv: true },
            { label: "Okt fullfort", sub: "Naar barnet logger fullfort okt", aktiv: true },
            { label: "Ny faktura", sub: "Naar betaling forfaller eller mislykkes", aktiv: true },
            { label: "Coach-melding", sub: "Naar coach sender direktemelding", aktiv: false },
          ].map((v) => (
            <li
              key={v.label}
              className="flex items-center justify-between gap-4 px-6 py-4 text-sm"
            >
              <div>
                <div className="font-medium">{v.label}</div>
                <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  {v.sub}
                </div>
              </div>
              <span
                className={`rounded-full px-3 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${
                  v.aktiv
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {v.aktiv ? "Pa" : "Av"}
              </span>
            </li>
          ))}
        </ul>
        <div className="border-t border-border px-6 py-3">
          <p className="text-xs text-muted-foreground">
            Push-varsler kommer i Spor 1. Inntil da sendes varsler til e-post.
          </p>
        </div>
      </section>

      {/* Konto-seksjon */}
      <section
        aria-labelledby="konto-overskrift"
        className="rounded-xl border border-border bg-card"
      >
        <h2
          id="konto-overskrift"
          className="border-b border-border px-6 py-4 font-display text-base font-semibold tracking-tight"
        >
          Konto
        </h2>
        <ul className="divide-y divide-border">
          <li>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-6 py-4 text-sm transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="inline-flex items-center gap-3">
                <Lock
                  className="h-4 w-4 text-muted-foreground"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <span>
                  <span className="block font-medium">Endre passord</span>
                  <span className="block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    Via Supabase Auth
                  </span>
                </span>
              </span>
              <ChevronRight
                className="h-4 w-4 text-muted-foreground"
                strokeWidth={1.5}
                aria-hidden
              />
            </button>
          </li>
          <li>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-6 py-4 text-sm transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="inline-flex items-center gap-3">
                <ShieldCheck
                  className="h-4 w-4 text-muted-foreground"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <span>
                  <span className="block font-medium">
                    To-faktor-autentisering
                  </span>
                  <span className="block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    Ikke aktivert
                  </span>
                </span>
              </span>
              <ChevronRight
                className="h-4 w-4 text-muted-foreground"
                strokeWidth={1.5}
                aria-hidden
              />
            </button>
          </li>
          <li>
            <a
              href="/auth/login"
              className="flex w-full items-center justify-between gap-4 px-6 py-4 text-sm text-destructive transition-colors hover:bg-destructive/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="inline-flex items-center gap-3">
                <LogOut className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                <span className="font-medium">Logg ut</span>
              </span>
              <ChevronRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
