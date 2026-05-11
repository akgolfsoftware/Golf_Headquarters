/**
 * PILOT — Settings · API + integrasjoner
 * Bygd direkte fra wireframe/design-files-v2/screens/14-settings-api.html
 * URL: /settings-api-demo
 *
 * Én produksjonsskjerm: 3 API-nøkler, 6 integrasjoner, 2 webhooks.
 */

import { Plus, Copy, MoreHorizontal } from "lucide-react";

type IntegrationStatus = "on" | "off";

interface Integration {
  id: string;
  name: string;
  desc: string;
  logo: string;
  logoBg: string;
  status: IntegrationStatus;
  statusLabel: string;
  rows?: { l: string; v: string }[];
  body?: string;
  footMeta: string;
  cta: string;
  ctaPrimary?: boolean;
}

const INTEGRATIONS: Integration[] = [
  {
    id: "trackman",
    name: "Trackman 4",
    desc: "Launch monitor · simulator",
    logo: "TM",
    logoBg: "#0066FF",
    status: "on",
    statusLabel: "Tilkoblet",
    rows: [
      { l: "Konto", v: "anders@trackman.com" },
      { l: "Siste sync", v: "9 min siden" },
      { l: "Sesjoner i mai", v: "38" },
    ],
    footMeta: "v3.2.1 · OAuth",
    cta: "Innstillinger",
  },
  {
    id: "flightscope",
    name: "FlightScope Mevo+",
    desc: "Bærbar launch monitor",
    logo: "FL",
    logoBg: "#000000",
    status: "on",
    statusLabel: "Tilkoblet",
    rows: [
      { l: "Enhet", v: "MEVO-A4F2X" },
      { l: "Siste sync", v: "2t siden" },
      { l: "Sesjoner i mai", v: "12" },
    ],
    footMeta: "FW 2.14 · Bluetooth",
    cta: "Innstillinger",
  },
  {
    id: "garmin",
    name: "Garmin Connect",
    desc: "Klokke + helsedata",
    logo: "G",
    logoBg: "#1A7D56",
    status: "on",
    statusLabel: "Tilkoblet · 8 spillere",
    rows: [
      { l: "Auto-sync", v: "Daglig 06:00" },
      { l: "Datapunkter", v: "Søvn · HRV · Stress" },
      { l: "Siste sync", v: "i dag 06:02" },
    ],
    footMeta: "OAuth 2 · Read-only",
    cta: "Innstillinger",
  },
  {
    id: "zapier",
    name: "Zapier",
    desc: "3000+ koblinger",
    logo: "Z",
    logoBg: "#6259CA",
    status: "off",
    statusLabel: "Ikke tilkoblet",
    body: "Send sesjons-summer til Slack, Sheets, Notion eller egen CRM når en sesjon er fullført.",
    footMeta: "12 maler tilgjengelig",
    cta: "Koble til",
    ctaPrimary: true,
  },
  {
    id: "ngf",
    name: "NGF Golfbox",
    desc: "Handicap · turneringer",
    logo: "NG",
    logoBg: "#D7263D",
    status: "off",
    statusLabel: "Ikke tilkoblet",
    body: "Hent inn turneringsresultater og oppdaterte handicap-tall for alle 38 spillere automatisk.",
    footMeta: "Krever NGF-kobling",
    cta: "Koble til",
    ctaPrimary: true,
  },
  {
    id: "calendly",
    name: "Calendly",
    desc: "Booking-system",
    logo: "C",
    logoBg: "#F4A261",
    status: "off",
    statusLabel: "Ikke tilkoblet",
    body: "Lar spillere booke seg inn på ledige slots direkte i Calendly — pushes til CoachHQ-bookinger.",
    footMeta: "2-veis sync",
    cta: "Koble til",
    ctaPrimary: true,
  },
];

