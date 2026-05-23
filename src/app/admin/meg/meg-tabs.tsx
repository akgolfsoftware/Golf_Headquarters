/**
 * meg-tabs.tsx — 6 tab-komponenter for /admin/meg + LoggUtAlleEnheter.
 *
 * Variant A fra Claude Design-bundle Sg2FEKvykU45c4naIgQx6w.
 */

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Eye, Plus, ChevronRight } from "lucide-react";
import { ApiKeyVisibilityRow, NotifToggleRow } from "./meg-tabs-client";

type UserShape = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  hcp: number | null;
  homeClub: string | null;
};

function Section({
  title,
  sub,
  children,
}: {
  title: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <header className="mb-4">
        <h2 className="font-display text-xl font-semibold tracking-tight">{title}</h2>
        {sub ? (
          <p className="font-mono mt-1 text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
            {sub}
          </p>
        ) : null}
      </header>
      {children}
    </section>
  );
}

function FactCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div className="font-display mt-1 text-base font-semibold">{value}</div>
    </div>
  );
}

function PlayerChip({
  name,
  hcp,
  weekDone = 5,
  weekTotal = 7,
}: {
  name: string;
  hcp: string;
  weekDone?: number;
  weekTotal?: number;
}) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-card p-3.5">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display truncate text-sm font-semibold">{name}</div>
          <div className="font-mono mt-0.5 text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
            HCP {hcp}
          </div>
        </div>
      </div>
      <div className="flex gap-1">
        {[...Array(weekTotal)].map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-sm ${i < weekDone ? "bg-primary" : "bg-border"}`}
          />
        ))}
      </div>
      <div className="font-mono text-[9.5px] uppercase tracking-[0.04em] text-muted-foreground">
        {weekDone} / {weekTotal} økter denne uka
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────── Profil ──

export function ProfilTab({ user }: { user: UserShape }) {
  const facts: [string, string][] = [
    ["Fullt navn", user.name],
    ["E-post", user.email],
    ["Telefon", user.phone ?? "Ikke registrert"],
    ["Klubb", user.homeClub ?? "Ikke registrert"],
    ["Handicap", user.hcp != null ? String(user.hcp) : "—"],
    ["Coach siden", "2018"],
  ];

  return (
    <div className="space-y-9">
      <Section title="Personalia" sub="Synlig for spillere som booker med deg">
        <div className="grid gap-3 md:grid-cols-2">
          {facts.map(([k, v]) => (
            <FactCard key={k} label={k} value={v} />
          ))}
        </div>
      </Section>

      <ProfilAktiveSpillereSection />
    </div>
  );
}

async function ProfilAktiveSpillereSection() {
  const players = await prisma.user.findMany({
    where: { role: "PLAYER", userStatus: "AKTIV" },
    select: { id: true, name: true, hcp: true },
    orderBy: { hcp: "asc" },
    take: 8,
  });

  return (
    <Section title="Aktive spillere" sub={`${players.length} av 38 — vises i din bookingside`}>
      {players.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
          Ingen aktive spillere ennå.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {players.map((p) => (
            <Link key={p.id} href={`/admin/spillere/${p.id}`} className="block">
              <PlayerChip name={p.name} hcp={p.hcp != null ? String(p.hcp) : "—"} />
            </Link>
          ))}
        </div>
      )}
    </Section>
  );
}

// ────────────────────────────────────────────────────────────── Spillere ──

export async function SpillereTab({
  totalCount,
  activeCount,
}: {
  totalCount: number;
  activeCount: number;
}) {
  const players = await prisma.user.findMany({
    where: { role: "PLAYER" },
    select: { id: true, name: true, hcp: true, userStatus: true },
    orderBy: [{ userStatus: "asc" }, { hcp: "asc" }],
    take: 12,
  });

  return (
    <Section
      title="Alle spillere"
      sub={`${totalCount} totalt · ${activeCount} aktive denne uka`}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {[
          { label: "Alle", count: totalCount, active: true },
          { label: "Aktive", count: activeCount, active: false },
          { label: "Inaktive", count: totalCount - activeCount, active: false },
        ].map((p) => (
          <button
            key={p.label}
            type="button"
            className={`font-mono inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] ${
              p.active
                ? "border-primary bg-primary text-accent"
                : "border-border bg-card text-muted-foreground"
            }`}
          >
            {p.label}
            <span className="rounded-full bg-white/20 px-1.5 py-px tabular-nums">
              {p.count}
            </span>
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {players.map((p) => (
          <Link key={p.id} href={`/admin/spillere/${p.id}`} className="block">
            <PlayerChip name={p.name} hcp={p.hcp != null ? String(p.hcp) : "—"} />
          </Link>
        ))}
      </div>
    </Section>
  );
}

// ──────────────────────────────────────────────────────────────── Stripe ──

export function StripeTab() {
  const invoices: [string, string, string, "BETALT" | "VENTER"][] = [
    ["Markus R. Pedersen", "Privattime · 60 min", "kr 1 200", "BETALT"],
    ["Sofie Lindberg", "5-pack juniorer", "kr 4 500", "BETALT"],
    ["Henrik Tønnesen", "TrackMan-økt", "kr 1 800", "VENTER"],
    ["Ada Nilsen-Bjørke", "Helgsamling", "kr 3 200", "BETALT"],
    ["Vetle Halvorsen", "Privattime · 60 min", "kr 1 200", "BETALT"],
  ];

  return (
    <Section title="Stripe-konto" sub="Payouts og fakturaer går via tilkoblet Stripe-konto">
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="grid gap-5 border-b border-border pb-5 md:grid-cols-3">
          <div>
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              STATUS
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="font-mono inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" /> AKTIV
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">
                acct_1Q8K…
              </span>
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              NESTE UTBETALING
            </div>
            <div className="font-display mt-1 text-2xl font-bold tracking-tight">
              kr 18 420,–
            </div>
            <div className="font-mono mt-0.5 text-[10px] text-muted-foreground">
              27.05.2026
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              DENNE MÅNEDEN
            </div>
            <div className="font-display mt-1 text-2xl font-bold tracking-tight">
              kr 54 280,–
            </div>
            <div className="font-mono mt-0.5 text-[10px] text-emerald-700">
              +12% vs. forrige
            </div>
          </div>
        </div>

        <div className="font-mono mb-3 mt-5 text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          SISTE 5 FAKTURAER
        </div>
        <ul className="divide-y divide-border">
          {invoices.map(([name, type, amount, status], i) => (
            <li
              key={i}
              className="grid grid-cols-[1fr_auto] items-center gap-3 py-3 md:grid-cols-[180px_1fr_100px_90px]"
            >
              <div className="font-display text-sm font-semibold">{name}</div>
              <div className="font-mono text-[11px] text-muted-foreground">{type}</div>
              <div className="font-mono text-right text-sm font-semibold">{amount}</div>
              <span
                className={`font-mono justify-self-end rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] ${
                  status === "BETALT"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {status}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

// ────────────────────────────────────────────────────────────── API-nøkler ──

export function NoklerTab() {
  const keys = [
    { name: "Trackman bridge", prefix: "ak_live_tm", created: "12 jan 2026", lastUsed: "i dag, 09:14" },
    { name: "Notion sync", prefix: "ak_live_nt", created: "03 nov 2025", lastUsed: "i går" },
    { name: "Resend e-post", prefix: "ak_live_rs", created: "22 sep 2025", lastUsed: "14 dager siden" },
    { name: "Personal CLI", prefix: "ak_live_cl", created: "08 mar 2026", lastUsed: "3 timer siden" },
  ];
  return (
    <Section
      title="API-nøkler"
      sub="Brukes av integrasjoner (TrackMan, Notion, egne dashboards)"
    >
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="font-mono grid grid-cols-[160px_1fr_100px_100px_88px] gap-3 border-b border-border pb-2 text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          <div>NAVN</div>
          <div>NØKKEL</div>
          <div>OPPRETTET</div>
          <div>SIST BRUKT</div>
          <div />
        </div>
        {keys.map((k) => (
          <ApiKeyVisibilityRow key={k.name} {...k} />
        ))}
        <div className="flex justify-end pt-3">
          <button
            type="button"
            className="font-display inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-xs font-bold text-accent"
          >
            <Plus className="h-3.5 w-3.5" /> Generer ny nøkkel
          </button>
        </div>
      </div>
    </Section>
  );
}

// ────────────────────────────────────────────────────────────── Varsler ──

export function VarslerTab() {
  const rows: { event: string; defaults: [boolean, boolean, boolean] }[] = [
    { event: "Ny booking", defaults: [true, true, false] },
    { event: "Avbestilling", defaults: [true, true, true] },
    { event: "Reschedule-forespørsel", defaults: [true, true, false] },
    { event: "Ny spillermelding", defaults: [false, true, false] },
    { event: "Stripe-payout", defaults: [true, false, false] },
    { event: "AI-generert plan klar", defaults: [false, true, false] },
    { event: "Spiller registrerer ny runde", defaults: [false, false, false] },
  ];
  return (
    <Section
      title="Notifikasjons-preferanser"
      sub="Velg hvordan du vil bli varslet per event-type"
    >
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="font-mono grid grid-cols-[1fr_80px_80px_80px] gap-3 border-b border-border pb-2 text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          <div>EVENT</div>
          <div className="text-center">E-POST</div>
          <div className="text-center">PUSH</div>
          <div className="text-center">SMS</div>
        </div>
        {rows.map((r) => (
          <NotifToggleRow key={r.event} event={r.event} defaults={r.defaults} />
        ))}
      </div>
    </Section>
  );
}

// ──────────────────────────────────────────────────────────────── Tilkoblinger ──

function IntegrationRow({
  name,
  connected,
  last,
  color,
}: {
  name: string;
  connected: boolean;
  last: string;
  color: string;
}) {
  return (
    <div className="grid grid-cols-[40px_1fr_auto_auto] items-center gap-3 border-b border-border py-3.5 last:border-b-0">
      <div
        className="flex h-9 w-9 items-center justify-center rounded-md text-sm font-bold text-white"
        style={{ background: color }}
      >
        {name[0]}
      </div>
      <div>
        <div className="font-display text-sm font-semibold">{name}</div>
        <div className="font-mono mt-0.5 text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
          {last}
        </div>
      </div>
      <span
        className={`font-mono rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] ${
          connected
            ? "bg-emerald-100 text-emerald-800"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {connected ? "Tilkoblet" : "Ikke koblet"}
      </span>
      <button
        type="button"
        className="font-display inline-flex h-8 items-center rounded-full border border-border bg-card px-3 text-xs font-semibold"
      >
        {connected ? "Konfigurer" : "Koble til"}
      </button>
    </div>
  );
}

export function TilkoblingerTab() {
  const integrations = [
    { name: "Google Calendar", connected: true, last: "Synket for 4 min siden · 47 bookinger", color: "#1A73E8" },
    { name: "Notion", connected: true, last: "Synket i dag 06:00 · Drill-bibliotek + planer", color: "#000" },
    { name: "Trackman Live", connected: true, last: "3 økter denne uka · Mulligan Studio", color: "#FF6B00" },
    { name: "Resend", connected: true, last: "14 e-poster sendt siste uke", color: "#0A0A0A" },
    { name: "Stripe", connected: true, last: "Neste payout: 27.05 · kr 18 420", color: "#635BFF" },
    { name: "Garmin Connect", connected: false, last: "Krever spiller-OAuth per spiller", color: "#007CC3" },
  ];
  return (
    <Section title="Tilkoblede tjenester" sub="Eksterne tjenester knyttet til din coach-konto">
      <div className="rounded-2xl border border-border bg-card p-5">
        {integrations.map((i) => (
          <IntegrationRow key={i.name} {...i} />
        ))}
      </div>
    </Section>
  );
}

// ──────────────────────────────────────────────────────────────── Logg ut ──

export function LoggUtAlleEnheter() {
  return (
    <div className="flex flex-col gap-3 border-t border-border pt-6 md:flex-row md:items-center md:justify-between">
      <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        SESJON: SAFARI · MAC · OSLO · IP 188.42.•••
      </div>
      <Link
        href="/api/auth/signout-all"
        className="font-display inline-flex h-10 items-center gap-1.5 self-start rounded-full border border-destructive/40 bg-card px-4 text-xs font-bold text-destructive hover:bg-destructive/10"
      >
        Logg ut alle enheter
        <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

// Eye-icon importert for typing
void Eye;
