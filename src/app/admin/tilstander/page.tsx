import { AlertTriangle, Calendar, Check, Clock, Download, X } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PageHeader } from "@/components/shared/page-header";

export const dynamic = "force-dynamic";

type Tilstand = "planned" | "prep" | "live" | "done" | "cancelled" | "missing" | "conflict" | "requested" | "block";

type Kort = {
  state: Tilstand;
  name: string;
  tag: string;
  time: string;
  player: string;
  initials: string;
  meta: string;
  status: string;
  body?: string;
  trigger: string;
  action: string;
  visning: string;
};

export default async function TilstanderPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const livssyklus: Kort[] = [
    {
      state: "planned",
      name: "PLANLAGT",
      tag: "default",
      time: "10:00",
      player: "Mathias Pedersen",
      initials: "MP",
      meta: "A-lag · 60 min · Studio 2",
      status: "planlagt",
      body: "Backswing-plan + slag-fundament. Måling med Trackman.",
      trigger: "bekreftet av elev",
      action: "åpne · flytt · avlys",
      visning: "kalender · oppfølging",
    },
    {
      state: "prep",
      name: "FORBERED",
      tag: "T-24h",
      time: "09:00",
      player: "Eline Krogh",
      initials: "EK",
      meta: "junior · 45 min · Bossum",
      status: "forbered i dag",
      body: "Vridning ut fra bunn. Kontroll i kropp. Mål: måling under 3.0°.",
      trigger: "< 24 t til start",
      action: "fullfør plan-sjekkliste",
      visning: "kalender · dashbord-feed",
    },
    {
      state: "live",
      name: "PÅGÅR",
      tag: "live",
      time: "09:00",
      player: "Mathias Pedersen",
      initials: "MP",
      meta: "A-lag · 60 min · Studio 2",
      status: "pågår · 22 min igjen",
      body: "Tester ny backswing-vinkel. 2 nye målinger registrert. Trackman-feed aktiv.",
      trigger: "kort er startet",
      action: "registrér · skriv · ferdigstill",
      visning: "kalender · hub",
    },
    {
      state: "done",
      name: "FERDIG",
      tag: "etterarbeid",
      time: "11:00",
      player: "Sondre Berg",
      initials: "SB",
      meta: "Elite · 60 min · Studio 1",
      status: "ferdig",
      body: "Notater lagret. Trackman-sesjon: 28 swings. Notater til neste økt.",
      trigger: "coach klikker ferdig",
      action: "rapport · neste plan",
      visning: "historikk · spillerkort",
    },
  ];

  const unntak: Kort[] = [
    {
      state: "cancelled",
      name: "AVLYST",
      tag: "trist",
      time: "13:00",
      player: "Joachim Trønnes",
      initials: "JT",
      meta: "Akademi · 30 min · Studio 3",
      status: "avlyst",
      body: "Avlyst < 24 t · ingen credit-tilbakeføring.",
      trigger: "elev avlyste",
      action: "vis logg · kontakt",
      visning: "historikk · oppfølging",
    },
    {
      state: "missing",
      name: "MANGLER",
      tag: "krever handling",
      time: "08:00",
      player: "Henrik Næss",
      initials: "HN",
      meta: "Pro · 60 min · Studio 4",
      status: "ikke møtt",
      body: "Bookingen er ikke kvittert ut. Kontakt spilleren og avklar.",
      trigger: "passert start uten kvittering",
      action: "kontakt · marker fullført · avlys",
      visning: "oppfølging · alarm",
    },
    {
      state: "conflict",
      name: "OVERLAPP",
      tag: "ressurs-konflikt",
      time: "14:00",
      player: "Anna Karlsen",
      initials: "AK",
      meta: "Junior · 45 min · Studio 1",
      status: "konflikt",
      body: "To bookinger overlapper i samme studio. Flytt en av dem.",
      trigger: "konflikt-deteksjon",
      action: "løs · flytt",
      visning: "kalender · oppfølging",
    },
  ];

  const flyt: Kort[] = [
    {
      state: "requested",
      name: "FORESPURT",
      tag: "av elev",
      time: "16:30",
      player: "Lise Solum",
      initials: "LS",
      meta: "Akademi · 60 min · Bossum",
      status: "forespurt",
      body: "Eleven har bedt om en økt. Godkjenn eller avslå før T-24t.",
      trigger: "elev oppretter bookingforespørsel",
      action: "godkjenn · avslå",
      visning: "innboks · forespørsler",
    },
    {
      state: "block",
      name: "BLOKKERT",
      tag: "vedlikehold",
      time: "10:00–12:00",
      player: "—",
      initials: "·",
      meta: "Studio 4 · ikke bookbar",
      status: "blokkert",
      body: "Studio er stengt for service. Ingen bookinger tillatt.",
      trigger: "admin blokkerer",
      action: "fjern blokkering",
      visning: "kapasitet · kalender",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CoachHQ · Design-system · Tilstander"
        titleLead="Tilstander"
        titleItalic="· økt-kort"
        sub="Et kort gjennom hele øktens liv — fra plan til etter. 9 tilstander."
        actions={
          <>
            <button
              type="button"
              disabled
              className="inline-flex cursor-not-allowed items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground opacity-50"
            >
              <Download className="h-4 w-4" />
              Eksporter
            </button>
            <button
              type="button"
              disabled
              className="inline-flex cursor-not-allowed items-center gap-2 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground opacity-50"
            >
              Bruk i Figma
            </button>
          </>
        }
      />

      <SectionHeader nummer="01" title="Livssyklus" sub="fire trinn fra plan til etter" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {livssyklus.map((k) => (
          <StateFrame key={k.name} kort={k} />
        ))}
      </div>

      <SectionHeader nummer="02" title="Unntak" sub="når noe avviker — registrér eller håndter" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {unntak.map((k) => (
          <StateFrame key={k.name} kort={k} />
        ))}
      </div>

      <SectionHeader nummer="03" title="Flyt" sub="forespørsler og blokkering" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {flyt.map((k) => (
          <StateFrame key={k.name} kort={k} />
        ))}
      </div>

      <footer className="mt-4 flex flex-col items-start justify-between gap-2 border-t border-border pt-4 text-[12px] text-muted-foreground sm:flex-row sm:items-center">
        <span>AK Golf Platform · CoachHQ · /admin/tilstander</span>
        <span className="font-mono">9 tilstander · design-system v2</span>
      </footer>
    </div>
  );
}

