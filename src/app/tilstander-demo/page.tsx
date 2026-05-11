/**
 * PILOT — CoachHQ Økt-kort · Tilstander
 * Bygd direkte fra wireframe/design-files-v2/08-tilstander.html
 * URL: /tilstander-demo
 *
 * Design-system-katalog over økt-kort i alle livssyklus-tilstander.
 */

import { AlertTriangle } from "lucide-react";

export default function TilstanderDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      {/* Page head */}
      <header className="mb-6 flex items-start justify-between">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            /design-system/states · økt-kort
          </span>
          <h1 className="mt-1 font-display text-[36px] font-bold leading-[1.1] tracking-tight">
            Tilstander{" "}
            <em className="font-normal italic text-muted-foreground">
              · økt-kort
            </em>
          </h1>
          <p className="mt-1 font-display text-[16px] italic text-muted-foreground">
            Et kort gjennom hele øktens liv — fra plan til etter.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-md border border-border bg-card px-3.5 py-2 text-[13px] font-medium hover:bg-secondary">
            Eksporter
          </button>
          <button className="rounded-md bg-primary px-3.5 py-2 text-[13px] font-medium text-primary-foreground hover:opacity-90">
            Bruk i Figma
          </button>
        </div>
      </header>

      {/* Section 1 — Livssyklus */}
      <SectionHead num="01" title="Livssyklus" sub="seks trinn fra plan til etter" />

      <div className="grid grid-cols-3 gap-6">
        {/* Planlagt */}
        <Frame name="Planlagt" tag="default">
          <SessionCard variant="planned">
            <CardHead
              time="10:00"
              name="Mathias Pedersen"
              meta="A-lag · 60 min · Studio 2"
              avatarText="MP"
            />
            <StatusPill variant="planned">planlagt</StatusPill>
            <CardBody label="tema">
              Backswing-plan <strong className="font-medium text-foreground">+ slag-fundament</strong>. Måling med Trackman.
            </CardBody>
            <CardActions>
              <Btn>Åpne</Btn>
              <Btn ghost>Flytt</Btn>
              <span className="ml-auto font-mono text-[11px] text-muted-foreground">
                om 4 dgr
              </span>
            </CardActions>
          </SessionCard>
          <Spec
            trigger="bekreftet av elev"
            action="åpne · flytt · avlys"
            location="kalender · oppfølging"
          />
        </Frame>

        {/* Forbered */}
        <Frame name="Forbered" tag="T-24t">
          <SessionCard variant="prep">
            <CardHead
              time="09:00"
              name="Eline Krogh"
              meta="junior · 45 min · Bossum"
              avatarText="EK"
            />
            <StatusPill variant="prep">forbered i dag</StatusPill>
            <CardBody label="noter fra forrige">
              Vridning ut <strong className="font-medium text-foreground">fra bunn</strong>. Kontroll i kropp. Mål: måling under 3,0°.
            </CardBody>
            <Progress label="forberedelse" value={35} max="2 av 5" warn />
            <CardActions>
              <Btn accent>Fullfør plan</Btn>
              <Btn ghost>Se historikk</Btn>
            </CardActions>
          </SessionCard>
          <Spec
            trigger="< 24 t til start"
            action="fullfør plan-sjekkliste"
            location="kalender · dashbord-feed"
          />
        </Frame>

        {/* Pågår */}
        <Frame name="Pågår" tag="live">
          <SessionCard variant="live">
            <CardHead
              time="09:00"
              name="Mathias Pedersen"
              meta="A-lag · 60 min · Studio 2"
              avatarText="MP"
              live
            />
            <StatusPill variant="live">pågår · 22 min igjen</StatusPill>
            <CardBody label="live-noter" live>
              Tester ny backswing-vinkel.{" "}
              <strong className="font-medium text-background">2 nye målinger</strong>{" "}
              registrert. Trackman-feed aktiv.
            </CardBody>
            <Progress label="tid" value={63} max="38/60" live />
            <CardActions>
              <Btn accent>Åpne live-noter</Btn>
              <button className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-[12px] font-medium text-background">
                Avslutt
              </button>
            </CardActions>
          </SessionCard>
          <Spec
            trigger="på starttidspunkt"
            action="live-noter · målinger · avslutt"
            location="nå-banner · kalender"
          />
        </Frame>

        {/* Gjort */}
        <Frame name="Gjort" tag="avsluttet">
          <SessionCard variant="done">
            <CardHead
              time="08:00"
              name="Henrik Norvik"
              meta="senior · 60 min · i går"
              avatarText="HN"
              muted
            />
            <StatusPill variant="done">gjort · noter klare</StatusPill>
            <CardBody label="utbytte" onCard>
              Spin-vinkel <strong className="font-medium text-foreground">−1,4°</strong>. Carry-snitt opp 4 m.{" "}
              <strong className="font-medium text-foreground">2 tilbakemeldinger</strong> klare for sending.
            </CardBody>
            <CardActions>
              <Btn>Send oppsummering</Btn>
              <Btn ghost>Se noter</Btn>
              <span className="ml-auto font-mono text-[11px] text-[#1A7D56]">
                +4 m carry
              </span>
            </CardActions>
          </SessionCard>
          <Spec
            trigger="manuell avslutning"
            action="send oppsummering · arkiver"
            location="oppfølging · historikk"
          />
        </Frame>

        {/* Etter */}
        <Frame name="Etter" tag="7 dgr">
          <SessionCard variant="done" extraClass="opacity-85">
            <CardHead
              time="—"
              name="Astrid Kvam"
              meta="senior · 7 dgr siden · Bossum"
              avatarText="AK"
              muted
            />
            <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              arkivert
            </span>
            <CardBody label="snitt-påvirkning" onCard>
              Adherence{" "}
              <strong className="font-medium text-foreground">+8 %</strong>. Åpnet i lag-snitt-rapport{" "}
              <strong className="font-medium text-foreground">3 ganger</strong>.
            </CardBody>
            <CardActions>
              <Btn ghost>Vis i historikk</Btn>
              <Btn ghost>Dupliser plan</Btn>
            </CardActions>
          </SessionCard>
          <Spec
            trigger="7 dgr etter avsluttet"
            action="vis i historikk · dupliser"
            location="historikk · elev-profil"
          />
        </Frame>

        {/* Avlyst */}
        <Frame name="Avlyst" tag="cancelled">
          <SessionCard variant="cancelled">
            <CardHead
              time="14:00"
              name="Sondre Berg"
              meta="junior · 45 min · i morgen"
              avatarText="SB"
              strike
            />
            <StatusPill variant="cancelled">avlyst · av elev</StatusPill>
            <CardBody label="årsak">
              «Skole-tur som dukket opp.»{" "}
              <strong className="font-medium text-foreground">Foreslått</strong> ny tid: tirsdag 10:00.
            </CardBody>
            <CardActions>
              <Btn primary>Bekreft ny tid</Btn>
              <Btn ghost>Tilby alt.</Btn>
            </CardActions>
          </SessionCard>
          <Spec
            trigger="elev avlyste · > 12 t"
            action="tilby ny tid · slett"
            location="oppfølgings-kø"
          />
        </Frame>
      </div>

      {/* Section 2 — Edge cases */}
      <SectionHead num="02" title="Edge cases" sub="når noe trenger oppmerksomhet" />

      <div className="grid grid-cols-3 gap-6">
        {/* Mangler noter */}
        <Frame name="Mangler noter" tag="overdue">
          <SessionCard variant="missing">
            <CardHead
              time="08:00"
              name="Jakob Tønsberg"
              meta="senior · 3 dgr siden · GFGK"
              avatarText="JT"
            />
            <StatusPill variant="missing">mangler oppsummering</StatusPill>
            <div className="flex items-center gap-1.5 rounded-md bg-destructive/10 px-2.5 py-2 text-[12px] text-destructive">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" strokeWidth={1.75} />
              <span>
                Eleven åpnet appen{" "}
                <strong className="font-medium">4 ganger</strong> · venter på svar
              </span>
            </div>
            <CardActions>
              <Btn primary>Skriv nå</Btn>
              <Btn ghost>AI-utkast</Btn>
            </CardActions>
          </SessionCard>
          <Spec
            trigger="> 48 t uten oppsummering"
            action="skriv · AI-utkast"
            location="oppfølgings-kø · varsler"
          />
        </Frame>

        {/* Konflikt */}
        <Frame name="Konflikt" tag="overbooked">
          <SessionCard variant="conflict">
            <span className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[14px] bg-destructive" />
            <CardHead
              time="15:00"
              name="Markus Roinås P."
              meta="A-lag · 60 min · Studio 2"
              avatarText="MR"
            />
            <StatusPill variant="conflict">kolliderer · Studio 2</StatusPill>
            <CardBody label="konflikt">
              Bjørn har{" "}
              <strong className="font-medium text-foreground">Studio 2</strong>{" "}
              14:30–16:00. Foreslå{" "}
              <strong className="font-medium text-foreground">Studio 1</strong>{" "}
              eller flytt til 16:30.
            </CardBody>
            <CardActions>
              <Btn primary>Bytt rom</Btn>
              <Btn>Flytt tid</Btn>
            </CardActions>
          </SessionCard>
          <Spec
            trigger="overlapp på rom/coach"
            action="bytt rom · flytt tid · ignorer"
            location="kalender · kapasitet"
          />
        </Frame>

        {/* Forespurt */}
        <Frame name="Forespurt" tag="av elev">
          <SessionCard variant="requested">
            <CardHead
              time="~16:00"
              name="Maja Tangen"
              meta="senior · 60 min · onsdag eller torsdag"
              avatarText="MT"
              avatarTone="#B8852A"
            />
            <StatusPill variant="requested">ønsker bekreftelse</StatusPill>
            <CardBody label="forespørsel">
              «Vil ha en økt før KM.{" "}
              <strong className="font-medium text-foreground">Putting + slag</strong>. Helst Bossum, men greit med GFGK.»
            </CardBody>
            <CardActions>
              <Btn accent>Bekreft ons 16:00</Btn>
              <Btn ghost>Tilby alt.</Btn>
            </CardActions>
          </SessionCard>
          <Spec
            trigger="elev ba om tid"
            action="bekreft · forhandle"
            location="oppfølgings-kø · meldinger"
          />
        </Frame>
      </div>

      {/* Section 3 — Behaviour spec */}
      <SectionHead
        num="03"
        title="Tilstands-flyt"
        sub="hvordan kortet beveger seg"
      />

      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-card p-7">
          <div className="mb-1 font-display text-[18px] font-semibold tracking-tight">
            Standard livssyklus
          </div>
          <div className="mb-4.5 text-[13px] text-muted-foreground">
            Ingen avvik · ingen avlysing.
          </div>
          <div className="mb-4.5 flex flex-wrap items-center gap-2">
            <FlowPill variant="planned">planlagt</FlowPill>
            <span className="text-muted-foreground">→</span>
            <FlowPill variant="warn">forbered</FlowPill>
            <span className="text-muted-foreground">→</span>
            <FlowPill variant="live">pågår</FlowPill>
            <span className="text-muted-foreground">→</span>
            <FlowPill variant="success">gjort</FlowPill>
            <span className="text-muted-foreground">→</span>
            <FlowPill variant="muted">arkivert</FlowPill>
          </div>
          <SpecRow k="T-7d" v="opprettes · økt vises i ukes-kalender" />
          <SpecRow k="T-24t" v="bytter til forbered · ber om plan-sjekkliste" />
          <SpecRow k="T0" v="bytter til pågår · live-noter åpnes" />
          <SpecRow k="T+5m" v="avslutt åpner oppsummeringsboks" />
          <SpecRow
            k="T+48t"
            v="automatisk arkiveres hvis oppsummering er sendt"
          />
        </div>

        <div className="rounded-2xl border border-border bg-card p-7">
          <div className="mb-1 font-display text-[18px] font-semibold tracking-tight">
            Eskaleringer
          </div>
          <div className="mb-4.5 text-[13px] text-muted-foreground">
            Når systemet må bryte inn.
          </div>
          <SpecRow
            k="+ 12t"
            v="elev avlyser → bytter til avlyst · kommer i oppfølgings-kø"
          />
          <SpecRow
            k="+ 48t"
            v="ingen oppsummering → bytter til mangler noter"
          />
          <SpecRow
            k="romkrasj"
            v="overlapp → bytter til konflikt · varsel på kapasitet"
          />
          <SpecRow k="elev-init" v="elev ber om tid → kommer som forespurt" />
          <SpecRow
            k="no-show"
            v="starttid + 15 min uten check-in → tag no-show på gjort-tilstand"
          />
          <div className="mt-5 rounded-xl bg-accent/30 px-3.5 py-3 text-[12.5px] text-[#005840]">
            <strong className="font-semibold">Regel:</strong> alle eskaleringer skaper ett{" "}
            <em className="font-display italic">felt</em> i oppfølgings-køen. Aldri to.
          </div>
        </div>
      </div>

      <footer className="mt-12 flex justify-between border-t border-border pt-6 text-[12px] text-muted-foreground">
        <span>AK Golf Platform · CoachHQ · /design-system/states</span>
        <span className="font-mono">9 tilstander · 3 eskaleringer</span>
      </footer>
    </div>
  );
}

