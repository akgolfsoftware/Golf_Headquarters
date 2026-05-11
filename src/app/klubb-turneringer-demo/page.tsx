/**
 * PILOT — Klubb-admin · Turneringsoversikt
 * Bygd direkte fra wireframe/design-files-v2/screens/47-klubb-turneringer.html
 * URL: /klubb-turneringer-demo
 */

import { Plus, Search } from "lucide-react";

export default function KlubbTurneringerDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1280px] px-8 py-10">
        <div className="mb-6 flex items-end justify-between gap-6">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              GFGK Klubb-portal · Turneringer
            </div>
            <h1 className="mt-1 font-display text-[32px] font-semibold tracking-tight leading-[1.1]">
              Turneringer{" "}
              <em className="font-normal italic text-muted-foreground">· sesong 2026</em>
            </h1>
            <p className="mt-2 max-w-[640px] text-[13px] leading-[1.55] text-muted-foreground">
              12 totalt · 2 pågående · 8 kommende · 2 ferdige. Klikk en turnering for å se lagoppstilling,
              RSVP-status og resultatregistrering.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="rounded-md border border-border bg-transparent px-3 py-2 text-[12px] font-medium hover:bg-secondary">
              Eksporter alle
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-[12px] font-medium text-primary-foreground">
              <Plus className="h-3.5 w-3.5" strokeWidth={1.5} /> Ny turnering
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-5 grid grid-cols-5 gap-3">
          <Stat label="Totalt 2026" v="12" sub="turn." delta="+3 vs 2025" tone="up" />
          <Stat label="Påmeldte (alle)" v="284" sub="spillere" delta="+18 % vs i fjor" tone="up" />
          <Stat label="RSVP-rate" v="87" sub="%" delta="over mål 80 %" tone="up" />
          <Stat label="Junior-andel" v="42" sub="%" delta="+9 pp · på vei opp" tone="up" />
          <Stat label="Snittscore klubb" v="74,8" sub="brutto" delta="−0,4 vs forrige uke" tone="down" />
        </div>

        {/* Filters */}
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <Segment options={["Alle (12)", "Pågående (2)", "Kommende (8)", "Ferdig (2)"]} active={0} />
          <Segment options={["Alle tiers", "Klubb", "Krets", "Tour"]} active={0} />
          <div className="flex flex-1 items-center gap-2 rounded-md border border-border bg-card px-3 py-2 font-mono text-[11px] text-muted-foreground">
            <Search className="h-3 w-3" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Søk turnering, dato, bane …"
              className="flex-1 border-none bg-transparent text-[12px] text-foreground outline-none"
            />
          </div>
          <button className="rounded-md border border-border bg-card px-3 py-2 text-[12px] font-medium hover:bg-secondary">
            Sortér · dato
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-4">
          <TCard
            tier="KRETS · KLASSE A+B"
            live="LIVE R2"
            name="Borre Open 2026"
            when="11.05 – 12.05 · Borre GK · 36 hull"
            rows={[
              ["Format", "strokeplay · brutto"],
              ["Påmeldte fra klubb", "14 spillere"],
              ["Leder etter R1", "Markus Pedersen · 72"],
            ]}
            roster={["MR", "SK", "EH", "JN", "TF"]}
            more="+9"
            pct={55}
            pctLabel="R2 i gang · 39/72 hull"
          />
          <TCard
            tier="KLUBB · JUNIOR"
            live="LIVE"
            name="Tirsdagsfighten · uke 19"
            when="11.05 17:00 · GFGK · 9 hull"
            rows={[
              ["Format", "scramble · 4-baller"],
              ["Lag", "6 lag · 24 spillere"],
              ["Leder", "Lag «Hagle» · −5"],
            ]}
            roster={["EP", "LH", "NR", "TK"]}
            more="+20"
            pct={67}
            pctLabel="6/9 hull spilt"
          />
          <TCard
            tier="TOUR · NM Q-SCHOOL"
            soon="om 9 dgr"
            name="NM Q-school R1"
            when="20.05 – 22.05 · Larvik GK · 54 hull"
            rows={[
              ["Format", "strokeplay · cut etter R2"],
              ["RSVP · klubb", "5 av 7 påmeldt"],
              ["Frist påmelding", "17.05 23:59"],
            ]}
            roster={["MR", "SK", "EH", "TF", "RJ"]}
            footerWarn="2 RSVP åpen"
          />
          <TCard
            tier="KLUBB · MATCHPLAY"
            soon="om 12 dgr"
            name="Klubbmesterskap matchplay"
            when="23.05 – 25.05 · GFGK · 36 hull"
            rows={[
              ["Format", "matchplay · bracket av 32"],
              ["RSVP · klubb", "28 av 32 påmeldt"],
              ["Sponsor", "Storebrand Liv"],
            ]}
            roster={["AH", "TG", "FO", "NR"]}
            more="+24"
            pct={88}
            pctLabel="88 % av brackets fylt"
          />
          <TCard
            tier="KRETS · LADIES"
            soon="om 18 dgr"
            name="Ladies Open · Tyrifjord"
            when="29.05 – 30.05 · Tyrifjord GK · 18 hull"
            rows={[
              ["Format", "strokeplay · netto"],
              ["RSVP · klubb", "8 av 10 påmeldt"],
              ["Frist", "26.05"],
            ]}
            roster={["AH", "EH", "LB", "FO"]}
            more="+4"
            footerNote="Sponset transport · 07:30"
            footerChip="åpen"
          />
          <TCard
            tier="KLUBB · OPP-START"
            soon="om 25 dgr"
            name="Sommer Series R1/8"
            when="05.06 17:00 · GFGK · 18 hull"
            rows={[
              ["Format", "stableford · åpen klasse"],
              ["RSVP · klubb", "62 av ~80 plasser"],
              ["Påmelding åpen", "frem til 03.06"],
            ]}
            roster={["MR", "EP", "TF", "SK"]}
            more="+58"
            pct={78}
            pctLabel="78 % fylt"
          />
          <TCard
            tier="KLUBB · VINTER-CUP"
            done="FERDIG"
            name="Vinter-cup finale"
            when="28.04 · Mulligan Indoor"
            rows={[
              ["Vinner", "Markus Pedersen · 28 stbl"],
              ["Påmeldte", "18 spillere"],
              ["Rapport", "last ned PDF"],
            ]}
            roster={["MR", "TF", "SK", "EP"]}
            more="+14"
            footerNote="avsluttet for 13 dgr siden"
            footerChip="arkivert"
            footerChipTone="ok"
          />
          <TCard
            tier="KRETS · ÅPNING"
            done="FERDIG"
            name="Krets-åpning 2026"
            when="15.04 · Asker GK"
            rows={[
              ["Klubbplassering", "3 av 14 klubber"],
              ["Påmeldte", "12 spillere"],
              ["Beste runde", "S. Karlsen · 71"],
            ]}
            roster={["SK", "MR", "EH", "TF"]}
            more="+8"
            footerNote="avsluttet for 26 dgr siden"
            footerChip="arkivert"
            footerChipTone="ok"
          />
          <CreateCard />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, v, sub, delta, tone }: { label: string; v: string; sub: string; delta: string; tone: "up" | "down" }) {
  return (
    <div className="rounded-md border border-border bg-card px-4 py-3.5">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1.5 font-display text-[24px] font-semibold leading-none tracking-tight">
        {v}
        <span className="ml-1 font-mono text-[11px] font-medium text-muted-foreground tracking-[0.04em]">
          {sub}
        </span>
      </div>
      <div
        className={`mt-1.5 font-mono text-[10px] tracking-[0.04em] ${
          tone === "up" ? "text-[var(--status-success,#1A7D56)]" : "text-destructive"
        }`}
      >
        {delta}
      </div>
    </div>
  );
}

