"use client";

/**
 * AG-16b Skoledata i Precision Athletics (tegnet i natt, AG-16b.jsx i
 * Claude Design 7d7c2994). Samme import som før (importerSkoledata, EDIT_GROUP_PLANS):
 * skoleår og en limt-inn tabell med én rad per linje.
 */
import { useState, useTransition } from "react";
import { Upload, CircleAlert, FileWarning } from "lucide-react";
import { Knapp, Meta, FeilTilstand, LasterTilstand } from "@/components/precision/pa";
import { Side, SideHode, Skjemafelt } from "@/components/precision/pa-a4";
import { InlineVarsel } from "@/components/precision/pa-a5";
import { GruppeFanerPa } from "./AG16bArsplan";
import { importerSkoledata } from "@/app/admin/grupper/[id]/arsplan/skoledata/actions";

export type AG16bSkoledataTilstand = "data" | "resultat-ok" | "resultat-feil" | "laster" | "feil";

const EKSEMPEL = `# YYYY-MM-DD|TRINN(valgfritt)|KATEGORI|Tittel|Notat(valgfritt)
# KATEGORI: TIME | PROVE | HELDAGSPROVE | EKSAMEN | FERIE | SKOLETUR | ANNET
2026-10-05|VG1|PROVE|Norsk HM|
2026-10-19||FERIE|Høstferie|Hele uken
2026-02-23|VG2|SKOLETUR|Tur til Oslo|`;

type Resultat = { ok: boolean; melding: string; feil: string[] };

export function AG16bSkoledata({
  gruppe, tilstand = "data", importer = importerSkoledata, startResultat = null,
}: {
  gruppe: { id: string; navn: string };
  tilstand?: AG16bSkoledataTilstand;
  /** Prøvefilen sender inn en stubb; siden bruker server-handlingen. */
  importer?: (groupId: string, fd: FormData) => Promise<{ ok: true; antall: number; feil: string[] } | { ok: false; feil: string[] }>;
  startResultat?: Resultat | null;
}) {
  const [pending, start] = useTransition();
  const [resultat, setResultat] = useState<Resultat | null>(startResultat);

  function send(fd: FormData) {
    start(async () => {
      const svar = await importer(gruppe.id, fd);
      setResultat(svar.ok
        ? { ok: true, melding: `${svar.antall} rader lagt inn.`, feil: svar.feil }
        : { ok: false, melding: "Importen feilet. Ingenting er lagt inn.", feil: svar.feil });
    });
  }

  return <Side max={1200}>
    <SideHode kicker="Mer · Grupper" title="Legg inn skoledata"
      sub={`${gruppe.navn}. Lim inn skolerute, timeplan eller prøveplan, én rad per linje. Brukes som grunnlag i gruppas årsplan.`} />
    <GruppeFanerPa id={gruppe.id} aktiv="skoledata" />
    {tilstand === "laster" ? <LasterTilstand text="Henter skjemaet …" />
      : tilstand === "feil" ? <FeilTilstand icon={CircleAlert} title="Skjemaet kunne ikke åpnes" text="Ingen skoledata er endret. Prøv igjen." code="FEIL 503 · SKOLEDATA" />
      : <form action={send} className="pa-a5-stack" style={{ maxWidth: 760 }}>
          <Skjemafelt label="Skoleår" hint="Formen 2026/2027" required>
            <input name="schoolYear" className="a4-input a4-input--mono" defaultValue="2026/2027" inputMode="text" />
          </Skjemafelt>
          <label style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
            <span className="pa-field__label">Data, én rad per linje</span>
            <textarea name="data" rows={12} defaultValue={EKSEMPEL} spellCheck={false}
              style={{ width: "100%", boxSizing: "border-box", minHeight: 240, padding: 12, borderRadius: "var(--radius)", border: "1px solid var(--border-control)", background: "var(--surface-card)", color: "var(--text-primary)", font: "500 13px/1.5 var(--font-mono)", resize: "vertical" }} />
            <Meta>DATO|TRINN (VG1, VG2, VG3 ELLER TOMT)|KATEGORI|TITTEL|NOTAT</Meta>
          </label>
          <div><Knapp type="submit" icon={Upload} iconName="upload" loading={pending} loadingText="Importerer …">Importer</Knapp></div>
          {resultat && <InlineVarsel tone={resultat.ok ? "ok" : "signal"} tittel={resultat.melding}>
            {resultat.feil.length > 0 && <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4, overflowWrap: "anywhere" }}>
              {resultat.feil.map((f, i) => <li key={i}>{f}</li>)}
            </ul>}
            {!resultat.ok && <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><FileWarning size={14} aria-hidden /><Meta>RETT LINJENE OVER OG PRØV IGJEN</Meta></span>}
          </InlineVarsel>}
        </form>}
  </Side>;
}