function SectionHead({
  num,
  title,
  sub,
}: {
  num: string;
  title: string;
  sub: string;
}) {
  return (
    <div className="mb-3.5 mt-8 flex items-baseline gap-3.5">
      <span className="font-mono text-[12px] font-medium text-muted-foreground">
        {num}
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

function Frame({
  name,
  tag,
  children,
}: {
  name: string;
  tag: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3.5 rounded-2xl border border-border bg-card p-4.5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
          {name}
        </span>
        <span className="rounded-sm bg-secondary px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
          {tag}
        </span>
      </div>
      {children}
    </div>
  );
}

type SessionVariant =
  | "planned"
  | "prep"
  | "live"
  | "done"
  | "cancelled"
  | "missing"
  | "conflict"
  | "requested";

function SessionCard({
  variant,
  extraClass = "",
  children,
}: {
  variant: SessionVariant;
  extraClass?: string;
  children: React.ReactNode;
}) {
  const variants: Record<SessionVariant, string> = {
    planned: "bg-card border border-border",
    prep:
      "bg-card border border-[rgba(184,133,42,0.35)] shadow-[0_0_0_1px_rgba(184,133,42,0.20)]",
    live:
      "bg-foreground text-background border border-accent shadow-[0_0_0_2px_var(--color-accent),0_10px_30px_rgba(0,0,0,0.25)]",
    done: "bg-secondary border border-border/60",
    cancelled:
      "border border-border bg-[repeating-linear-gradient(135deg,_var(--color-card)_0_8px,_var(--color-secondary)_8px_16px)]",
    missing:
      "bg-card border border-destructive shadow-[0_0_0_3px_rgba(163,45,45,0.10)]",
    conflict: "bg-card border border-destructive",
    requested: "bg-accent/30 border border-dashed border-accent",
  };
  return (
    <div
      className={`relative flex flex-col gap-2.5 rounded-[14px] p-4 ${variants[variant]} ${extraClass}`}
    >
      {children}
    </div>
  );
}

function CardHead({
  time,
  name,
  meta,
  avatarText,
  avatarTone,
  live,
  muted,
  strike,
}: {
  time: string;
  name: string;
  meta: string;
  avatarText: string;
  avatarTone?: string;
  live?: boolean;
  muted?: boolean;
  strike?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div
        className={`min-w-10 pt-0.5 font-mono text-[11px] ${
          live ? "text-accent" : "text-muted-foreground"
        }`}
      >
        {time}
        {live && (
          <div className="mt-1 h-2 w-2 rounded-full bg-accent shadow-[0_0_0_0_rgba(209,248,67,0.6)]" />
        )}
      </div>
      <div className="flex-1">
        <div
          className={`font-display text-[15px] font-semibold leading-tight tracking-tight ${
            muted ? "text-muted-foreground" : ""
          } ${strike ? "line-through decoration-muted-foreground" : ""}`}
        >
          {name}
        </div>
        <div
          className={`mt-0.5 flex items-center gap-1.5 text-[11.5px] ${
            live ? "text-background/55" : "text-muted-foreground"
          }`}
        >
          {meta}
        </div>
      </div>
      <div
        className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full font-mono text-[11px] font-semibold text-background"
        style={{ background: avatarTone ?? "var(--color-primary)" }}
      >
        {avatarText}
      </div>
    </div>
  );
}

type PillVariant =
  | "planned"
  | "prep"
  | "live"
  | "done"
  | "cancelled"
  | "missing"
  | "conflict"
  | "requested";

function StatusPill({
  variant,
  children,
}: {
  variant: PillVariant;
  children: React.ReactNode;
}) {
  const styles: Record<PillVariant, string> = {
    planned: "bg-primary/10 text-primary",
    prep: "bg-[#FFF0D6] text-[#B8852A]",
    live: "bg-accent text-[#0A1F17]",
    done: "bg-[#E5F1EA] text-[#1A7D56]",
    cancelled: "bg-destructive/10 text-destructive",
    missing: "bg-destructive text-destructive-foreground",
    conflict: "bg-destructive/10 text-destructive",
    requested: "bg-accent text-[#0A1F17]",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 self-start rounded-full px-2 py-0.5 text-[11px] font-medium ${styles[variant]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

function CardBody({
  label,
  children,
  live,
  onCard,
}: {
  label: string;
  children: React.ReactNode;
  live?: boolean;
  onCard?: boolean;
}) {
  const bg = live
    ? "bg-white/[0.06] text-background/85"
    : onCard
      ? "bg-card text-muted-foreground"
      : "bg-secondary text-muted-foreground";
  return (
    <div className={`rounded-[10px] px-3 py-2.5 text-[12.5px] leading-[1.45] ${bg}`}>
      <div
        className={`mb-1 font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] ${
          live ? "text-background/50" : "text-muted-foreground"
        }`}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function Progress({
  label,
  value,
  max,
  live,
  warn,
}: {
  label: string;
  value: number;
  max: string;
  live?: boolean;
  warn?: boolean;
}) {
  const barBg = live ? "bg-white/10" : "bg-secondary";
  const fillColor = warn
    ? "bg-[#B8852A]"
    : live
      ? "bg-accent"
      : "bg-primary";
  return (
    <div
      className={`flex items-center gap-2 text-[11px] ${
        live ? "text-background/55" : "text-muted-foreground"
      }`}
    >
      <span>{label}</span>
      <div className={`h-1 flex-1 overflow-hidden rounded-sm ${barBg}`}>
        <div
          className={`h-full rounded-sm ${fillColor}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span
        className={`font-mono text-[11px] font-medium ${
          live ? "text-background" : "text-foreground"
        }`}
      >
        {max}
      </span>
    </div>
  );
}

function CardActions({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-1.5">{children}</div>;
}

function Btn({
  children,
  primary,
  accent,
  ghost,
}: {
  children: React.ReactNode;
  primary?: boolean;
  accent?: boolean;
  ghost?: boolean;
}) {
  const cls = primary
    ? "bg-primary text-primary-foreground hover:opacity-90"
    : accent
      ? "bg-accent text-[#0A1F17] hover:opacity-90"
      : ghost
        ? "bg-transparent text-muted-foreground hover:bg-secondary"
        : "border border-border bg-card text-foreground hover:bg-secondary";
  return (
    <button
      className={`rounded-md px-3 py-1.5 text-[12px] font-medium ${cls}`}
    >
      {children}
    </button>
  );
}

function Spec({
  trigger,
  action,
  location,
}: {
  trigger: string;
  action: string;
  location: string;
}) {
  return (
    <div className="flex flex-col gap-1 text-[12.5px] leading-[1.6] text-muted-foreground">
      <SpecRow k="trigger" v={trigger} />
      <SpecRow k="aksjon" v={action} />
      <SpecRow k="vises i" v={location} />
    </div>
  );
}

function SpecRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline gap-2.5">
      <span className="min-w-16 font-mono text-[10.5px] uppercase tracking-[0.06em] text-muted-foreground">
        {k}
      </span>
      <span className="text-foreground">{v}</span>
    </div>
  );
}

function FlowPill({
  variant,
  children,
}: {
  variant: "planned" | "warn" | "live" | "success" | "muted";
  children: React.ReactNode;
}) {
  const styles =
    variant === "planned"
      ? "bg-primary/10 text-primary"
      : variant === "warn"
        ? "bg-[#FFF0D6] text-[#B8852A]"
        : variant === "live"
          ? "bg-foreground text-accent"
          : variant === "success"
            ? "bg-[#E5F1EA] text-[#1A7D56]"
            : "bg-secondary text-muted-foreground";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-medium ${styles}`}
    >
      {children}
    </span>
  );
}
