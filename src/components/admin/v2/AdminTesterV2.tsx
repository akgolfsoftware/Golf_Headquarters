"use client";

/**
 * AgencyOS Tester — v2 (retning C «Presis», mørk først). Rekomponert fra den
 * ekte /admin/tester-flaten (KPI-strip + testresultat-tabell + tildel-handling),
 * men bygget utelukkende av v2-komponentbiblioteket (src/components/v2) — ingen
 * ad-hoc UI, ingen rå hex (kun T.*).
 *
 * Retning C-idiom: tabellen fra fasit-flaten er recomponert til en Rad-liste
 * (som Stall/Cockpit), så samme layout tjener mobil (375px) og desktop uten
 * separat tabell-markup. All datakontrakt bevart: spiller · test · resultat ·
 * delta · dato · status.
 *
 * FYS-PLASSHOLDER-REGEL (LÅST): ingen fargekoding basert på normverdier. Delta/
 * status her er ren trend mot spillerens EGET forrige resultat (tillatt), aldri
 * mot en fasit — derfor nøytralt til trenden faktisk peker opp/ned.
 *
 * Ærlige tomrom: WAGR/percentil/kategori A–K finnes ikke i TestResult-schemaet
 * og fabrikeres ikke. Filter-fanene bygges fra de FAKTISKE testnavnene i data.
 */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Caps,
  Tittel,
  Kort,
  Rad,
  AvatarInit,
  DeltaChip,
  StatusPill,
  PillTabs,
  KpiFlis,
  CTAPill,
  TomTilstand,
  T,
} from "@/components/v2";

export type AdminTesterStatus =
  | "Pågår"
  | "Bedre"
  | "Stabilt"
  | "Svakere"
  | "Ferdig";

export interface AdminTesterV2Kpi {
  label: string;
  value: string;
  /** lime-uthevet tall (snitt-score). */
  accent?: boolean;
  /** tint-kort + varsel (pågår nå > 0). */
  varsle?: boolean;
}

export interface AdminTesterV2Rad {
  key: string;
  spillerId: string;
  navn: string;
  test: string;
  /** Formatert resultat, eller «—» for pågående økt (bruttoscore-format). */
  resultat: string;
  /** Formatert delta mot spillerens forrige resultat, eller null. */
  delta: string | null;
  deltaDir: "up" | "down" | null;
  dato: string;
  status: AdminTesterStatus;
}

export interface AdminTesterV2Data {
  kpis: AdminTesterV2Kpi[];
  /** Distinkte testnavn i datasettet — fyller filter-fanene. */
  tester: string[];
  rader: AdminTesterV2Rad[];
}

/** Signal-pille kun for retnings-status; nøytral status vises som dempet tekst. */
function StatusMerke({ status }: { status: AdminTesterStatus }) {
  if (status === "Bedre") return <StatusPill tone="up">Bedre</StatusPill>;
  if (status === "Svakere") return <StatusPill tone="down">Svakere</StatusPill>;
  if (status === "Pågår") return <StatusPill tone="warn">Pågår</StatusPill>;
  return (
    <span
      style={{
        fontFamily: T.mono,
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: T.mut,
      }}
    >
      {status}
    </span>
  );
}

export function AdminTesterV2({ data }: { data: AdminTesterV2Data }) {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("alle");

  const tabs = useMemo(
    () => [
      { id: "alle", l: "Alle" },
      ...data.tester.map((t) => ({ id: t, l: t })),
    ],
    [data.tester],
  );

  const synlige = useMemo(
    () =>
      filter === "alle"
        ? data.rader
        : data.rader.filter((r) => r.test === filter),
    [data.rader, filter],
  );

  // ── Hode ────────────────────────────────────────────────────────
  const hode = (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 14,
        flexWrap: "wrap",
      }}
    >
      <div>
        <Caps>Analysere · Tester</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="tester.">Stallens</Tittel>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Link href="/admin/tester/foreslatte" style={{ textDecoration: "none" }}>
          <CTAPill ghost icon="lightbulb">
            Foreslåtte
          </CTAPill>
        </Link>
        <Link href="/admin/tester/benchmarks" style={{ textDecoration: "none" }}>
          <CTAPill ghost icon="target">
            Fasiter
          </CTAPill>
        </Link>
        <Link href="/admin/tester/tildel" style={{ textDecoration: "none" }}>
          <CTAPill icon="plus">Registrer test</CTAPill>
        </Link>
      </div>
    </div>
  );

  // ── KPI-flis (4) ────────────────────────────────────────────────
  const kpi = (
    <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: T.gap }}>
      {data.kpis.map((k) => (
        <KpiFlis
          key={k.label}
          label={k.label}
          value={k.value}
          tint={k.accent}
          varsle={k.varsle}
        />
      ))}
    </div>
  );

  // ── Resultat-liste (Rad-idiom for mobil + desktop) ──────────────
  const liste = (
    <Kort eyebrow="Testresultater · siste gjennomføring">
      <div style={{ marginBottom: 14 }}>
        <PillTabs tabs={tabs} value={filter} onChange={setFilter} />
      </div>

      {synlige.length === 0 ? (
        <TomTilstand
          icon="list"
          title="Ingen tester registrert ennå"
          sub="Resultater dukker opp her når spillerne gjennomfører tester."
        />
      ) : (
        <div style={{ maxHeight: 520, overflowY: "auto", margin: "0 -4px", padding: "0 4px" }}>
          {synlige.map((r, i) => (
            <Rad
              key={r.key}
              onClick={() => router.push(`/admin/spillere/${r.spillerId}`)}
              leading={<AvatarInit navn={r.navn} size={34} />}
              title={r.navn}
              sub={`${r.test} · ${r.dato}`}
              meta={
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                    justifyContent: "flex-end",
                  }}
                >
                  <span
                    style={{
                      fontFamily: T.mono,
                      fontSize: 15,
                      fontWeight: 700,
                      color: r.resultat === "—" ? T.mut : T.fg,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {r.resultat}
                  </span>
                  {r.delta && <DeltaChip v={r.delta} dir={r.deltaDir ?? "up"} />}
                  <StatusMerke status={r.status} />
                </span>
              }
              trailing={null}
              last={i === synlige.length - 1}
            />
          ))}
        </div>
      )}
    </Kort>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}
      {kpi}
      {liste}
    </div>
  );
}
