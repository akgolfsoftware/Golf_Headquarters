/**
 * PILOT — Foreldreportal · Ukerapport
 * Bygd direkte fra wireframe/design-files-v2/screens/37-foreldre-ukerapport.html
 * URL: /foreldre-ukerapport-demo
 */

import { FileDown, Forward, Play, Check } from "lucide-react";

export default function ForeldreUkerapportDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1200px] px-8 py-10">
        <div className="mb-6 flex items-end justify-between gap-6">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Foreldreportal · Ukerapport
            </div>
            <h1 className="mt-1 font-display text-[32px] font-semibold tracking-tight leading-[1.1]">
              Ukerapport{" "}
              <em className="font-normal italic text-muted-foreground">· uke 19 · 5.–11. mai 2026</em>
            </h1>
            <p className="mt-2 max-w-[640px] text-[13px] leading-[1.55] text-muted-foreground">
              Signert av Anders Kristiansen søndag 11.05 kl 21:14. Genereres automatisk fra Markus'
              coaching-board, og redigeres av coach før utsendelse.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-transparent px-3 py-2 text-[12px] font-medium text-foreground hover:bg-secondary">
              <FileDown className="h-3.5 w-3.5" strokeWidth={1.5} /> Last ned PDF
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-transparent px-3 py-2 text-[12px] font-medium text-foreground hover:bg-secondary">
              <Forward className="h-3.5 w-3.5" strokeWidth={1.5} /> Videresend
            </button>
            <button className="rounded-md bg-primary px-3 py-2 text-[12px] font-medium text-primary-foreground">
              Kvitter mottatt
            </button>
          </div>
        </div>

        {/* Pill toolbar */}
        <div className="mb-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1.5 text-[12px] font-semibold text-primary-foreground">
            ← Uke 19 →
          </span>
          <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1.5 font-mono text-[12px] tracking-[0.02em] text-foreground">
            Sammenlign forrige måned
          </span>
          <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1.5 font-mono text-[12px] tracking-[0.02em] text-foreground">
            Sesong 2026
          </span>
          <div className="ml-auto flex items-center gap-2">
            <span className="rounded-full bg-[rgba(26,125,86,0.12)] px-2.5 py-1 text-[11px] font-medium text-[var(--status-success,#1A7D56)]">
              Coach-signert
            </span>
            <span className="rounded-full bg-secondary px-2.5 py-1 font-mono text-[11px] tracking-[0.04em] text-muted-foreground">
              v1.2 · 1 revisjon
            </span>
          </div>
        </div>

        {/* Week strip */}
        <div className="mb-5 grid grid-cols-8 gap-2 rounded-2xl border border-border bg-secondary p-3">
          <DayCell day="Man" n="5" />
          <DayCell day="Tir" n="6" />
          <DayCell day="Ons" n="7" session dotColor="var(--color-pyr-spill,#B8852A)" />
          <DayCell day="Tor" n="8" />
          <DayCell day="Fre" n="9" session dotColor="var(--color-pyr-fys,#005840)" />
          <DayCell day="Lør" n="10" session dotColor="var(--color-pyr-tek,#1A7D56)" />
          <DayCell day="Søn" n="11" />
          <DayCell day="i dag" n="11" today />
        </div>

        {/* Summary */}
        <div className="mb-5 grid grid-cols-[1.4fr_1fr] gap-4">
          <div className="rounded-xl border border-border bg-secondary p-5 text-[14px] leading-[1.65] text-foreground">
            <div className="mb-3 flex items-center gap-3 border-b border-[var(--line-soft,#EFEDE6)] pb-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-primary font-display text-[11px] font-semibold text-accent">
                AK
              </span>
              <div>
                <div className="text-[13px] font-medium leading-none">Anders Kristiansen — coach</div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
                  signert søn 11.05 · 21:14 · v1.2
                </div>
              </div>
            </div>
            <p className="mb-3">
              <b className="font-semibold">Hei Frode — </b>Markus har hatt en{" "}
              <em className="not-italic rounded-sm bg-[rgba(0,88,64,0.08)] px-1 py-0.5 font-medium text-primary">
                veldig god uke 19
              </em>
              . Tre økter levert, alle i grønn belastningssone, og han viste tydelig framgang på putting fra
              4–7 meter (treff-rate 68 % → 74 %).
            </p>
            <p className="mb-3">
              <b className="font-semibold">Det vi jobbet med:</b> putt-rytme i kort-sone (TEK), pitch-bane
              fra 30–80 m (SPILL), og rotasjonsmobilitet hofte/skuldre (FYS). Vi prioriterte putting denne
              uka fordi det er hans valgte fokus i pyramiden og hovedfeltet før NM Junior 22.06.
            </p>
            <p>
              <b className="font-semibold">Neste uke:</b> Vi øker volumet litt på SPILL-økter — 2
              banespill-runder på 9 hull — og gjør én ren video-økt med Quintic-mat for å låse putt-tempo.
              Ingen røde flagg på smerter eller søvn.
            </p>
          </div>
          <div className="flex flex-col gap-2.5">
            <KpiCard label="Treningstid" value="4t 12m" delta="+ 38 min" tone="up" />
            <KpiCard label="Snitt-RPE" value="7,2 / 10" delta="grønn" tone="up" />
            <KpiCard label="Putt-treff 4–7 m" value="74 %" delta="+ 6 pp" tone="up" />
            <KpiCard label="Søvn-snitt" value="7t 42m" delta="+ 14 m" tone="neutral" />
          </div>
        </div>

        {/* Sessions + focus */}
        <div className="mb-5 grid grid-cols-12 gap-4">
          <div className="col-span-7 rounded-lg border border-border bg-card p-6">
            <div className="mb-3 flex items-baseline justify-between">
              <h3 className="font-display text-[16px] font-semibold tracking-tight">
                Øktene i detalj{" "}
                <em className="font-normal italic text-muted-foreground text-[13px]">· 3 økter</em>
              </h3>
              <span className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
                RPE etter Foster · skala 0–10
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              <SessionCard d="ons" n="07" pyrLabel="SPILL" pyrColor="var(--color-pyr-spill,#B8852A)" title="Pitch fra 30–80 m · driving range" meta={["60 min", "Anders K.", "GFGK", "2 video-klipp"]} rpe="7,4" />
              <SessionCard d="fre" n="09" pyrLabel="FYS" pyrColor="var(--color-pyr-fys,#005840)" title="Rotasjon og styrke · sal" meta={["60 min", "Fysio Per", "Mulligan Indoor"]} rpe="7,0" />
              <SessionCard d="lør" n="10" pyrLabel="TEK" pyrColor="var(--color-pyr-tek,#1A7D56)" title="Putt-kalibrering 4–7 m · Quintic-mat" meta={["90 min", "Anders K.", "GFGK · puttegreen", "3 video-klipp"]} rpe="8,2" />
            </div>
          </div>

          <div className="col-span-5 rounded-lg border border-border bg-card p-6">
            <div className="mb-3 flex items-baseline justify-between">
              <h3 className="font-display text-[16px] font-semibold tracking-tight">
                Ukens mål{" "}
                <em className="font-normal italic text-muted-foreground text-[13px]">
                  · periodiserings-agenten
                </em>
              </h3>
              <span className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
                2 av 3 nådd
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <FocusRow done label="Putt-treff 4–7 m over 70 %" sub="kvalitet over kvantitet" value="74 %" />
              <FocusRow done label="Minst 1 FYS-økt med rotasjon" sub="injeksjons-forebyggende" value="1 av 1" />
              <FocusRow label="Banespill 9 hull med scorekort" sub="SPILL-fokus mot NM Junior" value="0 av 1" />
              <FocusRow done label="Holde RPE under 8,5" sub="belastnings-styring" value="topp 8,2" />
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-[var(--line-soft,#EFEDE6)] pt-3 font-mono text-[11px] tracking-[0.04em] text-muted-foreground">
              <span>Neste uke: 2 SPILL-økter, 1 ren video-økt</span>
              <a className="text-primary underline">Se plan</a>
            </div>
          </div>
        </div>

        {/* Videos */}
        <section className="rounded-lg border border-border bg-card p-6">
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="font-display text-[16px] font-semibold tracking-tight">
              Videoklipp coach valgte{" "}
              <em className="font-normal italic text-muted-foreground text-[13px]">· 2 klipp</em>
            </h3>
            <span className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
              samme bibliotek som i PlayerHQ · 24 mnd retention
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <VideoThumb tag="SPILL · ons 07.05" duration="0:18" />
            <VideoThumb tag="TEK · lør 10.05" duration="0:24" />
          </div>
          <div className="mt-3 border-t border-[var(--line-soft,#EFEDE6)] pt-3 text-[12px] leading-[1.55] text-muted-foreground">
            Coach valgte disse klippene for å vise framgang og forklare neste fokus. Du kan se alle
            5 originalklippene under /forelder/opptak.
          </div>
        </section>
      </div>
    </div>
  );
}

