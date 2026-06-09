/**
 * MegProfil — PlayerHQ "Meg" (/portal/meg), portet FRA fersk Claude Design-fasit:
 *   public/design-handover/AK Golf HQ Design System/playerhq-app/ph-screens.jsx (MeScreen)
 *
 * Vertikal stack (mobil, topp → bunn):
 *   1. Header:           avatar (64px) + eyebrow (HCP · klubb · gruppe) + navn + e-post
 *   2. Abonnement-kort:  forest-gradient, GRATIS/300kr-pill, plan-tekst, to handlinger
 *   3. Stat-strip:       3 KPI (Runder '25 / Best / Snitt)
 *   4. KONTO:            7 lenkerader (profil, abonnement, innstillinger, helse,
 *                        utstyr, dokumenter, hjelp) med ikon + meta + chevron
 *   5. Logg ut:          fullbredde ghost-knapp (destructive), server action
 *
 * Presentasjonell, props-drevet. DS-tokens + athletic + lucide. Ingen hardkodet hex.
 */

import Link from "next/link";
import {
  Pencil,
  CreditCard,
  Settings,
  HeartPulse,
  Briefcase,
  FileText,
  LifeBuoy,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { AthleticAvatar } from "@/components/athletic/avatar";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import { KpiCard } from "@/components/athletic/kpi";
import { logout } from "@/lib/auth/logout";

export type MegProfilData = {
  navn: string;
  initialer: string;
  avatarUrl?: string | null;
  /** Eyebrow over navnet, f.eks. "HCP 4,2 · OSLO GK · WANG TOPPIDRETT". */
  eyebrow: string;
  /** E-post under navnet (mono, muted). */
  epost: string;
  kpi: { runder: string; beste: string; snitt: string };
  /** App-abonnement: gratis via coaching, eller betalende. */
  abonnement: { gratis: boolean; planNavn: string | null };
};

const KONTO = [
  { ikon: Pencil, tittel: "Rediger profil", meta: "Navn, bilde, klubb, HCP", href: "/portal/meg/profil" },
  { ikon: CreditCard, tittel: "Abonnement", meta: "App-tilgang og betaling", href: "/portal/meg/abonnement" },
  { ikon: Settings, tittel: "Innstillinger", meta: "Varsler, integrasjoner, sikkerhet", href: "/portal/meg/innstillinger" },
  { ikon: HeartPulse, tittel: "Helse", meta: "Hvilepuls, søvn, readiness", href: "/portal/meg/helse" },
  { ikon: Briefcase, tittel: "Utstyrsbag", meta: "Køller, ball, loft-justering", href: "/portal/meg/utstyrsbag" },
  { ikon: FileText, tittel: "Dokumenter", meta: "Avtaler, samtykker, fakturaer", href: "/portal/meg/dokumenter" },
  { ikon: LifeBuoy, tittel: "Hjelp", meta: "FAQ, support, kontakt", href: "/portal/meg/help" },
] as const;

function Abonnementskort({ a }: { a: MegProfilData["abonnement"] }) {
  return (
    <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-primary to-emerald-900 p-5 text-white">
      <div aria-hidden className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent opacity-15 blur-sm" />
      <div className="relative flex items-center justify-between">
        <AthleticEyebrow tone="lime">App-abonnement</AthleticEyebrow>
        <span className="rounded-full bg-accent px-2.5 py-1 font-mono text-[9px] font-extrabold uppercase tracking-[0.1em] text-accent-foreground">
          {a.gratis ? "Gratis" : "300 kr/mnd"}
        </span>
      </div>
      <div className="relative mt-3 font-display text-[22px] font-bold tracking-[-0.015em]">
        {a.gratis ? "Inkludert i coaching" : "PlayerHQ Pro"}
      </div>
      <p className="relative mt-1.5 font-mono text-[11px] leading-relaxed text-white/85">
        {a.gratis ? (
          <>
            Du har{" "}
            <b className="text-accent">{a.planNavn ?? "coaching-pakke"}</b> hos AK Golf — app-tilgang
            følger med så lenge coaching-pakken er aktiv. Ingen separat app-faktura.
          </>
        ) : (
          <>Full tilgang til PlayerHQ. Faktureres månedlig — du kan si opp når som helst.</>
        )}
      </p>
      <div className="relative mt-4 flex gap-2.5">
        <Link
          href="/portal/meg/abonnement"
          className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-5 font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-primary transition-opacity hover:opacity-90"
        >
          {a.gratis ? "Se coaching-pakken" : "Administrer"}
        </Link>
        <Link
          href="/portal/meg/dokumenter"
          className="inline-flex h-11 items-center justify-center rounded-full border border-white/30 px-5 font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-white/10"
        >
          Fakturaer
        </Link>
      </div>
    </div>
  );
}

export function MegProfil({ data }: { data: MegProfilData }) {
  return (
    <div className="mx-auto w-full max-w-[480px] space-y-5 px-6 pb-8 pt-8 md:hidden">
      {/* 1. Header */}
      <header className="flex items-center gap-4">
        <AthleticAvatar
          src={data.avatarUrl}
          initials={data.initialer}
          borderColor="card"
          className="h-16 w-16 border-0 text-xl shadow-none"
        />
        <div className="min-w-0">
          <AthleticEyebrow>{data.eyebrow}</AthleticEyebrow>
          <h1 className="mt-1 truncate font-display text-2xl font-bold leading-tight tracking-[-0.015em] text-foreground">
            {data.navn}
          </h1>
          <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">{data.epost}</p>
        </div>
      </header>

      {/* 2. Abonnement */}
      <Abonnementskort a={data.abonnement} />

      {/* 3. Stat-strip */}
      <div className="grid grid-cols-3 gap-2">
        <KpiCard label="Runder '25" value={data.kpi.runder} />
        <KpiCard label="Best" value={data.kpi.beste} />
        <KpiCard label="Snitt" value={data.kpi.snitt} />
      </div>

      {/* 4. KONTO */}
      <section className="space-y-2">
        <AthleticEyebrow>Konto</AthleticEyebrow>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {KONTO.map((k) => {
            const Ikon = k.ikon;
            return (
              <Link
                key={k.tittel}
                href={k.href}
                className="flex items-center gap-3 border-b border-border px-4 py-3.5 last:border-b-0 transition-colors hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                  <Ikon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold tracking-[-0.005em] text-foreground">
                    {k.tittel}
                  </span>
                  <span className="mt-0.5 block truncate font-mono text-[10px] text-muted-foreground">
                    {k.meta}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60" strokeWidth={2} aria-hidden />
              </Link>
            );
          })}
        </div>
      </section>

      {/* 5. Logg ut */}
      <form action={logout} className="pt-1">
        <button
          type="submit"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-border font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-destructive transition-colors hover:bg-destructive/5"
        >
          <LogOut className="h-4 w-4" strokeWidth={2} aria-hidden />
          Logg ut
        </button>
      </form>
    </div>
  );
}

function KontoListe() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {KONTO.map((k) => {
        const Ikon = k.ikon;
        return (
          <Link key={k.tittel} href={k.href} className="flex items-center gap-3 border-b border-border px-4 py-3.5 last:border-b-0 transition-colors hover:bg-secondary/40">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
              <Ikon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold tracking-[-0.005em] text-foreground">{k.tittel}</span>
              <span className="mt-0.5 block truncate font-mono text-[10px] text-muted-foreground">{k.meta}</span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60" strokeWidth={2} aria-hidden />
          </Link>
        );
      })}
    </div>
  );
}

