"use client";

/**
 * AG-15 Tester i Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/agencyos/screens/AG-15.jsx).
 *
 * Tegningen har testdetalj, nivåstiger, tildeling og forslag fra
 * øvelsesbanken — ingen av delene har en handling eller datamodell i appen i
 * dag (ingen «tildel test»-action, ingen nivåstige-data, ingen kobling
 * test→øvelsesbank). Porteringen holder seg derfor til det loaderen faktisk
 * gir: KPI-rad og resultatliste med delta og status, uendret fra
 * hentTesterFlate/AdminTesterV2Data. De manglende delene er parkert —
 * se PR-teksten §Parkert. «En test teller bare med alle slag registrert»
 * er allerede sant i loaderen (testResult finnes først når testen er ferdig).
 */
import { Plus, Lightbulb, Target, ClipboardList, ChevronRight } from "lucide-react";
import { Sidehode, TomTilstand, StatusPille, Meta, Ikon, KnappLenke } from "@/components/precision/pa";
import { Tabell, Faner, type Kolonne } from "@/components/precision/pa-a5";
import type { AdminTesterV2Data, AdminTesterV2Rad, AdminTesterStatus } from "@/components/admin/v2/AdminTesterV2";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import "@/styles/precision-a5.css";

export type AG15Props = { data: AdminTesterV2Data };

function statusTone(status: AdminTesterStatus): "neutral" | "ok" | "warn" | "live" {
  if (status === "Bedre") return "ok";
  if (status === "Svakere") return "warn";
  if (status === "Pågår") return "live";
  return "neutral";
}

type Rad = AdminTesterV2Rad & { id: string };

export function AG15Tester({ data }: AG15Props) {
  const router = useRouter();
  const [filter, setFilter] = useState("alle");
  const faner = useMemo(() => [{ value: "alle", label: "Alle", count: data.rader.length }, ...data.tester.map((t) => ({ value: t, label: t, count: data.rader.filter((r) => r.test === t).length }))], [data]);
  const rader: Rad[] = useMemo(() => (filter === "alle" ? data.rader : data.rader.filter((r) => r.test === filter)).map((r) => ({ ...r, id: r.key })), [data.rader, filter]);

  const cols: Kolonne<Rad>[] = [
    { key: "navn", label: "Spiller", render: (r) => r.navn },
    { key: "test", label: "Test", render: (r) => r.test },
    { key: "resultat", label: "Resultat", mono: true, align: "right", render: (r) => r.resultat },
    { key: "delta", label: "Endring", mono: true, align: "right", render: (r) => r.delta ?? "—" },
    { key: "dato", label: "Dato", mono: true, render: (r) => r.dato },
    { key: "status", label: "Status", render: (r) => <StatusPille tone={statusTone(r.status)}>{r.status}</StatusPille> },
    { key: "aapne", label: "", render: () => <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--text-muted)" }}><Ikon icon={ChevronRight} size={16} /></span> },
  ];

  return <div className="pa-side">
    <Sidehode kicker="Tester · coach" title="Tester" sub="Resultater fra stallen. Testen teller først når spilleren har registrert alle forsøk." />
    <div className="pa-a5-stat-grid">
      {data.kpis.map((k) => <div key={k.label} className="pa-a5-stat">
        <span className="pa-a5-stat__label">{k.label}</span>
        <span className="pa-a5-stat__value">{k.value}</span>
      </div>)}
    </div>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <KnappLenke href="/admin/tester/tildel" icon={Plus} iconName="plus">Registrer test</KnappLenke>
      <KnappLenke href="/admin/tester/foreslatte" variant="ghost" icon={Lightbulb} iconName="lightbulb">Foreslåtte</KnappLenke>
      <KnappLenke href="/admin/tester/benchmarks" variant="ghost" icon={Target} iconName="target">Fasiter</KnappLenke>
    </div>
    <Faner faner={faner} value={filter} onChange={setFilter} />
    {rader.length === 0 ? <TomTilstand icon={ClipboardList} title="Ingen tester registrert ennå" text="Resultater dukker opp her når spillerne gjennomfører tester." /> : <>
      <Tabell caption={`Testresultater · siste gjennomføring · ${rader.length}`} columns={cols} rows={rader}
        onSelect={(r) => router.push(`/admin/spillere/${r.spillerId}`)} />
      <Meta>{rader.length} RAD{rader.length === 1 ? "" : "ER"} · TRYKK EN RAD FOR SPILLERENS SIDE</Meta>
    </>}
  </div>;
}
