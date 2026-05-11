/**
 * PILOT — Klubb-admin · Lagoppstilling og RSVP
 * Bygd direkte fra wireframe/design-files-v2/screens/48-klubb-lagoppstilling.html
 * URL: /klubb-lagoppstilling-demo
 */

import { AlertTriangle, Check, Plus } from "lucide-react";

export default function KlubbLagoppstillingDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1280px] px-8 py-10">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              GFGK Klubb-portal · Lagoppstilling
            </div>
            <h1 className="mt-1 font-display text-[32px] font-semibold tracking-tight leading-[1.1]">
              Lagoppstilling og RSVP
            </h1>
          </div>
        </div>

        {/* Tournament hero */}
        <section className="mb-5 flex justify-between gap-6 overflow-hidden rounded-2xl border border-border bg-[#0A1F17] p-7 text-[#F5F4EE]">
          <div>
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-accent">
              Q-school · Tour · Strokeplay 54
            </div>
            <h2 className="mt-2 font-display text-[26px] font-semibold leading-tight tracking-tight">
              NM Q-school R1 · Larvik
            </h2>
            <p className="mt-2 max-w-[520px] text-[13px] leading-[1.5] text-[rgba(245,244,238,0.6)]">
              3 dagers strokeplay med cut etter R2. 18 spillere fra hver klubb · cut topp 50 %.
              Klubb-pott på 60 000 kr fra Storebrand.
            </p>
            <div className="mt-4 flex flex-wrap gap-6 font-mono text-[11px] tracking-[0.04em] text-[rgba(245,244,238,0.55)]">
              <span>Når: <b className="font-medium text-white">20.05 – 22.05.2026</b></span>
              <span>Bane: <b className="font-medium text-white">Larvik GK (par 71)</b></span>
              <span>Tee-off R1: <b className="font-medium text-white">09:00</b></span>
              <span>Sponsor: <b className="font-medium text-white">Storebrand Liv</b></span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button className="rounded-md bg-accent px-3 py-2 text-[12px] font-semibold text-[#0A1F17]">
              Send påminnelse → 2 spillere
            </button>
            <button className="rounded-md border border-[rgba(245,244,238,0.15)] bg-[rgba(245,244,238,0.08)] px-3 py-2 text-[12px] font-medium text-[#F5F4EE]">
              Forhåndsvis startliste
            </button>
            <button className="rounded-md border border-[rgba(245,244,238,0.15)] bg-[rgba(245,244,238,0.08)] px-3 py-2 text-[12px] font-medium text-[#F5F4EE]">
              Eksporter CSV
            </button>
          </div>
        </section>

        <div className="grid grid-cols-[1fr_320px] gap-5">
          <div>
            <section className="mb-4 overflow-hidden rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border bg-secondary px-5 py-3">
                <h3 className="font-display text-[14px] font-semibold tracking-tight">
                  Påmeldte fra GFGK{" "}
                  <em className="font-normal italic text-muted-foreground">· 5 av 7 RSVP</em>
                </h3>
                <div className="flex gap-1">
                  {["Liste", "Flights", "Tee-tider"].map((t, i) => (
                    <span
                      key={t}
                      className={`rounded-sm px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] ${
                        i === 0 ? "bg-foreground text-background" : "text-muted-foreground"
                      }`}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <RosterHead />
              <RosterRow initials="MR" name="Markus Roinås Pedersen" sub="16 · guttejunior" hcp="+2,4" tee="hvit" rsvpOk consent="OK · BankID" consentOk flight="A · 09:00" />
              <RosterRow initials="SK" name="Sondre Karlsen" sub="17 · gutt" hcp="1,2" tee="hvit" rsvpOk consent="OK · BankID" consentOk flight="A · 09:12" />
              <RosterRow initials="EH" name="Eira Hopstad" sub="15 · pikejunior" hcp="2,8" tee="gul" rsvpOk consent="OK · BankID" consentOk flight="A · 09:24" />
              <RosterRow initials="TF" name="Tobias Fjell" sub="18 · senior" hcp="0,6" tee="hvit" rsvpOk consent="OK" consentOk flight="B · 09:36" />
              <RosterRow initials="RJ" name="Ruth Johansen" sub="14 · pikejunior" hcp="4,1" tee="rød" rsvpOk consent="venter video-samtykke" consentWarn flight="B · 09:48" />
              <RosterRow initials="NB" name="Noa Berge" sub="13 · gutt" hcp="8,2" tee="blå" rsvpWarn consent="BankID ikke fullført" consentWarn flight="—" rowTone="warn" />
              <RosterRow initials="JN" name="Jonas Næss" sub="16 · gutt" hcp="3,4" tee="hvit" rsvpDanger consent="—" flight="—" rowTone="danger" />
              <div className="flex cursor-pointer items-center justify-center gap-2 border-t border-dashed border-border bg-secondary py-3 font-mono text-[12px] tracking-[0.04em] text-muted-foreground hover:bg-[rgba(0,88,64,0.06)] hover:text-primary">
                <Plus className="h-3.5 w-3.5" strokeWidth={1.5} /> Legg til spiller fra klubb-rosteren
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border bg-secondary px-5 py-3">
                <h3 className="font-display text-[14px] font-semibold tracking-tight">
                  Flights · R1 første tee
                </h3>
                <span className="rounded-full bg-[rgba(0,88,64,0.06)] px-2.5 py-1 text-[10px] font-medium text-primary">
                  drag og drop · auto-sortert på HCP
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 p-4">
                <FlightCard
                  title="Flight A · 09:00"
                  hcpRange="HCP +2,4 → 2,8"
                  rows={[
                    ["1. Markus Roinås Pedersen", "+2,4 · 09:00"],
                    ["2. Sondre Karlsen", "1,2 · 09:12"],
                    ["3. Eira Hopstad", "2,8 · 09:24"],
                  ]}
                />
                <FlightCard
                  title="Flight B · 09:36"
                  hcpRange="HCP 0,6 → 4,1"
                  rows={[
                    ["4. Tobias Fjell", "0,6 · 09:36"],
                    ["5. Ruth Johansen", "4,1 · 09:48"],
                  ]}
                  warnRow={["6. Noa Berge — venter RSVP", "10:00?"]}
                />
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div>
            <section className="mb-4 rounded-xl border border-border bg-card p-5">
              <h4 className="mb-3 font-display text-[13px] font-semibold tracking-tight">RSVP-status</h4>
              <div className="flex items-center gap-4">
                <Donut />
                <div className="flex flex-1 flex-col gap-1.5 font-mono text-[11px] tracking-[0.04em] text-muted-foreground">
                  <LegRow color="var(--status-success,#1A7D56)" label="Bekreftet" v="5" />
                  <LegRow color="#B8852A" label="Venter foresatt" v="1" />
                  <LegRow color="var(--destructive,#A32D2D)" label="Avslått" v="1" />
                  <LegRow color="var(--border,#E5E3DD)" label="Mangler svar" v="0" />
                </div>
              </div>
            </section>

            <section className="mb-4 flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
              <h4 className="font-display text-[13px] font-semibold tracking-tight">Påminnelser</h4>
              <div className="flex gap-2.5 rounded-md border border-[rgba(184,133,42,0.30)] bg-[#FFF6E0] p-3 text-[12px] leading-[1.4] text-[#6F500B]">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 text-[#B8852A]" strokeWidth={1.5} />
                <div>
                  <b className="font-semibold">2 spillere mangler bekreftelse</b> · Noa Berge (foresatt
                  ikke signert), Jonas Næss (avslått).
                </div>
              </div>
              <div className="flex gap-2.5 rounded-md border border-[rgba(26,125,86,0.25)] bg-[rgba(26,125,86,0.12)] p-3 text-[12px] leading-[1.4] text-[var(--status-success,#1A7D56)]">
                <Check className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
                <div>
                  <b className="font-semibold">Alle samtykker oppdaterte</b> for de 5 bekreftede.
                </div>
              </div>
              <div className="rounded-md bg-[#0A1F17] p-4 text-[#F5F4EE]">
                <h5 className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-[rgba(245,244,238,0.55)]">
                  Send påminnelse
                </h5>
                <p className="mt-2 text-[12px] leading-[1.5] text-[rgba(245,244,238,0.85)]">
                  Til foresatte for Noa Berge — BankID-samtykke + RSVP. Mal: «forelder-rsvp-r1».
                </p>
                <button className="mt-3 w-full rounded-md bg-accent px-3 py-2 text-[12px] font-semibold text-[#0A1F17]">
                  Send via e-post + SMS
                </button>
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-5">
              <h4 className="mb-3 font-display text-[13px] font-semibold tracking-tight">Logistikk</h4>
              <div className="flex flex-col gap-1.5 font-mono text-[11px] tracking-[0.02em] text-muted-foreground">
                <LogRow l="Buss · oppmøte" v="GFGK klubbhus 07:30" />
                <LogRow l="Reisetid" v="~1 t 25 min" />
                <LogRow l="Lunsj inkludert" v="ja · 3 dgr" tone="success" />
                <LogRow l="Overnatting" v="Scandic Larvik · delt rom" />
                <LogRow l="Coach på stedet" v="Anders K. + Lars Hammer" />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function RosterHead() {
  return (
    <div className="grid grid-cols-[36px_1fr_80px_90px_100px_130px_90px_28px] gap-3 border-b border-border bg-secondary px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
      <span />
      <span>Spiller</span>
      <span>HCP</span>
      <span>Tee</span>
      <span>RSVP</span>
      <span>Samtykke</span>
      <span>Flight</span>
      <span />
    </div>
  );
}

function RosterRow({
  initials,
  name,
  sub,
  hcp,
  tee,
  flight,
  consent,
  consentOk,
  consentWarn,
  rsvpOk,
  rsvpWarn,
  rsvpDanger,
  rowTone,
}: {
  initials: string;
  name: string;
  sub: string;
  hcp: string;
  tee: string;
  flight: string;
  consent: string;
  consentOk?: boolean;
  consentWarn?: boolean;
  rsvpOk?: boolean;
  rsvpWarn?: boolean;
  rsvpDanger?: boolean;
  rowTone?: "warn" | "danger";
}) {
  const bg =
    rowTone === "warn"
      ? "bg-[rgba(184,133,42,0.04)]"
      : rowTone === "danger"
        ? "bg-[rgba(163,45,45,0.04)]"
        : "";
  const avBg =
    rowTone === "warn"
      ? "bg-[#FFF0D6] text-[#B8852A]"
      : rowTone === "danger"
        ? "bg-[rgba(163,45,45,0.10)] text-destructive"
        : "bg-[rgba(0,88,64,0.06)] text-primary";
  return (
    <div className={`grid grid-cols-[36px_1fr_80px_90px_100px_130px_90px_28px] items-center gap-3 border-b border-[var(--line-soft,#EFEDE6)] px-5 py-3 last:border-b-0 hover:bg-secondary ${bg}`}>
      <span className={`grid h-8 w-8 place-items-center rounded-full font-display text-[11px] font-semibold ${avBg}`}>
        {initials}
      </span>
      <div>
        <div className="text-[13px] font-medium leading-none">{name}</div>
        <div className="mt-1 font-mono text-[10px] tracking-[0.02em] text-muted-foreground">{sub}</div>
      </div>
      <span className="font-mono text-[12px] font-medium tracking-[0.04em] text-foreground">{hcp}</span>
      <span className="font-mono text-[12px] font-medium tracking-[0.04em] text-foreground">{tee}</span>
      <span
        className={`rounded-full px-2 py-0.5 text-center text-[10px] font-medium ${
          rsvpOk
            ? "bg-[rgba(26,125,86,0.12)] text-[var(--status-success,#1A7D56)]"
            : rsvpWarn
              ? "bg-[#FFF0D6] text-[#B8852A]"
              : rsvpDanger
                ? "bg-[rgba(163,45,45,0.10)] text-destructive"
                : "bg-secondary text-muted-foreground"
        }`}
      >
        {rsvpOk ? "bekreftet" : rsvpWarn ? "venter foresatt" : rsvpDanger ? "avslått" : "—"}
      </span>
      <span
        className={`rounded-full px-2 py-0.5 text-center text-[10px] font-medium ${
          consentOk
            ? "bg-[rgba(26,125,86,0.12)] text-[var(--status-success,#1A7D56)]"
            : consentWarn
              ? "bg-[#FFF0D6] text-[#B8852A]"
              : "bg-secondary text-muted-foreground"
        }`}
      >
        {consent}
      </span>
      <span className="font-mono text-[12px] font-semibold tracking-[0.02em] text-foreground">{flight}</span>
      <span className="text-center text-muted-foreground">⋮</span>
    </div>
  );
}

function FlightCard({ title, hcpRange, rows, warnRow }: { title: string; hcpRange: string; rows: [string, string][]; warnRow?: [string, string] }) {
  return (
    <div className="rounded-md border border-border bg-secondary p-3">
      <div className="mb-2.5 flex items-baseline justify-between">
        <span className="font-display text-[13px] font-semibold tracking-tight">{title}</span>
        <span className="font-mono text-[10px] tracking-[0.04em] text-muted-foreground">{hcpRange}</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {rows.map(([n, t]) => (
          <div
            key={n}
            className="flex justify-between rounded-md border border-border bg-card px-3 py-2 text-[12px] text-foreground"
          >
            <span>{n}</span>
            <b className="font-mono font-medium text-muted-foreground">{t}</b>
          </div>
        ))}
        {warnRow && (
          <div className="flex justify-between rounded-md border border-dashed border-[rgba(184,133,42,0.40)] bg-[rgba(184,133,42,0.10)] px-3 py-2 text-[12px] text-[#6F500B]">
            <span>{warnRow[0]}</span>
            <b className="font-mono font-medium">{warnRow[1]}</b>
          </div>
        )}
      </div>
    </div>
  );
}

function Donut() {
  return (
    <div className="relative h-[100px] w-[100px]">
      <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border,#E5E3DD)" strokeWidth="14" />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="var(--status-success,#1A7D56)"
          strokeWidth="14"
          strokeDasharray="263.9"
          strokeDashoffset="76"
          strokeLinecap="round"
        />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="#B8852A"
          strokeWidth="14"
          strokeDasharray="263.9"
          strokeDashoffset="226"
          strokeLinecap="round"
          transform="rotate(102 50 50)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <b className="font-display text-[18px] font-semibold tracking-tight">5/7</b>
        <small className="font-mono text-[10px] tracking-[0.04em] text-muted-foreground">RSVP</small>
      </div>
    </div>
  );
}

function LegRow({ color, label, v }: { color: string; label: string; v: string }) {
  return (
    <div className="flex justify-between">
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
        {label}
      </span>
      <b className="font-medium text-foreground">{v}</b>
    </div>
  );
}

function LogRow({ l, v, tone }: { l: string; v: string; tone?: "success" }) {
  return (
    <div className="flex justify-between">
      <span>{l}</span>
      <b className={`font-medium ${tone === "success" ? "text-[var(--status-success,#1A7D56)]" : "text-foreground"}`}>{v}</b>
    </div>
  );
}