function DayCell({ day, n, session, today, dotColor }: { day: string; n: string; session?: boolean; today?: boolean; dotColor?: string }) {
  return (
    <div
      className={`rounded-md border px-2 py-2.5 text-center ${
        today
          ? "border-dashed border-primary bg-[rgba(0,88,64,0.06)]"
          : session
            ? "border-primary bg-[rgba(0,88,64,0.06)]"
            : "border-border bg-card"
      }`}
    >
      <div className={`font-mono text-[9px] uppercase tracking-[0.06em] ${today ? "text-primary" : "text-muted-foreground"}`}>
        {day}
      </div>
      <div className={`mt-1 font-display text-[16px] font-medium ${today ? "text-primary" : "text-foreground"}`}>
        {n}
      </div>
      <div className="mt-1 flex h-1.5 justify-center gap-1">
        {dotColor && <span className="h-1 w-1 rounded-full" style={{ background: dotColor }} />}
      </div>
    </div>
  );
}

function KpiCard({ label, value, delta, tone }: { label: string; value: string; delta: string; tone: "up" | "neutral" }) {
  const deltaStyle =
    tone === "up"
      ? "bg-[rgba(26,125,86,0.12)] text-[var(--status-success,#1A7D56)]"
      : "bg-secondary text-muted-foreground";
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-xl border border-border bg-card p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">{label}</div>
      <span className={`rounded-sm px-2 py-0.5 font-mono text-[11px] font-semibold tracking-[0.04em] ${deltaStyle}`}>
        {delta}
      </span>
      <div className="col-span-2 font-mono text-[22px] font-medium tabular-nums tracking-tight text-foreground">
        {value}
      </div>
    </div>
  );
}