function Segment({ options, active }: { options: string[]; active: number }) {
  return (
    <div className="flex overflow-hidden rounded-md border border-border bg-card">
      {options.map((o, i) => (
        <button
          key={o}
          className={`border-r border-border px-3 py-2 text-[12px] last:border-r-0 ${
            i === active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-secondary"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function TCard({
  tier,
  live,
  soon,
  done,
  name,
  when,
  rows,
  roster,
  more,
  pct,
  pctLabel,
  footerNote,
  footerChip,
  footerChipTone,
  footerWarn,
}: {
  tier: string;
  live?: string;
  soon?: string;
  done?: string;
  name: string;
  when: string;
  rows: [string, string][];
  roster: string[];
  more?: string;
  pct?: number;
  pctLabel?: string;
  footerNote?: string;
  footerChip?: string;
  footerChipTone?: "ok";
  footerWarn?: string;
}) {
  return (
    <div className="flex cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-card hover:border-primary">
      <div
        className={`relative flex aspect-[16/7] flex-col justify-between p-4 text-white ${
          live ? "bg-gradient-to-br from-[#0A1F17] to-[#163027]" : done ? "bg-gradient-to-br from-[#23211D] to-[#0A1F17] opacity-90" : "bg-gradient-to-br from-[#163027] to-[#23323e]"
        }`}
      >
        <div className="flex items-start justify-between">
          <span className="rounded-sm bg-[rgba(255,255,255,0.10)] px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-[rgba(255,255,255,0.85)]">
            {tier}
          </span>
          {live && (
            <span className="inline-flex items-center gap-1.5 rounded-sm bg-destructive px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-white">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              {live}
            </span>
          )}
          {soon && (
            <span className="font-mono text-[9px] tracking-[0.04em] text-[rgba(255,255,255,0.7)]">
              {soon}
            </span>
          )}
          {done && (
            <span className="rounded-sm bg-[var(--ink-disabled,#C4C0B8)] px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-white">
              {done}
            </span>
          )}
        </div>
        <div>
          <div className="font-display text-[17px] font-semibold leading-tight tracking-tight">{name}</div>
          <div className="mt-1 font-mono text-[10px] tracking-[0.04em] text-[rgba(255,255,255,0.6)]">
            {when}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2.5 p-4">
        {rows.map(([k, v]) => (
          <div
            key={k}
            className="flex justify-between font-mono text-[11px] tracking-[0.02em] text-muted-foreground"
          >
            <span>{k}</span>
            <b className="font-medium text-foreground">{v}</b>
          </div>
        ))}
        <div className="mt-1 flex">
          {roster.map((r, i) => (
            <span
              key={i}
              className={`-ml-1.5 grid h-5 w-5 place-items-center rounded-full border-2 border-card font-display text-[9px] font-semibold ${
                i === 0 ? "ml-0 bg-[rgba(0,88,64,0.10)] text-primary" : "bg-[rgba(0,88,64,0.10)] text-primary"
              }`}
            >
              {r}
            </span>
          ))}
          {more && (
            <span className="-ml-1.5 grid h-5 w-7 place-items-center rounded-full border-2 border-card bg-foreground font-mono text-[9px] font-semibold text-background">
              {more}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-border bg-secondary px-4 py-2.5">
        {pct !== undefined ? (
          <>
            <div className="mr-3 h-1 flex-1 overflow-hidden rounded-full bg-border">
              <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
            </div>
            <span className="font-mono text-[10px] font-semibold tracking-[0.04em] text-muted-foreground">
              {pctLabel}
            </span>
          </>
        ) : (
          <>
            <span className="font-mono text-[10px] tracking-[0.04em] text-muted-foreground">
              {footerNote}
            </span>
            {footerChip && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  footerChipTone === "ok"
                    ? "bg-[rgba(26,125,86,0.12)] text-[var(--status-success,#1A7D56)]"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {footerChip}
              </span>
            )}
            {footerWarn && (
              <span className="rounded-full bg-[#FFF0D6] px-2 py-0.5 text-[10px] font-medium text-[#B8852A]">
                {footerWarn}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function CreateCard() {
  return (
    <div className="flex cursor-pointer flex-col overflow-hidden rounded-xl border border-dashed border-border bg-secondary">
      <div className="grid aspect-[16/7] place-items-center font-mono text-[11px] tracking-[0.04em] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Plus className="h-4 w-4" strokeWidth={1.5} /> Opprett ny turnering
        </span>
      </div>
      <div className="p-4">
        <div className="flex justify-between font-mono text-[11px] tracking-[0.02em] text-muted-foreground">
          <span>fra mal</span>
          <b className="font-medium text-foreground">klubb / krets / tour</b>
        </div>
      </div>
    </div>
  );
}
