"use client";

/**
 * AgencyOS Tester — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * Stallens testresultater. T.* only. FYS-plassholder: ingen fasit-fargekoding.
 */

import { useEffect, useMemo, useState } from "react";
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

/** md-breakpoint-speil (matcher V2Shell/AdminBookingerV2). */
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
  const mobile = useMobile();
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
        <Caps>Analysere · Tester · AgencyOS</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="tester." mobile={mobile}>Stallens</Tittel>
        </div>
      </div>
      <StatusPill tone={data.rader.length > 0 ? "lime" : "warn"}>
        {data.rader.length === 0 ? "Ingen resultater" : `${data.rader.length} resultater`}
      </StatusPill>
    </div>
  );

  const primaerCta = (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <Link href="/admin/tester/tildel" style={{ textDecoration: "none", display: "block" }}>
        <CTAPill icon="plus" full>
          Registrer test
        </CTAPill>
      </Link>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
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
        <div style={{ maxHeight: mobile ? undefined : 520, overflowY: mobile ? "visible" : "auto", margin: "0 -4px", padding: "0 4px" }}>
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
      {primaerCta}
      {liste}
    </div>
  );
}
