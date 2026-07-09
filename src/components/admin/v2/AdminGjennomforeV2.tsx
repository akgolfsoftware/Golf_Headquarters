"use client";

/**
 * AgencyOS Gjennomføre — v2 (retning C «Presis»). Daglig drift for coach:
 * dagens økter på tvers av spillere + snarveier til driftshubene. Ingen mockup
 * fantes — komponert utelukkende av v2-biblioteket (src/components/v2), ingen
 * ad-hoc UI, ingen rå hex (kun T.*).
 *
 * Funksjon/data bevart 1:1 fra den ekte skjermen
 * (src/app/admin/gjennomfore/page.tsx):
 *   - Tre ekte tellinger: økter i dag, økter denne uka, aktive anlegg.
 *   - Alle åtte nav-destinasjoner (kalender, bookinger, anlegg, tilgjengelighet,
 *     kapasitet, tjenester, TrackMan, live-økter) bevart som «Snarveier»-rader.
 *   - «—» der kilden mangler, aldri fabrikerte tall.
 *
 * I tillegg — kjernen i «daglig drift» — vises den EKTE økt-lista for dagen
 * (Booking på tvers av spillere: tid/spiller/tjeneste/sted/status), hentet fra
 * Prisma i ruten. Live-status utledes fra klokka. Ærlig tom når dagen er åpen.
 *
 * Desktop: hode → live-bar (når økt pågår) → 3 KPI → grid 3fr/2fr
 *          (Dagens økter | Snarveier) → InnsiktChip.
 * Mobil:   samme, men grid → PillTabs (Økter | Snarveier) så lange lister ikke
 *          skyver hverandre nedover; økt-lista er allerede en agenda-stabel.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Caps,
  Tittel,
  StatusPill,
  KpiFlis,
  Kort,
  Rad,
  PillTabs,
  InnsiktChip,
  TomTilstand,
  CTAPill,
  Icon,
  T,
} from "@/components/v2";

// ── Datakontrakt (mappes fra Prisma i ruten) ────────────────────
export type OktStatusRaw = "PENDING" | "CONFIRMED" | "COMPLETED";

export interface GjennomforeOkt {
  id: string;
  /** Klokkeslett «14:00» (nb-NO). */
  tid: string;
  /** Minutter fra midnatt (lokal) — for live-utleding. */
  startMin: number;
  /** Varighet i minutter. */
  durMin: number;
  /** Spiller-navn, gjestenavn, eller «Uten spiller». */
  spiller: string;
  /** Tjeneste-navn (ServiceType.name). */
  tjeneste: string;
  /** Lokasjon (Location.name). */
  sted: string;
  status: OktStatusRaw;
  href: string;
}

export interface GjennomforeSnarvei {
  id: string;
  href: string;
  /** v2 Icon-navn. */
  ikon: string;
  tittel: string;
  /** Ekte verdi eller «—». */
  verdi: string;
  sub: string;
  /** true = ingen kilde ennå (dashet ikon-flate). */
  tom?: boolean;
}

export interface AdminGjennomforeData {
  dayLabel: string;
  /** Minutter fra midnatt (server) — seed for live-utleding. */
  nowMin: number;
  okterIDag: number;
  okterDenneUka: number;
  antallAnlegg: number;
  okter: GjennomforeOkt[];
  snarveier: GjennomforeSnarvei[];
}

const pl = (n: number, en: string, flere: string) => `${n} ${n === 1 ? en : flere}`;

type OktTilstand = "aktiv" | "gjennomfort" | "kommende";

function tilstandAv(o: GjennomforeOkt, nowMin: number): OktTilstand {
  if (o.status === "COMPLETED") return "gjennomfort";
  if (nowMin >= o.startMin && nowMin < o.startMin + o.durMin) return "aktiv";
  if (nowMin >= o.startMin + o.durMin) return "gjennomfort";
  return "kommende";
}

/** Ikon-flate for snarvei-rad (tint = ekte kilde, dashet = mangler kilde). */
function SnarveiIkon({ ikon, tom }: { ikon: string; tom?: boolean }) {
  return (
    <span
      style={{
        width: 36,
        height: 36,
        flex: "none",
        borderRadius: 10,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: tom ? T.panel2 : `color-mix(in srgb,${T.forest} 30%,transparent)`,
        border: tom ? `1px dashed ${T.borderS}` : `1px solid ${T.border}`,
      }}
    >
      <Icon name={ikon} size={17} style={{ color: tom ? T.mut : T.lime }} />
    </span>
  );
}

