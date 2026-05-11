/**
 * PILOT — PlayerHQ Treningsdetalj
 * Bygd direkte fra wireframe/design-files-v2/playerhq-C/10-treningsdetalj.html
 * URL: /treningsdetalj-demo
 *
 * Mock-data: 1:1-økt ons 13. mai 2026 mellom Markus Roinaas Pedersen
 * og coach Anders Kristiansen i Mulligan Studio 2.
 */

import { ArrowLeft, Check, Plus, LayoutGrid, Activity, Video, FileText, Paperclip, Tag } from "lucide-react";

export default function TreningsdetaljDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1280px] px-6 py-8">
        {/* Back-link */}
        <a
          href="/tren-kalender-demo"
          className="mb-3.5 inline-flex items-center gap-1.5 font-mono text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Tilbake til kalender
        </a>

        {/* Header */}
        <header className="mb-6 grid grid-cols-[1fr_auto] items-end gap-6 border-b border-border pb-5">
          <div>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              /tren/økt · ID 4127 · Ons 13. mai 14:00–15:30
            </span>
            <h1 className="mt-2 font-display text-[48px] font-normal leading-[1.05] -tracking-[0.02em]">
              1:1 med <em className="italic text-primary">Anders</em> ·
              Pitch-loop
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-[13px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(60,142,109,0.13)] px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.04em] text-[#1A7D56]">
                <Check className="h-3 w-3" strokeWidth={3} />
                Gjennomført
              </span>
              <Dot />
              <span>
                <b className="font-medium text-foreground">90 min</b> faktisk ·
                90 planlagt
              </span>
              <Dot />
              <span>Mulligan Studio 2 · matte 4</span>
              <Dot />
              <span>62 slag · TrackMan 4</span>
              <Dot />
              <span>
                Plan:{" "}
                <b className="font-medium text-foreground">
                  Sørlandsåpent · uke 4/12
                </b>
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
              <button className="rounded-md border border-border bg-card px-3.5 py-2 text-[12.5px] font-medium text-foreground hover:bg-secondary">
                Del med coach
              </button>
              <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3.5 py-2 text-[12.5px] font-medium text-foreground hover:bg-secondary">
                <Plus className="h-3.5 w-3.5" />
                Logg refleksjon
              </button>
              <button className="rounded-md bg-primary px-3.5 py-2 text-[12.5px] font-semibold text-primary-foreground hover:opacity-90">
                Eksporter
              </button>
            </div>
            <div className="flex gap-1.5 font-mono text-[11.5px] text-muted-foreground">
              <span>← forrige økt</span>
              <span>·</span>
              <span>neste økt →</span>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="mb-6 flex gap-0 border-b border-border">
          <Tab active icon={<LayoutGrid className="h-3.5 w-3.5" />}>
            Oversikt
          </Tab>
          <Tab icon={<Activity className="h-3.5 w-3.5" />} badge="62">
            Slag & TrackMan
          </Tab>
          <Tab icon={<Video className="h-3.5 w-3.5" />} badge="8">
            Video
          </Tab>
          <Tab icon={<FileText className="h-3.5 w-3.5" />} badge="3">
            Notater & vedlegg
          </Tab>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-[1fr_320px] gap-7">
          {/* Main */}
          <div>
            {/* KPI */}
            <div className="mb-6 grid grid-cols-4 gap-3.5">
              <SumCard label="Slag totalt" value="62" delta="+8 vs forrige" deltaTone="up" />
              <SumCard label="Snitt-avvik" value="4,2" unit="m" delta="−1,1 m" deltaTone="up" />
              <SumCard
                label="Carry-SD"
                value="3,8"
                unit="m"
                delta="−0,7 m · stabilere"
                deltaTone="up"
              />
              <SumCard
                label="Intensitet"
                value="7,4"
                unit="/ 10"
                delta="Coach: «hardt nok»"
              />
            </div>

            {/* Pyramide-bidrag */}
            <div className="mb-6 rounded-xl border border-border bg-card p-4">
              <div className="mb-2 flex items-baseline justify-between">
                <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                  Pyramide-bidrag · denne økten
                </div>
                <div className="font-mono text-[11.5px] text-muted-foreground">
                  90 min
                </div>
              </div>
              <div className="flex h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="bg-[var(--color-pyr-slag)]"
                  style={{ width: "55%" }}
                />
                <div
                  className="bg-[var(--color-pyr-tek)]"
                  style={{ width: "28%" }}
                />
                <div
                  className="bg-[var(--color-pyr-spill)]"
                  style={{ width: "17%" }}
                />
              </div>
              <div className="mt-2 flex gap-4 font-mono text-[11px] text-muted-foreground">
                <PyrLegend tier="slag" label="SLAG · 50 m" />
                <PyrLegend tier="tek" label="TEK · 25 m" />
                <PyrLegend tier="spill" label="SPILL · 15 m" />
              </div>
            </div>

            {/* Coach note */}
            <div className="mb-6 grid grid-cols-[auto_1fr_auto] items-start gap-4 rounded-xl bg-primary p-6 text-primary-foreground">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-[#8FA56F] text-[15px] font-semibold text-white">
                AK
              </div>
              <div>
                <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.08em] opacity-70">
                  Anders Kristiansen · etter økten · 15:34
                </div>
                <div className="mt-2 font-display text-[22px] italic leading-[1.35]">
                  «Mye bedre tempo nedslag i dag. Sjekk video 04 — vi mister
                  enda litt i overgang. Hjemmelekse: 3×10 pitch 60m før
                  fredag.»
                </div>
                <div className="mt-2.5 flex flex-wrap gap-3 font-mono text-[12px] opacity-75">
                  <span className="inline-flex items-center gap-1">
                    <Video className="h-3 w-3" />
                    04-overgang
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Paperclip className="h-3 w-3" />
                    leksefil.pdf
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    pitch-tempo
                  </span>
                </div>
              </div>
              <button className="rounded-md border border-white/20 bg-white/15 px-3.5 py-2 text-[12.5px] font-medium text-white hover:bg-white/25">
                Svar
              </button>
            </div>

            {/* Blocks */}
            <div className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
              Økt-skjelett · 5 blokker
            </div>

            <Block
              pillLabel="TEK"
              pillTier="tek"
              name="Oppvarming · 7-jern halvsving"
              meta="14:00 – 14:12 · 12 min · 18 slag"
              actual="12:04 faktisk"
            >
              <BB label="Slag" value="18" />
              <BB label="Carry" value="128 m" />
              <BB label="SD" value="2,1" />
              <BB label="Smash" value="1,32" />
            </Block>

            <Block
              pillLabel="SLAG"
              pillTier="slag"
              name="Pitch 60 m · 3 baseline"
              meta="14:12 – 14:42 · 30 min · 22 slag"
              actual="31:12 faktisk"
              note="Sterkest blokk i dag — 9/22 innenfor 3m. Coach kommenterer: «Stol på spinn-tallene, ikke kompenser med tempo.»"
            >
              <BB label="Slag" value="22" />
              <BB label="Avvik snitt" value="4,2 m" />
              <BB label="SD" value="3,8" />
              <BB label="Angrep" value="−3,1°" />
            </Block>

            <Block
              pillLabel="TEK"
              pillTier="tek"
              name="Tempo-drill med metronom (75 BPM)"
              meta="14:42 – 15:02 · 20 min · 14 slag"
              actual="20:55 faktisk"
            >
              <BB label="Slag" value="14" />
              <BB label="Tempo-ratio" value="3,1 : 1" />
              <BB label="Rytme" value="stabil" />
              <BB label="Video" value="3 klipp" />
            </Block>

            <Block
              pillLabel="SLAG"
              pillTier="slag"
              name="Random pitch · 40 / 60 / 80m"
              meta="15:02 – 15:22 · 20 min · 8 slag"
              actual="19:48 faktisk"
            >
              <BB label="Slag" value="8" />
              <BB label="Proximitet" value="5,1 m" />
              <BB label="Innenfor 3m" value="3 / 8" />
              <BB label="Press-score" value="6,5/10" />
            </Block>

            <Block
              pillLabel="REFL"
              pillTier="turn"
              name="Refleksjon & video-debrief"
              meta="15:22 – 15:30 · 8 min"
              actual="8:12 faktisk"
            >
              <div className="col-span-4 text-[13px] leading-[1.55] text-foreground">
                Markus skrev: «Tempo-drillen ga aha-følelse. Følte at
                random-blokken var stressende, men proximitet ble bra mot
                slutten. Skal kjøre 3×10 før fredag.»
              </div>
            </Block>
          </div>

          {/* Right rail */}
          <div className="flex flex-col gap-3.5">
            <RailCard label="Metadata">
              <div className="mt-2">
                <Kv k="Coach" v="Anders K." />
                <Kv k="Sted" v="Mulligan 2" />
                <Kv k="Sensor" v="TrackMan 4" />
                <Kv k="Vær" v="innendørs" />
                <Kv k="Køller" v="PW · 56°" />
                <Kv k="Plan" v="SØA · uke 4" last />
              </div>
            </RailCard>

            <RailCard label="Opplevd intensitet">
              <div className="mt-1.5 font-mono text-[24px] font-medium">
                7,4{" "}
                <span className="text-[13px] text-muted-foreground">/ 10</span>
              </div>
              <div className="mt-1.5 flex gap-0.5">
                {Array.from({ length: 10 }, (_, i) => (
                  <div
                    key={i}
                    className={`h-4 flex-1 rounded-[3px] ${
                      i === 7
                        ? "bg-primary"
                        : i < 7
                          ? "bg-accent"
                          : "bg-secondary"
                    }`}
                  />
                ))}
              </div>
              <div className="mt-2.5 text-[11.5px] text-muted-foreground">
                RPE per blokk: 5 · 8 · 6 · 9 · 4
              </div>
            </RailCard>

            <RailCard label="Endret fra plan">
              <div className="mt-2 text-[13px] leading-[1.5] text-foreground">
                <PlanChange tag="+2 min" tagTone="warning">
                  Blokk 2 forlenget (4 ekstra slag)
                </PlanChange>
                <PlanChange tag="SWAP" tagTone="success">
                  Random byttet plass m/ tempo
                </PlanChange>
                <PlanChange tag="−4 slag" tagTone="muted" last>
                  Putting droppet — tidsbruk
                </PlanChange>
              </div>
            </RailCard>

            <RailCard label="Neste opp">
              <div className="mt-1.5 font-display text-[15px] font-semibold">
                Tor 14 · TrackMan-test
              </div>
              <div className="mt-0.5 text-[12px] text-muted-foreground">
                11:00 · Mulligan 1 · baseline før fase 3
              </div>
              <button className="mt-3 w-full rounded-md border border-border bg-card px-3 py-2 text-[12.5px] font-medium text-foreground hover:bg-secondary">
                Se økt →
              </button>
            </RailCard>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dot() {
  return <span className="h-1 w-1 rounded-full bg-muted-foreground/60" />;
}

function Tab({
  children,
  icon,
  badge,
  active,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  badge?: string;
  active?: boolean;
}) {
  return (
    <button
      className={`relative -mb-px inline-flex items-center gap-2 px-4 py-3 text-[13.5px] font-medium transition-colors ${
        active
          ? "border-b-2 border-foreground text-foreground"
          : "border-b-2 border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {children}
      {badge && (
        <span className="rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[10.5px] text-muted-foreground">
          {badge}
        </span>
      )}
    </button>
  );
}

function SumCard({
  label,
  value,
  unit,
  delta,
  deltaTone,
}: {
  label: string;
  value: string;
  unit?: string;
  delta: string;
  deltaTone?: "up" | "down";
}) {
  const tone =
    deltaTone === "up"
      ? "text-[#1A7D56]"
      : deltaTone === "down"
        ? "text-destructive"
        : "text-muted-foreground";
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-mono text-[26px] font-medium leading-tight -tracking-[0.01em]">
        {value}
        {unit && (
          <span className="ml-1 text-[13px] text-muted-foreground">{unit}</span>
        )}
      </div>
      <div className={`mt-0.5 text-[11.5px] ${tone}`}>{delta}</div>
    </div>
  );
}

function PyrLegend({
  tier,
  label,
}: {
  tier: "tek" | "slag" | "spill";
  label: string;
}) {
  const map = {
    tek: "bg-[var(--color-pyr-tek)]",
    slag: "bg-[var(--color-pyr-slag)]",
    spill: "bg-[var(--color-pyr-spill)]",
  };
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block h-2 w-2 rounded-sm ${map[tier]}`} />
      {label}
    </span>
  );
}

function Block({
  pillLabel,
  pillTier,
  name,
  meta,
  actual,
  note,
  children,
}: {
  pillLabel: string;
  pillTier: "tek" | "slag" | "spill" | "fys" | "turn";
  name: string;
  meta: string;
  actual: string;
  note?: string;
  children: React.ReactNode;
}) {
  const pillMap = {
    tek: "bg-[rgba(26,125,86,0.13)] text-[var(--color-pyr-tek)]",
    slag: "bg-[rgba(184,133,42,0.13)] text-[#B8852A]",
    spill: "bg-[rgba(184,133,42,0.13)] text-[var(--color-pyr-spill)]",
    fys: "bg-[rgba(0,88,64,0.13)] text-[var(--color-pyr-fys)]",
    turn: "bg-[rgba(94,92,87,0.13)] text-[var(--color-pyr-turn)]",
  };
  return (
    <div className="mb-3 overflow-hidden rounded-xl border border-border bg-card">
      <div className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3.5 border-b border-border bg-secondary px-4 py-3">
        <span
          className={`rounded-md px-2 py-0.5 font-mono text-[10.5px] font-bold tracking-[0.04em] ${pillMap[pillTier]}`}
        >
          {pillLabel}
        </span>
        <div>
          <div className="font-display text-[16px] font-medium text-foreground">
            {name}
          </div>
          <div className="mt-0.5 font-mono text-[11.5px] text-muted-foreground">
            {meta}
          </div>
        </div>
        <span className="font-mono text-[12px] text-muted-foreground">
          {actual}
        </span>
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[#1A7D56] text-white">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
      </div>
      <div className="grid grid-cols-4 gap-4 p-4">
        {children}
        {note && (
          <div className="col-span-4 mt-1 border-t border-dashed border-border pt-2.5 text-[13px] italic text-muted-foreground">
            {note}
          </div>
        )}
      </div>
    </div>
  );
}

function BB({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 font-mono text-[18px] font-medium">{value}</div>
    </div>
  );
}

function RailCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      {children}
    </div>
  );
}

function Kv({ k, v, last }: { k: string; v: string; last?: boolean }) {
  return (
    <div
      className={`flex justify-between py-1.5 text-[12.5px] ${
        last ? "" : "border-b border-dashed border-border/60"
      }`}
    >
      <span className="text-muted-foreground">{k}</span>
      <span className="font-mono font-medium text-foreground">{v}</span>
    </div>
  );
}

function PlanChange({
  tag,
  tagTone,
  children,
  last,
}: {
  tag: string;
  tagTone: "warning" | "success" | "muted";
  children: React.ReactNode;
  last?: boolean;
}) {
  const tone = {
    warning: "text-[#B8852A]",
    success: "text-[#1A7D56]",
    muted: "text-muted-foreground",
  }[tagTone];
  return (
    <div
      className={`py-1.5 ${
        last ? "" : "border-b border-dashed border-border/60"
      }`}
    >
      <span className={`font-mono text-[10px] font-bold ${tone}`}>{tag}</span>
      <br />
      {children}
    </div>
  );
}
