"use client";

/**
 * PlayerHQ Hjem — v2 (retning C «Presis»). Komponert 1:1 fra
 * ui_kits/v2/phq-skjermer.jsx → funksjonen Hjem, men med EKTE data fra
 * getDashboardData (src/app/portal/actions.ts). Kun v2-komponenter fra
 * "@/components/v2"; ingen ad-hoc UI. Ingen rå hex (kun T.*-tokens).
 *
 * V2Shell (montert i (v2preview)/v2-hjem/page.tsx) eier chrome-en — denne
 * komponenten rendrer bare den indre innholds-stacken.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { DashboardData } from "@/app/portal/actions";
import { WorkbenchInngang } from "./WorkbenchInngang";
import {
  T,
  fmtSg,
  Caps,
  Tittel,
  CTAPill,
  Kort,
  TallHero,
  StatusPill,
  Trend,
  AkseChip,
  Rad,
  KpiFlis,
  Prikker,
  InnsiktChip,
  DagStripe,
  TomTilstand,
  Icon,
  type StatusTone,
  type StripeDag,
} from "@/components/v2";

/* ── Rene hjelpere (norsk bokmål, brutto tall) ─────────────────────── */

const UKEDAGER = ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"];
const MANEDER = [
  "januar", "februar", "mars", "april", "mai", "juni",
  "juli", "august", "september", "oktober", "november", "desember",
];

/** «Onsdag 25. juni · uke 26» — bygget fra dagens dato + serverberegnet ukenr. */
function datoLinje(weekNumber: number): string {
  const d = new Date();
  const dag = UKEDAGER[d.getDay()];
  return `${dag[0].toUpperCase()}${dag.slice(1)} ${d.getDate()}. ${MANEDER[d.getMonth()]} · uke ${weekNumber}`;
}

