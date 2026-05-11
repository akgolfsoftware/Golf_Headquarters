/**
 * PILOT — Klubb-admin · Foreldre-RSVP og samtykke
 * Bygd direkte fra wireframe/design-files-v2/screens/51-klubb-foreldre-rsvp-admin.html
 * URL: /klubb-rsvp-demo
 */

import { Search } from "lucide-react";

export default function KlubbRsvpDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1280px] px-8 py-10">
        <div className="mb-5 flex items-end justify-between gap-6">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              GFGK Klubb-portal · Foreldre-RSVP og samtykke
            </div>
            <h1 className="mt-1 font-display text-[28px] font-semibold tracking-tight leading-[1.1]">
              Utestående RSVP og samtykker
            </h1>
            <p className="mt-2 max-w-[540px] text-[13px] leading-[1.5] text-muted-foreground">
              Følg opp foresatte som ikke har bekreftet påmelding eller fullført BankID-samtykke.
              Klubb-mal og kanal velges per purring; SMS sendes via Telia for U18.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="rounded-md border border-border bg-transparent px-3 py-2 text-[12px] font-medium hover:bg-secondary">
              Eksporter rapport
            </button>
            <button className="rounded-md bg-primary px-3 py-2 text-[12px] font-medium text-primary-foreground">
              Send dagens purring → 14
            </button>
          </div>
        </div>

        {/* Funnel */}
        <div className="mb-5 grid grid-cols-5 gap-2.5">
          <FnStep label="Invitert" v="62" sub="" conv="100 % baseline · 3 turneringer" />
          <FnStep label="Åpnet e-post" v="54" sub="87 %" conv="↑ 12 % mot snitt" />
          <FnStep label="RSVP bekreftet" v="45" sub="73 %" conv="3 avslag · 14 venter" />
          <FnStep label="BankID-samtykke" v="42" sub="68 %" conv="3 påbegynt · 0 fullført siste 24 t" warn />
          <FnStep label="Klar for tee" v="42" sub="68 %" conv="Tap: 20 spillere (32 %) i hovedsak samtykke" last />
        </div>

        <div className="grid grid-cols-[1fr_320px] gap-5">
          <section className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between gap-3 border-b border-border bg-secondary px-5 py-3">
              <h3 className="font-display text-[14px] font-semibold tracking-tight">
                14 utestående · sortert på alder
              </h3>
              <div className="font-mono text-[11px] tracking-[0.04em] text-muted-foreground">
                filter:{" "}
                <b className="font-semibold text-foreground">type=RSVP+samtykke</b> ·{" "}
                <b className="font-semibold text-foreground">status=venter|påbegynt</b>
              </div>
              <div className="flex min-w-[220px] items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5">
                <Search className="h-3 w-3 text-muted-foreground" strokeWidth={1.5} />
                <input
                  type="text"
                  placeholder="søk spiller eller foresatt"
                  className="flex-1 border-none bg-transparent text-[12px] outline-none"
                />
              </div>
            </div>

            {/* Bulk bar */}
            <div className="flex items-center justify-between bg-foreground px-5 py-3 text-background">
              <div className="font-mono text-[11px] tracking-[0.04em]">
                <b className="font-semibold text-accent">3</b> valgt · 2 RSVP, 1 samtykke
              </div>
              <div className="flex gap-2">
                <button className="rounded-sm border border-[rgba(209,248,67,0)] bg-accent px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-[#0A1F17]">
                  Send påminnelse
                </button>
                <button className="rounded-sm border border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.12)] px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.04em]">
                  Eskaler til foreldre-koordinator
                </button>
                <button className="rounded-sm border border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.12)] px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.04em]">
                  Marker som avslått
                </button>
              </div>
            </div>

            <div className="grid grid-cols-[32px_1fr_1fr_110px_130px_120px_120px] gap-2.5 border-b border-border bg-secondary px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              <span />
              <span>Spiller</span>
              <span>Arrangement</span>
              <span>Type</span>
              <span>Sendt / Frist</span>
              <span>Alder</span>
              <span>Handling</span>
            </div>

            <Row
              urgent
              selected
              initials="NB"
              name="Noa Berge"
              sub="13 år · forelder: Lise Berge"
              eventTitle="NM Q-school R1"
              eventSub="20.05 · Larvik · buss 07:30"
              type="RSVP venter"
              typeTone="warn"
              sent="sendt 06.05"
              frist="frist 17.05"
              age="7 dgr"
              ageTone="over"
              actions={["Ring", "SMS"]}
            />
            <Row
              urgent
              selected
              initials="NB"
              name="Noa Berge"
              sub="13 år · forelder: Lise Berge"
              eventTitle="NM Q-school R1"
              eventSub="BankID-samtykke (foto/video)"
              type="samtykke påbegynt"
              typeTone="warn"
              sent="startet 09.05"
              frist="ikke fullført"
              age="5 dgr"
              ageTone="warn"
              actions={["Re-send lenke", "Ring"]}
            />
            <Row
              selected
              initials="LF"
              name="Liva Forsberg"
              sub="14 år · forelder: Marit Forsberg"
              eventTitle="Klubbmesterskap J U16"
              eventSub="25.05 · GFGK hjemmebane"
              type="RSVP venter"
              typeTone="warn"
              sent="sendt 10.05"
              frist="frist 22.05"
              age="4 dgr"
              ageTone="warn"
              actions={["Ring", "SMS"]}
            />
            <Row
              initials="JN"
              name="Jonas Næss"
              sub="16 år · selvstendig · forelder: Even Næss"
              eventTitle="Asker Open U18"
              eventSub="02.06 · Asker GK"
              type="RSVP venter"
              typeTone="warn"
              sent="sendt 11.05"
              frist="frist 25.05"
              age="3 dgr"
              ageTone="warn"
              actions={["Send purring", "Vis"]}
            />
            <Row
              initials="SK"
              name="Sebastian Kvist"
              sub="15 år · forelder: Henrik Kvist"
              eventTitle="Asker Open U18"
              eventSub="02.06 · Asker GK"
              type="samtykke ikke startet"
              typeTone="warn"
              sent="sendt 11.05"
              frist="frist 28.05"
              age="3 dgr"
              ageTone="warn"
              actions={["Send purring", "Vis"]}
            />
            <Row
              initials="EH"
              name="Embla Holt"
              sub="13 år · forelder: Karin Holt"
              eventTitle="Klubbmesterskap J U14"
              eventSub="25.05 · GFGK"
              type="RSVP venter"
              typeTone="warn"
              sent="sendt 12.05"
              frist="frist 22.05"
              age="2 dgr"
              actions={["Send purring", "Vis"]}
            />
            <Row
              initials="+8"
              avTone="muted"
              name="… og 8 spillere til"
              sub="visningsfilter aktivt · trykk for fullsorten"
              eventTitle="Blandet"
              eventSub="3 arrangementer i mai/juni"
              type="venter ≤ 2 dgr"
              typeTone="muted"
              sent="—"
              frist="—"
              age="1–2 dgr"
              actions={["Vis alle"]}
            />
          </section>

          <div>
            <section className="mb-3 rounded-xl border border-border bg-card p-5">
              <h4 className="mb-3 font-display text-[13px] font-semibold tracking-tight">
                Send purring · forhåndsvisning
              </h4>
              <div className="rounded-md bg-secondary p-3 font-mono text-[11px] leading-[1.6] tracking-[0.02em] text-muted-foreground">
                Hei <Tk>forelder_navn</Tk>,<br />
                <br />
                Vi mangler bekreftelse for <Tk>spiller</Tk> til <Tk>arrangement</Tk> <Tk>dato</Tk>.
                <br />
                <br />
                Frist: <Tk>frist</Tk>. Bekreft her: <Tk>lenke</Tk>
                <br />
                <br />
                Mvh, Anders · GFGK
              </div>
              <div className="mt-3 flex gap-2">
                <button className="flex-1 rounded-md border border-border bg-transparent px-3 py-2 text-[12px] font-medium hover:bg-secondary">
                  Endre mal
                </button>
                <button className="flex-1 rounded-md bg-primary px-3 py-2 text-[12px] font-medium text-primary-foreground">
                  Send til 3 valgte
                </button>
              </div>
            </section>

            <section className="mb-3 rounded-xl border border-border bg-card p-5">
              <h4 className="mb-3 font-display text-[13px] font-semibold tracking-tight">
                Kanaler og svar-rate (siste 30 dgr)
              </h4>
              <div className="flex flex-col gap-2">
                <ChanRow l="E-post" pct="67 %" det="svar · 142 sendt" />
                <ChanRow l="SMS · Telia" pct="89 %" det="svar · 38 sendt" />
                <ChanRow l="Push · app" pct="54 %" det="svar · 98 sendt" />
                <ChanRow l="Anbefalt: SMS for U18" pct="+22 %" det="snitt" highlight />
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-5">
              <h4 className="mb-3 font-display text-[13px] font-semibold tracking-tight">
                Eskalering · &gt; 5 dgr
              </h4>
              <div className="flex flex-col gap-2 font-mono text-[11px] tracking-[0.02em] text-muted-foreground">
                <div className="flex justify-between rounded-md border border-[rgba(163,45,45,0.18)] bg-[rgba(163,45,45,0.06)] px-3 py-2">
                  <span>
                    <b className="block font-sans text-[12px] font-medium text-foreground">
                      Noa Berge · 7 dgr
                    </b>
                    RSVP + samtykke begge mangler
                  </span>
                  <span className="font-bold text-destructive">eskaler</span>
                </div>
                <div className="rounded-md bg-secondary px-3 py-2">
                  →{" "}
                  <b className="font-semibold text-foreground">Foreldre-koordinator:</b> Kari Strøm tar
                  telefon i dag 16:00.
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function FnStep({ label, v, sub, conv, warn, last }: { label: string; v: string; sub?: string; conv: string; warn?: boolean; last?: boolean }) {
  return (
    <div
      className={`relative rounded-lg border p-4 ${
        warn ? "border-[rgba(184,133,42,0.30)] bg-[#FFF6E0]" : "border-border bg-card"
      }`}
    >
      <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div className={`mt-1 font-display text-[22px] font-semibold tracking-tight ${warn ? "text-[#6F500B]" : "text-foreground"}`}>
        {v}
        {sub && <span className="ml-1.5 font-mono text-[11px] font-medium text-muted-foreground tracking-[0.04em]">{sub}</span>}
      </div>
      <div className="mt-1.5 font-mono text-[10px] tracking-[0.02em] text-muted-foreground">{conv}</div>
      {!last && (
        <span
          className="absolute right-[-10px] top-1/2 -translate-y-1/2"
          style={{
            width: 0,
            height: 0,
            borderTop: "7px solid transparent",
            borderBottom: "7px solid transparent",
            borderLeft: "7px solid var(--border,#E5E3DD)",
          }}
        />
      )}
    </div>
  );
}