// ── Desktop-layout (ph-screens.jsx · MeScreen desktop): header + 2-kol grid ──
export function MegProfilDesktop({ data }: { data: MegProfilData }) {
  return (
    <div className="mx-auto hidden w-full max-w-[1000px] px-8 pb-8 pt-5 md:block">
      <header className="flex items-center gap-4">
        <AthleticAvatar src={data.avatarUrl} initials={data.initialer} borderColor="card" className="h-16 w-16 border-0 text-xl shadow-none" />
        <div className="min-w-0">
          <AthleticEyebrow>{data.eyebrow}</AthleticEyebrow>
          <h1 className="mt-1 truncate font-display text-3xl font-bold leading-tight tracking-[-0.015em] text-foreground">{data.navn}</h1>
          <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">{data.epost}</p>
        </div>
      </header>

      <div className="mt-6 grid grid-cols-[1fr_1fr] items-start gap-6">
        {/* Venstre: sesong + konto + logg ut */}
        <div className="space-y-6">
          <section className="space-y-2">
            <AthleticEyebrow>SESONG 2025</AthleticEyebrow>
            <div className="grid grid-cols-3 gap-2">
              <KpiCard label="Runder '25" value={data.kpi.runder} />
              <KpiCard label="Best" value={data.kpi.beste} />
              <KpiCard label="Snitt" value={data.kpi.snitt} />
            </div>
          </section>
          <section className="space-y-2">
            <AthleticEyebrow>KONTO</AthleticEyebrow>
            <KontoListe />
          </section>
          <form action={logout} className="max-w-[260px]">
            <button type="submit" className="inline-flex h-11 items-center gap-2 rounded-full px-4 font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-destructive transition-colors hover:bg-destructive/5">
              <LogOut className="h-4 w-4" strokeWidth={2} aria-hidden />
              Logg ut
            </button>
          </form>
        </div>
        {/* Høyre: abonnement + coach */}
        <div className="space-y-6">
          <Abonnementskort a={data.abonnement} />
          <section className="rounded-xl border border-border bg-card p-4">
            <AthleticEyebrow>COACH</AthleticEyebrow>
            <div className="mt-3 flex items-center gap-3">
              <AthleticAvatar initials="AK" borderColor="card" className="h-[42px] w-[42px] border-0 shadow-none" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-foreground">Anders Kristiansen</div>
                <div className="font-mono text-[10px] text-muted-foreground">Head coach · PGA Pro</div>
              </div>
              <Link href="/portal/coach" className="inline-flex h-10 items-center rounded-full bg-primary px-4 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-primary-foreground transition-opacity hover:opacity-90">
                Melding
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