function SessionCard({ d, n, pyrLabel, pyrColor, title, meta, rpe }: { d: string; n: string; pyrLabel: string; pyrColor: string; title: string; meta: string[]; rpe: string }) {
  return (
    <div className="grid grid-cols-[44px_1fr_auto] items-center gap-3 rounded-xl border border-border bg-card p-3">
      <div className="rounded-md border border-border bg-secondary px-2 py-1 text-center">
        <div className="font-mono text-[9px] uppercase tracking-[0.06em] text-muted-foreground">{d}</div>
        <div className="font-display text-[16px] font-medium leading-none">{n}</div>
      </div>
      <div>
        <div className="font-display text-[14px] font-medium leading-snug">
          <span className="mr-2 rounded-sm px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-white" style={{ background: pyrColor }}>
            {pyrLabel}
          </span>
          {title}
        </div>
        <div className="mt-1 font-mono text-[11px] tracking-[0.02em] text-muted-foreground">
          {meta.join(" · ")}
        </div>
      </div>
      <div className="text-right">
        <div className="font-mono text-[18px] font-medium tabular-nums tracking-tight text-primary">{rpe}</div>
        <div className="font-mono text-[9px] uppercase tracking-[0.04em] text-muted-foreground">RPE</div>
      </div>
    </div>
  );
}

function FocusRow({ done, label, sub, value }: { done?: boolean; label: string; sub: string; value: string }) {
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-md border border-border bg-card px-3 py-2.5">
      <span
        className={`grid h-5 w-5 place-items-center rounded-sm border ${
          done ? "border-primary bg-primary text-accent" : "border-border bg-secondary"
        }`}
      >
        {done && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>
      <div>
        <div className="text-[13px] text-foreground">{label}</div>
        <div className="mt-0.5 font-mono text-[10px] tracking-[0.02em] text-muted-foreground">{sub}</div>
      </div>
      <span className={`font-mono text-[11px] tracking-[0.04em] ${done ? "font-semibold text-[var(--status-success,#1A7D56)]" : "text-muted-foreground"}`}>
        {value}
      </span>
    </div>
  );
}

function VideoThumb({ tag, duration }: { tag: string; duration: string }) {
  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-gradient-to-br from-[#0A1F17] to-[#163027]">
      <span className="absolute left-2 top-2 rounded-sm bg-[rgba(10,31,24,0.55)] px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.04em] text-[#F5F4EE]">
        {tag}
      </span>
      <div className="absolute inset-0 grid place-items-center">
        <span className="grid h-10 w-10 place-items-center rounded-full border border-[rgba(245,244,238,0.35)] bg-[rgba(245,244,238,0.16)] text-[#F5F4EE]">
          <Play className="h-3.5 w-3.5" strokeWidth={1.5} fill="currentColor" />
        </span>
      </div>
      <span className="absolute bottom-2 right-2 rounded-sm bg-[rgba(10,31,24,0.55)] px-1.5 py-0.5 font-mono text-[9px] text-[rgba(245,244,238,0.85)]">
        {duration}
      </span>
    </div>
  );
}
