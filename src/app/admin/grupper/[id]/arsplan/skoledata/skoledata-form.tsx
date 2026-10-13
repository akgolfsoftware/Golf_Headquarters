"use client";
import { useId, useState, useTransition } from "react";
import { Knapp } from "@/components/precision/pa";
import { osloPlanDato } from "@/lib/workbench/plan-kontekst";
import { importerSkoledata } from "./actions";

const EKSEMPEL = "YYYY-MM-DD|VG1|PROVE|Tittel|Notat\nYYYY-MM-DD||FERIE|Tittel|Notat";
function skoleaar() { const dato = osloPlanDato(); const aar = Number(dato.slice(0,4)) - (Number(dato.slice(5,7)) < 8 ? 1 : 0); return `${aar}/${aar+1}`; }
export function SkoledataForm({ groupId }: { groupId: string }) {
  const id = useId();
  const [pending, startTransition] = useTransition();
  const [schoolYear, setSchoolYear] = useState(skoleaar);
  const [data, setData] = useState("");
  const [resultat, setResultat] = useState<{ ok: boolean; melding: string; feil: string[] } | null>(null);
  return <form onSubmit={event => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    startTransition(async () => {
      try {
        const svar = await importerSkoledata(groupId, fd);
        setResultat(svar.ok ? { ok:true, melding:`${svar.antall} rader lagt inn.`, feil:svar.feil } : { ok:false, melding:"Importen feilet. Innholdet er beholdt.", feil:svar.feil });
      } catch { setResultat({ ok:false, melding:"Kunne ikke importere. Innholdet er beholdt; prøv igjen.", feil:[] }); }
    });
  }} className="space-y-6">
    <label className="group-field" htmlFor={`${id}-year`}>Skoleår<input id={`${id}-year`} name="schoolYear" required pattern="[0-9]{4}/[0-9]{4}" disabled={pending} value={schoolYear} onChange={e=>{setSchoolYear(e.target.value);setResultat(null);}} /></label>
    <div>
      <label className="group-field" htmlFor={`${id}-data`}>Data · én rad per linje<textarea id={`${id}-data`} name="data" rows={14} required spellCheck={false} disabled={pending} value={data} placeholder={EKSEMPEL} aria-describedby={`${id}-help`} onChange={e=>{setData(e.target.value);setResultat(null);}} /></label>
      <p id={`${id}-help`}>Dato | trinn | kategori | tittel | notat. Trinn kan være VG1, VG2, VG3 eller tomt. Kategorier: TIME, PROVE, HELDAGSPROVE, EKSAMEN, FERIE, SKOLETUR, ANNET.</p>
    </div>
    <Knapp type="submit" disabled={pending || !data.trim() || resultat?.ok === true} loading={pending} loadingText="Importerer …">Importer skoledata</Knapp>
    {resultat && <div className={resultat.ok ? "group-card p-4" : "group-error"} role={resultat.ok ? "status" : "alert"}>
      <p>{resultat.melding}</p>
      {resultat.feil.length>0 && <><p>Disse radene ble ikke lagt inn. Behold bare dem i feltet før neste import.</p><ul>{resultat.feil.map((f,i)=><li key={i}>{f}</li>)}</ul></>}
    </div>}
  </form>;
}
