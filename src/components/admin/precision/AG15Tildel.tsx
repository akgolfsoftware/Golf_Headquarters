"use client";

/**
 * AG-15 Tester › Tildel test til spiller i Precision Athletics (Claude Design
 * 7d7c2994, ui_kits/agencyos/screens/AG-15.jsx › «Tildel test»-arket).
 *
 * Tegningen legger testen i Workbench som utkast (spiller, test, uke). Koden
 * gjør noe annet i dag: `tildelTest` oppretter en TestAssignment med valgfri
 * frist og notat og varsler spilleren i appen. Skjermen følger koden og sier
 * det ærlig; Workbench-utkast krever en ny handling og er kun foreslått i PR.
 * Skjermen er like tegningen: uten nøkkeltallkort, aksefaner og søk (kun det
 * tegningen viser). Server-handlingen ligger under (legacy) og er uendret.
 * TrackMan-økter (TmTildel i AG-mer.jsx) er ikke bygget, se PR.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, Check, ArrowLeft } from "lucide-react";
import { Sidehode, TomTilstand, Meta, Knapp, AkseMerke, type Akse } from "@/components/precision/pa";
import { Felt, TekstFelt, InlineVarsel, Kort } from "@/components/precision/pa-a5";
import { TekstOmrade } from "@/components/precision/pa-a4";
import { tildelTest } from "@/app/admin/(legacy)/tester/tildel/[spillerId]/actions";
import type { AdminTildelTestV2Data } from "@/components/admin/v2/AdminTildelTestV2";
import "@/styles/precision-a5.css";

const NOTAT_MAKS = 280;

export type AG15TildelProps = {
  data: AdminTildelTestV2Data;
  /** Bytter ut server-handlingen i prøven. */
  tildel?: typeof tildelTest;
};

export function AG15Tildel({ data, tildel = tildelTest }: AG15TildelProps) {
  const router = useRouter();
  const [valgt, setValgt] = useState(data.tester[0]?.id ?? "");
  const [frist, setFrist] = useState("");
  const [notat, setNotat] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [venter, start] = useTransition();

  const fornavn = data.spillerNavn.split(" ")[0] ?? data.spillerNavn;

  function send() {
    setFeil(null);
    start(async () => {
      const res = await tildel({ spillerId: data.spillerId, testId: valgt, note: notat.trim() || undefined, dueDate: frist || undefined });
      if (res.ok) router.push(data.tilbakeHref);
      else setFeil(res.error ?? "Testen kunne ikke tildeles. Ingenting er endret.");
    });
  }

  return <div className="pa-side" style={{ maxWidth: 720, marginInline: "auto", width: "100%" }}>
    <div><Knapp variant="ghost" size="sm" icon={ArrowLeft} iconName="arrow-left" onClick={() => router.push(data.tilbakeHref)}>Tester (coach)</Knapp></div>
    <Sidehode kicker="Tester · tildel" title={`Tildel test til ${data.spillerNavn}`}
      sub="Spilleren får varsel i appen. Resultatet teller først når alle forsøk er registrert." />
    <Kort>
      <Meta>VELG TEST · {data.tester.length} I BIBLIOTEKET</Meta>
      {data.tester.length === 0
        ? <TomTilstand icon={ClipboardList} title="Ingen tester i biblioteket" text="Opprett en test under Tester før du tildeler." />
        : <div role="radiogroup" aria-label="Test" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {data.tester.map((t) => {
            const på = t.id === valgt;
            return <button key={t.id} type="button" role="radio" aria-checked={på} onClick={() => setValgt(t.id)}
              style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", minHeight: 56, padding: "10px 12px", borderRadius: "var(--radius)", border: `1px solid ${på ? "var(--border-ink)" : "var(--border-hairline)"}`, boxShadow: på ? "inset 0 0 0 1px var(--border-ink)" : "none", display: "grid", gridTemplateColumns: "auto minmax(0,1fr) auto", gap: 12, alignItems: "center" }}>
              <AkseMerke axis={t.pyramidArea.toLowerCase() as Akse} size="sm" />
              <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                <span style={{ font: "500 14px/1.3 var(--font-sans)", color: "var(--text-primary)", overflowWrap: "anywhere" }}>{t.name}</span>
                {t.description && <span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)", overflowWrap: "anywhere" }}>{t.description}</span>}
              </span>
              {på && <Check size={16} aria-label="Valgt" />}
            </button>;
          })}
        </div>}
    </Kort>

    <Kort>
      <Felt label="Frist (valgfritt)"><TekstFelt type="date" value={frist} onChange={(e) => setFrist(e.target.value)} style={{ height: "calc(100% + 2px)", margin: "-1px 0" }} /></Felt>
      <Felt label={`Notat til ${fornavn} (valgfritt)`} >
        <TekstOmrade value={notat} onChange={(v) => setNotat(v.slice(0, NOTAT_MAKS))} placeholder={`Hva skal ${fornavn} ha i tankene før testen?`} />
      </Felt>
      <InlineVarsel tone="info">Testen legges i testlisten til {fornavn}. Planen endres ikke.</InlineVarsel>
      {feil && <InlineVarsel tone="signal" tittel="Ikke tildelt.">{feil}</InlineVarsel>}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Knapp icon={Check} iconName="check" disabled={!valgt} loading={venter} loadingText="Tildeler …" onClick={send}>Tildel test</Knapp>
        <Knapp variant="ghost" disabled={venter} onClick={() => router.push(data.tilbakeHref)}>Avbryt</Knapp>
      </div>
    </Kort>
  </div>;
}