function SectionHeader({
  nummer,
  title,
  sub,
}: {
  nummer: string;
  title: string;
  sub: string;
}) {
  return (
    <div className="mt-6 mb-2 flex items-baseline gap-4">
      <span className="font-mono text-[12px] font-medium text-muted-foreground">
        {nummer}
      </span>
      <h2 className="font-display text-[22px] font-semibold tracking-tight">
        {title}
      </h2>
      <span className="ml-auto font-display text-[16px] italic text-muted-foreground">
        {sub}
      </span>
    </div>
  );
}

function StateFrame({ kort }: { kort: Kort }) {
  return (
    <div className="flex flex-col gap-3.5 rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
          {kort.name}
        </span>
        <span className="rounded-sm bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          {kort.tag}
        </span>
      </div>

      <SessionCard kort={kort} />

      <ul className="flex flex-col gap-1 text-[12.5px] text-muted-foreground">
        <Spec k="trigger" v={kort.trigger} />
        <Spec k="aksjon" v={kort.action} />
        <Spec k="vises i" v={kort.visning} />
      </ul>
    </div>
  );
}

function Spec({ k, v }: { k: string; v: string }) {
  return (
    <li className="flex items-baseline gap-2.5">
      <span className="min-w-16 font-mono text-[10.5px] uppercase tracking-[0.06em] text-muted-foreground">
        {k}
      </span>
      <span className="text-foreground">{v}</span>
    </li>
  );
}

function SessionCard({ kort }: { kort: Kort }) {
  const variants: Record<Tilstand, { wrapper: string; status: string; statusIcon?: React.ReactNode }> = {
    planned: {
      wrapper: "bg-card border-border",
      status: "bg-primary/10 text-primary",
      statusIcon: <Calendar className="h-3 w-3" />,
    },
    prep: {
      wrapper: "bg-accent/10 border-accent/40",
      status: "bg-accent/30 text-accent-foreground",
      statusIcon: <Clock className="h-3 w-3" />,
    },
    live: {
      wrapper: "bg-primary/5 border-primary",
      status: "bg-primary text-primary-foreground",
      statusIcon: <span className="block h-2 w-2 animate-pulse rounded-full bg-primary-foreground" />,
    },
    done: {
      wrapper: "bg-secondary/60 border-border opacity-90",
      status: "bg-primary/10 text-primary",
      statusIcon: <Check className="h-3 w-3" />,
    },
    cancelled: {
      wrapper: "bg-[repeating-linear-gradient(135deg,var(--card)_0_8px,var(--secondary)_8px_16px)] border-border",
      status: "bg-destructive/10 text-destructive",
      statusIcon: <X className="h-3 w-3" />,
    },
    missing: {
      wrapper: "bg-card border-destructive ring-2 ring-destructive/20",
      status: "bg-destructive text-destructive-foreground",
      statusIcon: <AlertTriangle className="h-3 w-3" />,
    },
    conflict: {
      wrapper: "border-destructive bg-card",
      status: "bg-destructive/10 text-destructive",
      statusIcon: <AlertTriangle className="h-3 w-3" />,
    },
    requested: {
      wrapper: "bg-accent/15 border-dashed border-accent",
      status: "bg-accent text-accent-foreground",
    },
    block: {
      wrapper: "bg-[repeating-linear-gradient(135deg,var(--card)_0_6px,var(--secondary)_6px_12px)] border-dashed border-border",
      status: "bg-secondary text-muted-foreground border border-border",
    },
  };

  const v = variants[kort.state];
  const erBlock = kort.state === "block";
  const erAvlyst = kort.state === "cancelled";

  return (
    <div className={`relative flex flex-col gap-2.5 rounded-md border p-3.5 ${v.wrapper}`}>
      {kort.state === "conflict" && (
        <span className="absolute -left-px top-0 bottom-0 w-1 rounded-l-md bg-destructive" />
      )}
      <div className="flex items-start gap-2.5">
        <span className="min-w-10 pt-0.5 font-mono text-[11px] text-muted-foreground">
          {kort.time}
        </span>
        <div className="flex-1">
          <div
            className={`font-display text-[15px] font-semibold leading-tight tracking-tight ${
              erAvlyst ? "text-muted-foreground line-through" : "text-foreground"
            } ${erBlock ? "italic text-muted-foreground" : ""}`}
          >
            {kort.player}
          </div>
          <div className="mt-0.5 text-[11.5px] text-muted-foreground">
            {kort.meta}
          </div>
        </div>
        {kort.initials !== "·" && (
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary font-mono text-[12px] font-semibold text-foreground">
            {kort.initials}
          </span>
        )}
      </div>

      <span
        className={`inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium ${v.status}`}
      >
        {v.statusIcon}
        {kort.status}
      </span>

      {kort.body && (
        <div className="rounded-md bg-background/40 p-2.5 text-[12.5px] leading-relaxed text-foreground">
          {kort.body}
        </div>
      )}
    </div>
  );
}
