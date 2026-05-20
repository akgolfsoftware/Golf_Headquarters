import { Activity, HeartPulse, Link2, RefreshCw, HelpCircle, ArrowRight } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PageHeader } from "@/components/shared/page-header";

type IntegrasjonStatus = "connected" | "available";

type Integrasjon = {
  id: string;
  navn: string;
  kategori: string;
  beskrivelse: string;
  status: IntegrasjonStatus;
  badge?: string;
  data?: { label: string; value: string }[];
  brandColor: string;
  brandLabel: string;
};

const TILKOBLET: Integrasjon[] = [
  {
    id: "golfbox",
    navn: "GolfBox",
    kategori: "Handicap · Runder",
    beskrivelse:
      "Handicap, registrerte runder og klubb-medlemskap synkes automatisk fra norske golfklubber.",
    status: "connected",
    brandColor: "#0B5F30",
    brandLabel: "G",
    data: [
      { label: "Sist synket", value: "19.05.2026 · 08:23" },
      { label: "Siste runde", value: "GFGK · 18.05 · 74" },
    ],
  },
  {
    id: "trackman",
    navn: "TrackMan Performance Studio",
    kategori: "Shot-data · Range-økter",
    beskrivelse:
      "Klubb-data, ballhastighet, launch og spin per shot fra studio-økter ved AK Golf-anlegget.",
    status: "connected",
    brandColor: "#0A0A0A",
    brandLabel: "T",
    data: [
      { label: "Sist synket", value: "14.05.2026 · 16:45" },
      { label: "Siste økt", value: "47 shots · Iron CS70→CS80" },
    ],
  },
  {
    id: "apple-health",
    navn: "Apple Health",
    kategori: "Søvn · Puls · HRV",
    beskrivelse:
      "Søvnkvalitet, hvilepuls og HRV fra iPhone og Apple Watch — brukes til form og restitusjons-trender.",
    status: "connected",
    brandColor: "#FBFAF8",
    brandLabel: "H",
    data: [
      { label: "Sist synket", value: "19.05.2026 · 06:00" },
      { label: "I natt", value: "7 t 12 min · HRV 64 ms" },
    ],
  },
];

const TILGJENGELIG: Integrasjon[] = [
  {
    id: "trackman-connect",
    navn: "TrackMan Connect",
    kategori: "Personlige range-økter",
    beskrivelse:
      "Range-økter fra TrackMan-baser utenfor AK Golf — Driving Range, Bayhill og andre offentlige anlegg.",
    status: "available",
    brandColor: "#0A0A0A",
    brandLabel: "T",
  },
  {
    id: "strava",
    navn: "Strava",
    kategori: "Kondisjon · Løping · Sykling",
    beskrivelse:
      "Kondisjons-økter (løping, sykling, tur) logges som FYS-økter i pyramiden din.",
    status: "available",
    brandColor: "#FC4C02",
    brandLabel: "S",
  },
  {
    id: "garmin",
    navn: "Garmin Connect",
    kategori: "Steg · Treningsintensitet",
    beskrivelse:
      "Daglige steg, hvilepuls, body-battery og treningsbelastning fra Garmin-klokken.",
    status: "available",
    brandColor: "#000000",
    brandLabel: "G",
  },
  {
    id: "spotify",
    navn: "Spotify",
    kategori: "Treningsplaylister",
    beskrivelse:
      "Knytt egne playlister til økt-typer. Starter automatisk når du trykker «Start økt».",
    status: "available",
    badge: "PRO",
    brandColor: "#1DB954",
    brandLabel: "S",
  },
  {
    id: "kalender",
    navn: "Google Calendar & Apple Calendar",
    kategori: "Kalender-synk",
    beskrivelse:
      "Push planlagte og fullførte økter til din personlige kalender. Velg én eller begge tjenester.",
    status: "available",
    brandColor: "#FFFFFF",
    brandLabel: "K",
  },
];