export default function SettingsApiDemo() {
  return (
    <div className="min-h-screen bg-background px-10 py-10 text-foreground">
      <div className="mx-auto max-w-[1100px]">
        <header className="mb-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground">
            Innstillinger · API
          </div>
          <h1 className="mt-2 font-display text-[36px] font-medium leading-[1.1] tracking-tight">
            <em className="font-normal italic">API-nøkler</em> og integrasjoner
          </h1>
          <p className="mt-3 max-w-[640px] text-[14px] text-muted-foreground">
            Koble på Trackman, FlightScope, Garmin eller egne verktøy. CoachHQ snakker med dem alle.
          </p>
        </header>

        <div className="grid grid-cols-[200px_1fr] gap-8">
          <aside>
            <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Innstillinger
            </div>
            <nav className="flex flex-col">
              {[
                { label: "Profil" },
                { label: "Bruker" },
                { label: "Sikkerhet" },
                { label: "Varsler" },
                { label: "API", active: true, count: 3 },
                { label: "Abonnement" },
                { label: "Tilgjengelighet" },
              ].map((item) => (
                <button
                  key={item.label}
                  className={`flex items-center justify-between rounded-md px-3 py-2 text-left text-[13px] transition-colors ${
                    item.active
                      ? "bg-secondary font-medium text-foreground"
                      : "text-muted-foreground hover:bg-secondary/60"
                  }`}
                >
                  <span>{item.label}</span>
                  {item.count != null && (
                    <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                      {item.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </aside>

          <div className="flex flex-col gap-8">
            {/* API-nøkler */}
            <Section
              title="API-nøkler"
              aux="Brukes av eksterne verktøy for å lese data fra CoachHQ"
              right={
                <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground hover:opacity-90">
                  <Plus className="h-3 w-3" strokeWidth={2} />
                  Ny nøkkel
                </button>
              }
            >
              <KeyRow
                name="iOS-appen"
                badge="Read + Write"
                badgeTone="accent"
                token="sk_live_a4f9 ··· ··· 7bX2"
                scope="sesjoner · spillere · agent.read"
                used="14 min siden"
                created="18.02.2026"
              />
              <KeyRow
                name="Zapier-bro"
                badge="Read only"
                badgeTone="muted"
                token="sk_live_z1Pp ··· ··· mK8N"
                scope="sesjoner.read · bookinger.read"
                used="2t siden"
                created="03.01.2026"
              />
              <KeyRow
                name="Test-nøkkel (lokal)"
                badge="Utløper 02.06"
                badgeTone="warning"
                muted
                token="sk_test_e2dF ··· ··· 9pQ4"
                scope="alt"
                used="12 dager siden"
                created="14.04.2026"
              />
            </Section>

            {/* Integrasjoner */}
            <Section title="Integrasjoner" aux="3 av 6 tilkoblet">
              <div className="grid grid-cols-2 gap-4 p-5">
                {INTEGRATIONS.map((i) => (
                  <IntegrationCard key={i.id} integration={i} />
                ))}
              </div>
            </Section>

            {/* Webhooks */}
            <Section
              title="Webhooks"
              aux="CoachHQ poster events til disse URLene"
              right={
                <button className="rounded-md border border-border px-3 py-1.5 text-[12px] font-medium text-foreground hover:bg-secondary">
                  + Nytt endepunkt
                </button>
              }
            >
              <div className="flex flex-col gap-3 p-5">
                <WebhookCard
                  url="https://hooks.akgolf.no/coachhq/sessions"
                  desc="Egen Heroku-app"
                  events={["session.done", "session.shared", "player.updated"]}
                  status="200 OK"
                  statusOk
                  meta="4 min siden · 99,7 % suksess"
                />
                <WebhookCard
                  url="https://akgolf.zapier-hook.com/v2/sessions"
                  desc="Zapier bro · feiler 3 ganger på rad"
                  events={["session.done", "booking.created"]}
                  status="502 timeout"
                  meta="2t siden · 41 % suksess"
                  failing
                />
              </div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  aux,
  right,
  children,
}: {
  title: string;
  aux?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-card">
      <header className="flex items-center gap-3 border-b border-border px-6 py-4">
        <h2 className="font-display text-[18px] font-semibold tracking-tight">{title}</h2>
        {aux && <span className="text-[12px] text-muted-foreground">{aux}</span>}
        {right && <div className="ml-auto">{right}</div>}
      </header>
      <div className="divide-y divide-border">{children}</div>
    </section>
  );
}

function KeyRow({
  name,
  badge,
  badgeTone,
  token,
  scope,
  used,
  created,
  muted,
}: {
  name: string;
  badge: string;
  badgeTone: "accent" | "muted" | "warning";
  token: string;
  scope: string;
  used: string;
  created: string;
  muted?: boolean;
}) {
  const badgeClass =
    badgeTone === "accent"
      ? "bg-accent/40 text-[#0A1F18]"
      : badgeTone === "warning"
        ? "bg-[#FFF0D6] text-[#B8852A]"
        : "bg-secondary text-muted-foreground";

  return (
    <div className="grid grid-cols-[1fr_220px_140px_60px] items-center gap-4 px-6 py-4">
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className={`text-[14px] font-medium ${muted ? "text-muted-foreground" : "text-foreground"}`}>
            {name}
          </span>
          <span className={`rounded-sm px-2 py-0.5 text-[10px] font-medium ${badgeClass}`}>{badge}</span>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-sm border border-border bg-secondary/40 px-2 py-1 font-mono text-[12px] text-muted-foreground">
          {token}
          <button className="inline-flex h-4 w-4 items-center justify-center text-muted-foreground hover:text-foreground">
            <Copy className="h-3 w-3" strokeWidth={1.5} />
          </button>
        </div>
      </div>
      <span className="font-mono text-[11px] uppercase tracking-[0.04em] text-muted-foreground">{scope}</span>
      <div className="text-right font-mono text-[11px] leading-snug">
        <div className="text-muted-foreground">
          Brukt <span className="font-medium text-foreground">{used}</span>
        </div>
        <div className="text-muted-foreground">Opprettet {created}</div>
      </div>
      <button className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary">
        <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
      </button>
    </div>
  );
}

function IntegrationCard({ integration: i }: { integration: Integration }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md font-display text-[15px] font-bold text-white"
          style={{ background: i.logoBg }}
        >
          {i.logo}
        </div>
        <div className="flex flex-1 flex-col">
          <span className="font-display text-[15px] font-semibold tracking-tight">{i.name}</span>
          <span className="text-[12px] text-muted-foreground">{i.desc}</span>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] ${
            i.status === "on"
              ? "bg-[#E5F1EA] text-[#1A7D56]"
              : "border border-border bg-secondary/40 text-muted-foreground"
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {i.statusLabel}
        </span>
      </div>
      <div className="border-t border-border pt-3 text-[12px] text-muted-foreground">
        {i.rows ? (
          <div className="flex flex-col gap-1">
            {i.rows.map((r) => (
              <div key={r.l} className="flex justify-between">
                <span className="text-muted-foreground/80">{r.l}</span>
                <span className="font-mono font-medium text-foreground">{r.v}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="leading-relaxed">{i.body}</p>
        )}
      </div>
      <div className="flex items-center justify-between border-t border-border pt-3">
        <span className="font-mono text-[10px] text-muted-foreground">{i.footMeta}</span>
        <button
          className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors ${
            i.ctaPrimary
              ? "bg-primary text-primary-foreground hover:opacity-90"
              : "border border-border text-foreground hover:bg-secondary"
          }`}
        >
          {i.cta} →
        </button>
      </div>
    </div>
  );
}

function WebhookCard({
  url,
  desc,
  events,
  status,
  statusOk,
  meta,
  failing,
}: {
  url: string;
  desc: string;
  events: string[];
  status: string;
  statusOk?: boolean;
  meta: string;
  failing?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-4 rounded-md border p-4 ${
        failing ? "border-[#A32D2D]/30 bg-[#A32D2D]/[0.04]" : "border-border bg-secondary/30"
      }`}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate font-mono text-[13px] text-foreground">{url}</span>
        <span className="font-mono text-[11px] text-muted-foreground">{desc}</span>
      </div>
      <div className="flex max-w-[280px] flex-wrap gap-1">
        {events.map((e) => (
          <span
            key={e}
            className="rounded-sm border border-border bg-card px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.04em] text-muted-foreground"
          >
            {e}
          </span>
        ))}
      </div>
      <div className="min-w-[110px] flex-shrink-0 text-right font-mono text-[11px] leading-snug">
        <div className={statusOk ? "font-semibold text-[#1A7D56]" : "font-semibold text-[#A32D2D]"}>
          ● {status}
        </div>
        <div className="text-muted-foreground">{meta}</div>
      </div>
    </div>
  );
}