export function AdminGjennomforeV2({ data }: { data: AdminGjennomforeData }) {
  const router = useRouter();
  const [fane, setFane] = useState<"okter" | "snarveier">("okter");

  const liveCount = data.okter.filter((o) => tilstandAv(o, data.nowMin) === "aktiv").length;
  const aktiv = data.okter.find((o) => tilstandAv(o, data.nowMin) === "aktiv") ?? null;

  // ── Hode ────────────────────────────────────────────────────────
  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <Caps>{data.dayLabel} · AgencyOS · Coach</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="drift.">Daglig</Tittel>
        </div>
      </div>
      {liveCount > 0 && (
        <div className="hidden md:block">
          <StatusPill tone="down">Live · {pl(liveCount, "økt pågår", "økter pågår")}</StatusPill>
        </div>
      )}
    </div>
  );

  // ── Live-bar (kun når en økt pågår) ─────────────────────────────
  const live = aktiv ? (
    <Kort pad="12px 16px">
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <StatusPill tone="down">Live</StatusPill>
        <span style={{ flex: 1, minWidth: 0, fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {aktiv.tjeneste} — {aktiv.spiller}
        </span>
        <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.mut, fontVariantNumeric: "tabular-nums" }}>
          {aktiv.tid}
        </span>
        <Link href={aktiv.href} style={{ textDecoration: "none" }} className="hidden md:inline-flex">
          <CTAPill icon="arrow-right">Åpne økt</CTAPill>
        </Link>
      </div>
    </Kort>
  ) : null;

  // ── KPI-flis (3 ekte tellinger) ─────────────────────────────────
  const kpi = (
    <div className="grid grid-cols-3" style={{ gap: T.gap }}>
      <KpiFlis label="Økter i dag" value={data.okterIDag} />
      <KpiFlis label="Denne uka" value={data.okterDenneUka} />
      <KpiFlis label="Aktive anlegg" value={data.antallAnlegg} />
    </div>
  );

  // ── Dagens økter ────────────────────────────────────────────────
  const okterKort = (
    <Kort
      eyebrow="Dagens økter"
      action={data.okter.length > 0 ? <Caps size={9}>{pl(data.okter.length, "økt", "økter")}</Caps> : undefined}
    >
      {data.okter.length === 0 ? (
        <TomTilstand icon="calendar" title="Ingen økter i dag" sub="Dagen er åpen — rom for planlegging og oppfølging." />
      ) : (
        data.okter.map((o, i) => {
          const t = tilstandAv(o, data.nowMin);
          const meta =
            t === "aktiv" ? undefined
            : t === "gjennomfort" ? <StatusPill tone="up">Fullført</StatusPill>
            : o.status === "PENDING" ? <StatusPill tone="warn">Til bekreftelse</StatusPill>
            : <StatusPill tone="info">Bekreftet</StatusPill>;
          return (
            <Rad
              key={o.id}
              onClick={() => router.push(o.href)}
              leading={
                <span style={{ width: 44, flex: "none", fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: t === "aktiv" ? T.lime : T.mut, fontVariantNumeric: "tabular-nums" }}>
                  {o.tid}
                </span>
              }
              title={o.spiller}
              sub={[o.tjeneste, o.sted].filter(Boolean).join(" · ")}
              meta={meta}
              naa={t === "aktiv"}
              last={i === data.okter.length - 1}
            />
          );
        })
      )}
    </Kort>
  );

  // ── Snarveier (alle åtte drifts-destinasjoner bevart) ───────────
  const snarveierKort = (
    <Kort tint eyebrow="Snarveier" action={<Caps size={9}>Drift</Caps>}>
      {data.snarveier.map((s, i) => (
        <Rad
          key={s.id}
          onClick={() => router.push(s.href)}
          leading={<SnarveiIkon ikon={s.ikon} tom={s.tom} />}
          title={s.tittel}
          sub={s.sub}
          meta={
            <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: s.tom ? T.mut : T.fg, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
              {s.verdi}
            </span>
          }
          last={i === data.snarveier.length - 1}
        />
      ))}
    </Kort>
  );

  // ── AI-innsikt → Workbench ──────────────────────────────────────
  const innsiktTekst =
    liveCount > 0
      ? `${pl(liveCount, "økt pågår", "økter pågår")} akkurat nå — følg opp i live-konsollen, planlegg resten av uka i Workbench.`
      : data.okter.length > 0
        ? `${pl(data.okter.length, "økt", "økter")} i dag — planlegg innhold og oppfølging samlet i Workbench.`
        : "Ingen økter i dag — bruk roen til å planlegge uka i Workbench.";
  const innsikt = (
    <Link href="/admin/planlegge" style={{ textDecoration: "none" }}>
      <InnsiktChip cta="Planlegg i Workbench">{innsiktTekst}</InnsiktChip>
    </Link>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}
      {live}
      {kpi}

      {/* Desktop: to kolonner side ved side */}
      <div className="hidden lg:grid" style={{ gridTemplateColumns: "3fr 2fr", gap: T.gap, alignItems: "start" }}>
        {okterKort}
        {snarveierKort}
      </div>

      {/* Mobil/tablet: faner så listene ikke skyver hverandre */}
      <div className="lg:hidden" style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        <PillTabs
          tabs={[
            { id: "okter", l: `Økter (${data.okter.length})` },
            { id: "snarveier", l: "Snarveier" },
          ]}
          value={fane}
          onChange={(id) => setFane(id as "okter" | "snarveier")}
        />
        {fane === "okter" ? okterKort : snarveierKort}
      </div>

      {innsikt}
    </div>
  );
}