export default async function IntegrasjonerPage() {
  await requirePortalUser();

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Innstillinger · Data · Integrasjoner"
        titleLead="Koble til der"
        titleItalic="data finnes"
        sub="Koble PlayerHQ til eksterne tjenester slik at handicap, runder, shot-data, søvn og puls samles ett sted — uten manuell jobb."
      />

      {/* Summary strip */}
      <div className="grid grid-cols-2 gap-4 rounded-xl border border-border bg-card p-6 shadow-sm sm:grid-cols-4">
        <SumCell label="Tilkoblet" value="3" suffix="/ 8" sub="aktive kilder" />
        <SumCell label="Sist synket" value="08" suffix=":23" sub="19.05 — i dag" />
        <SumCell label="Nye rader" value="47" sub="siste 24 t" />
        <SumCell label="Datapunkter" value="12 480" sub="totalt" />
      </div>

      <Section title="Tilkoblet" count="3 aktive">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {TILKOBLET.map((i) => (
            <IntegrasjonCard key={i.id} integrasjon={i} />
          ))}
        </div>
      </Section>

      <Section title="Tilgjengelig" count="5 ikke tilkoblet">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {TILGJENGELIG.map((i) => (
            <IntegrasjonCard key={i.id} integrasjon={i} />
          ))}
        </div>
      </Section>

      {/* Help footer */}
      <div className="flex flex-col items-start gap-5 rounded-xl border border-border bg-card p-7 shadow-sm sm:flex-row sm:items-center">
        <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-accent/40 text-primary">
          <HelpCircle className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div className="flex-1">
          <div className="font-display text-base font-semibold text-foreground">
            Får du ikke koblet til?
          </div>
          <div className="mt-0.5 text-sm text-muted-foreground">
            Vi har laget en kort guide for hver tjeneste. Eller send oss et
            spørsmål — vi svarer innen 4 timer på hverdager.
          </div>
        </div>
        <a
          href="/portal/meg/help/kontakt"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 font-display text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          Kontakt support
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
        </a>
      </div>
    </div>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-lg font-semibold text-foreground">
          {title}
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          {count}
        </span>
      </div>
      {children}
    </section>
  );
}

function SumCell({
  label,
  value,
  suffix,
  sub,
}: {
  label: string;
  value: string;
  suffix?: string;
  sub: string;
}) {
  return (
    <div>
      <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </span>
      <div className="mt-1.5 font-mono text-2xl font-bold tabular-nums text-foreground">
        {value}
        {suffix && (
          <small className="ml-0.5 text-base font-normal text-muted-foreground">
            {suffix}
          </small>
        )}
      </div>
      <span className="font-mono text-[10px] text-muted-foreground/80">
        {sub}
      </span>
    </div>
  );
}

function IntegrasjonCard({ integrasjon }: { integrasjon: Integrasjon }) {
  const connected = integrasjon.status === "connected";
  return (
    <div className="relative flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
      {integrasjon.badge && (
        <span className="absolute right-3 top-3 rounded-sm bg-accent/40 px-2 py-0.5 font-mono text-[9px] font-bold tracking-[0.10em] text-primary">
          {integrasjon.badge}
        </span>
      )}
      <div className="flex items-center gap-3">
        <div
          className="grid h-10 w-10 place-items-center rounded-lg font-display text-base font-bold text-white"
          style={{ background: integrasjon.brandColor, color: integrasjon.brandColor === "#FBFAF8" || integrasjon.brandColor === "#FFFFFF" ? "#0A1F17" : "#fff" }}
        >
          {integrasjon.brandLabel}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-sm font-semibold text-foreground">
            {integrasjon.navn}
          </div>
          <div className="text-xs text-muted-foreground">
            {integrasjon.kategori}
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.06em] ${
            connected
              ? "bg-[color:rgb(44_125_82)]/10 text-[color:rgb(44_125_82)]"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              connected ? "bg-[color:rgb(44_125_82)]" : "bg-muted-foreground/40"
            }`}
          />
          {connected ? "Tilkoblet" : "Ikke tilkoblet"}
        </span>
      </div>

      <p className="text-sm text-muted-foreground">{integrasjon.beskrivelse}</p>

      {integrasjon.data && (
        <div className="space-y-1 rounded-md border border-border bg-muted/50 px-3 py-2.5 font-mono text-xs tabular-nums">
          {integrasjon.data.map((d) => (
            <div key={d.label} className="flex justify-between gap-3">
              <span className="text-muted-foreground">{d.label}</span>
              <span className="font-medium text-foreground">{d.value}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between pt-2">
        {connected ? (
          <>
            <button
              type="button"
              className="rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              Administrer
            </button>
            <button
              type="button"
              aria-label="Last inn på nytt"
              className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Link2 className="h-3 w-3" strokeWidth={1.75} />
              Koble til
            </button>
            <button
              type="button"
              aria-label="Mer info"
              className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <HelpCircle className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// Mark icons used to suppress unused-warnings in case Activity/HeartPulse referenced
void Activity;
void HeartPulse;