function Row({
  urgent,
  selected,
  initials,
  avTone,
  name,
  sub,
  eventTitle,
  eventSub,
  type,
  typeTone,
  sent,
  frist,
  age,
  ageTone,
  actions,
}: {
  urgent?: boolean;
  selected?: boolean;
  initials?: string;
  avTone?: "muted";
  name: string;
  sub: string;
  eventTitle: string;
  eventSub: string;
  type: string;
  typeTone?: "warn" | "muted";
  sent: string;
  frist: string;
  age: string;
  ageTone?: "over" | "warn";
  actions: string[];
}) {
  const ageStyle =
    ageTone === "over"
      ? "text-destructive font-bold"
      : ageTone === "warn"
        ? "text-[#B8852A] font-bold"
        : "text-muted-foreground";
  return (
    <div
      className={`grid grid-cols-[32px_1fr_1fr_110px_130px_120px_120px] items-center gap-2.5 border-b border-[var(--line-soft,#EFEDE6)] px-5 py-3 last:border-b-0 hover:bg-secondary ${
        urgent ? "bg-[rgba(163,45,45,0.04)]" : ""
      }`}
    >
      <span
        className={`grid h-4 w-4 place-items-center rounded-sm border-[1.5px] ${
          selected ? "border-primary bg-primary text-white" : "border-border"
        }`}
      >
        {selected && <span className="text-[10px] font-bold leading-none">✓</span>}
      </span>
      <div className="flex items-center gap-2">
        <span
          className={`grid h-7 w-7 place-items-center rounded-full font-display text-[11px] font-semibold ${
            avTone === "muted"
              ? "bg-foreground text-background"
              : "bg-[rgba(0,88,64,0.06)] text-primary"
          }`}
        >
          {initials}
        </span>
        <div>
          <div className="text-[13px] font-medium leading-tight">{name}</div>
          <div className="mt-0.5 font-mono text-[10px] tracking-[0.02em] text-muted-foreground">{sub}</div>
        </div>
      </div>
      <div className="font-mono text-[12px] tracking-[0.02em] text-muted-foreground">
        <b className="block font-sans text-[12px] font-medium text-foreground">{eventTitle}</b>
        {eventSub}
      </div>
      <span
        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
          typeTone === "warn"
            ? "bg-[#FFF0D6] text-[#B8852A]"
            : "bg-secondary text-muted-foreground"
        }`}
      >
        {type}
      </span>
      <div className="font-mono text-[11px] tracking-[0.02em] text-muted-foreground">
        <b className="block font-semibold tracking-[0.02em] text-foreground">{sent}</b>
        {frist}
      </div>
      <span className={`font-mono text-[11px] tracking-[0.04em] ${ageStyle}`}>{age}</span>
      <div className="flex gap-1.5">
        {actions.map((a, i) => (
          <button
            key={a}
            className={`rounded-sm px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] ${
              i === 0
                ? "bg-foreground text-background"
                : "border border-border bg-transparent text-muted-foreground"
            }`}
          >
            {a}
          </button>
        ))}
      </div>
    </div>
  );
}

function Tk({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-sm bg-[rgba(0,88,64,0.10)] px-1 py-0.5 text-primary">{`{{${children}}}`}</span>
  );
}

function ChanRow({ l, pct, det, highlight }: { l: string; pct: string; det: string; highlight?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between rounded-md px-3 py-2.5 text-[12px] ${
        highlight ? "border border-[rgba(0,88,64,0.20)] bg-[rgba(0,88,64,0.06)]" : "bg-secondary"
      }`}
    >
      <span className={highlight ? "text-primary" : ""}>
        {highlight ? (
          <>
            <b className="font-semibold">Anbefalt:</b> SMS for U18
          </>
        ) : (
          l
        )}
      </span>
      <span
        className={`font-mono font-semibold tracking-[0.02em] ${
          highlight ? "text-primary" : "text-foreground"
        }`}
      >
        <b className={`font-semibold ${highlight ? "" : "text-[var(--status-success,#1A7D56)]"}`}>{pct}</b>{" "}
        {det}
      </span>
    </div>
  );
}