function toMin(dato: Date): string {
  const h = String(dato.getHours()).padStart(2, "0");
  const m = String(dato.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

/** Varighet i minutter → «1,5 t» (≥60) eller «45 min». */
function varighet(min: number): string {
  if (min >= 60) return `${(min / 60).toFixed(1).replace(".", ",")} t`;
  return `${min} min`;
}

/** true på klient etter mount når viewport < 768px (styrer kun tallstørrelser). */
function useMobile(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const oppdater = () => setM(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, []);
  return m;
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function HjemV2({ data }: { data: DashboardData }) {
  const mobile = useMobile();
  const router = useRouter();
  const { user, greeting, weekNumber, today, todayAll, week, kpiStats, weekProgress, trainingHeatmap, coachMessage, nesteHandling } = data;

  // SG-form (kpiStats — snitt SG total siste 10 runder). Badgen under er eneste
  // retningssignal her (10-runders trend) — en egen per-runde-delta ble fjernet
  // fordi den kunne peke motsatt vei av badgen og se ut som en motsigelse.
  // Sparklinjen viser IKKE rå per-runde-SG (siste punkt spriker da fra
  // snitt-headlinen) — den viser et rullende snitt av samme runder, så siste
  // punkt alltid lander nøyaktig på sgVerdi. Konsistens > pynt.
  const tr = kpiStats.sgTrend;
  const sgVerdi = kpiStats.sgTotal != null ? fmtSg(kpiStats.sgTotal) : "–";
  const sgSerie = rullendeSnitt(tr);

  let form: { l: string; tone: StatusTone } | null = null;
  if (tr.length >= 2) {
    const d = tr[tr.length - 1] - tr[0];
    form = d > 0.05 ? { l: "Stigende", tone: "lime" } : d < -0.05 ? { l: "Synkende", tone: "down" } : { l: "Stabil", tone: "info" };
  }

  // DagStripe — ekte uke (mandag→søndag). state «done» = tidligere dag der alle økter er fullført.
  const iDag = new Date();
  iDag.setHours(0, 0, 0, 0);
  const stripeDager: StripeDag[] = week.map((d) => {
    const forbi = d.date.getTime() < iDag.getTime();
    const alleFullfort = d.sessions.length > 0 && d.sessions.every((s) => s.status === "COMPLETED");
    return {
      dow: d.dayLabel.charAt(0),
      date: d.dayNumber,
      today: d.isToday,
      state: forbi && alleFullfort ? "done" : undefined,
    };
  });
  const aktivDag = week.find((d) => d.isToday)?.dayNumber ?? null;

  // Dagens fokus — dagens (første) økt. Ingen fabrikkert «hvorfor»-tekst (gap): bygget av ekte felter.
  const fokusStatus: { l: string; tone: StatusTone } | null = today
    ? today.status === "IN_PROGRESS"
      ? { l: "Pågår", tone: "lime" }
      : today.status === "COMPLETED"
        ? { l: "Fullført", tone: "up" }
        : { l: "Planlagt", tone: "info" }
    : null;
  const fokusDetalj = today
    ? [today.sted, varighet(today.durationMin), today.drills.length > 0 ? `${today.drills.length} øvelser` : null]
        .filter(Boolean)
        .join(" · ")
    : "";

  // KPI — Streak (uker på rad med trening, avledet av heatmap) + uke-gjennomføring
  const streak = beregnStreak(trainingHeatmap.values);
  const ukePct = weekProgress.plannedMin > 0
    ? `${Math.round((weekProgress.completedMin / weekProgress.plannedMin) * 100)} %`
    : "–";

  // Prikker-heatmap — 12 uker × 7 ukedager (ekte treningsøkter)
  const hmVals = trainingHeatmap.values;
  const hmCols = hmVals[0]?.length ?? 12;
  const hmHits: number[] = [];
  for (let d = 0; d < hmVals.length; d++) {
    for (let w = 0; w < hmVals[d].length; w++) {
      if (hmVals[d][w] > 0) hmHits.push(d * hmCols + w);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hode */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <Caps>{datoLinje(weekNumber)}</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel mobile={mobile} em={`${user.fornavn}.`}>{greeting},</Tittel>
          </div>
        </div>
        <div className="hidden md:block">
          <Link href={nesteHandling.href} style={{ textDecoration: "none" }}>
            <CTAPill icon={nesteHandling.ikon}>{nesteHandling.tekst}</CTAPill>
          </Link>
        </div>
      </div>

      <DagStripe days={stripeDager} value={aktivDag} onChange={() => router.push("/portal/kalender")} />

      {/* SG-form + dagens plan */}
      <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr]" style={{ gap: T.gap, alignItems: "start" }}>
        <Kort tint>
          <TallHero
            label="Strokes Gained · form"
            value={sgVerdi}
            sub="snitt per runde · siste 10 runder"
            size={mobile ? 44 : 52}
            action={form ? <StatusPill tone={form.tone}>{form.l}</StatusPill> : undefined}
            hjelp="sgTotal"
          />
          {tr.length >= 2 && (
            <div style={{ marginTop: 8 }}>
              <Trend series={sgSerie} height={72} />
            </div>
          )}
        </Kort>

        {/* Dagens plan — dagens første/pågående økt vist med detalj øverst
            (tidligere eget «Dagens fokus»-kort viste samme økt igjen rett
            under; slått sammen til ett kort, se gap). Resten av dagens
            økter (om flere) listes kompakt under. */}
        <Kort eyebrow="Dagens plan" action={todayAll.length > 0 ? <Caps size={9}>{todayAll.length} økter</Caps> : undefined}>
          {today ? (
            <>
              <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, color: T.fg, lineHeight: 1.3 }}>{today.title}</div>
              {fokusDetalj && (
                <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.6, margin: "8px 0 0" }}>{fokusDetalj}</p>
              )}
              <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                <AkseChip a={today.pyramidArea} />
                {fokusStatus && <StatusPill tone={fokusStatus.tone}>{fokusStatus.l}</StatusPill>}
              </div>
              {todayAll.length > 1 && (
                <div style={{ marginTop: 14 }}>
                  {todayAll.slice(1).map((o, i, arr) => {
                    const naa = o.status === "IN_PROGRESS";
                    const sub = [o.sted, varighet(o.durationMin)].filter(Boolean).join(" · ");
                    return (
                      <Rad
                        key={o.id}
                        leading={
                          <span style={{ width: 44, flex: "none", fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: naa ? T.lime : T.mut }}>
                            {toMin(o.startTime)}
                          </span>
                        }
                        title={o.title}
                        sub={sub}
                        meta={<AkseChip a={o.pyramidArea} />}
                        naa={naa}
                        trailing={null}
                        last={i === arr.length - 1}
                      />
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <TomTilstand icon="calendar" title="Ingen økt i dag" sub="Nyt hviledagen — eller legg til en økt i Plan." />
          )}
        </Kort>
      </div>

      {/* Mobil-CTA — «Start dagens økt» fullbredde under dagens økt-kort (desktop har den i hodet). */}
      <div className="md:hidden">
        <Link href={nesteHandling.href} style={{ textDecoration: "none", display: "block" }}>
          <CTAPill icon={nesteHandling.ikon} full>{nesteHandling.tekst}</CTAPill>
        </Link>
      </div>

      {/* Book coachtime — inngang til booking (ingen egen plass i hovednav) */}
      <Kort>
        <Link href="/portal/booking" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
          <Rad
            leading={<Icon name="calendar-plus" size={16} style={{ color: T.mut }} />}
            title="Book coachtime"
            sub="Velg tjeneste, coach og tid"
            last
          />
        </Link>
      </Kort>

      {/* Workbench-inngang — samme ene trykkpunkt som Plan-fanen */}
      <WorkbenchInngang />

      {/* KPI-rad */}
      <div className="grid grid-cols-2 md:grid-cols-3" style={{ gap: T.gap }}>
        <KpiFlis label="Streak" value={`${streak} uker`} hjelp="streak" />
        <KpiFlis label="Uke-gjennomføring" value={ukePct} hjelp="planEtterlevelse" />
        <div className="col-span-2 md:col-span-1">
          <Kort eyebrow="Trening · 12 uker">
            <div style={{ marginTop: 4 }}>
              <Prikker n={hmVals.length * hmCols} cols={hmCols} hits={hmHits} />
            </div>
          </Kort>
        </div>
      </div>

      {/* AI/coach-innsikt */}
      {coachMessage && (
        <InnsiktChip cta="Les mer">
          {coachMessage.coachName}: {coachMessage.preview}
        </InnsiktChip>
      )}
    </div>
  );
}

/** Kumulativt rullende snitt, eldst→nyest. Siste element == snittet av hele
 *  serien — matcher alltid hero-headlinen (samme runder, samme formel). */
function rullendeSnitt(vals: number[]): number[] {
  let sum = 0;
  return vals.map((v, i) => {
    sum += v;
    return Math.round((sum / (i + 1)) * 10) / 10;
  });
}

/** Uker på rad (nyeste→eldste) med minst én treningsøkt. Avledet av heatmap-verdiene. */
function beregnStreak(values: number[][]): number {
  const uker = values[0]?.length ?? 0;
  let streak = 0;
  for (let w = uker - 1; w >= 0; w--) {
    const trente = values.some((rad) => rad[w] > 0);
    if (!trente) break;
    streak++;
  }
  return streak;
}
