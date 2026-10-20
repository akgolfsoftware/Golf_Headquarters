"use client";

import { useState, useTransition } from "react";
import { Knapp, Varsel } from "@/components/admin/agencyos-ny/ny";
import { importerSkoledata } from "./actions";

const EKSEMPEL = `# YYYY-MM-DD|TRINN(valgfritt)|KATEGORI|Tittel|Notat(valgfritt)
# KATEGORI: TIME | PROVE | HELDAGSPROVE | EKSAMEN | FERIE | SKOLETUR | ANNET
2026-10-05|VG1|PROVE|Norsk HM|
2026-10-19||FERIE|Høstferie|Hele uken
2026-02-23|VG2|SKOLETUR|Tur til Oslo|`;

export function SkoledataForm({ groupId }: { groupId: string }) {
  const [pending, startTransition] = useTransition();
  const [resultat, setResultat] = useState<{ ok: boolean; melding: string; feil: string[] } | null>(null);

  function send(formData: FormData) {
    startTransition(async () => {
      const svar = await importerSkoledata(groupId, formData);
      setResultat(
        svar.ok
          ? { ok: true, melding: `${svar.antall} rader lagt inn.`, feil: svar.feil }
          : { ok: false, melding: "Importen feilet.", feil: svar.feil },
      );
    });
  }

  return (
    <form action={send} className="kort" style={{ display: "grid", gap: 16 }}>
      <label className="felt" style={{ maxWidth: 220 }}>
        <span className="etikett">Skoleår</span>
        <input name="schoolYear" defaultValue="2026/2027" />
      </label>

      <div className="kort dempet" style={{ gap: 6 }}>
        <b className="undertittel">Slik leses det</b>
        <p className="forklar">Én rad per linje: dato, trinn (valgfritt), kategori, tittel og notat (valgfritt), skilt med loddrett strek. Skoleferier og prøveuker legges inn som merker i årsplanen. Samlinger flyttes aldri av seg selv.</p>
        <p className="kilde mono">Kategori: TIME · PROVE · HELDAGSPROVE · EKSAMEN · FERIE · SKOLETUR · ANNET</p>
      </div>

      <label className="felt">
        <span className="etikett">Data, én rad per linje</span>
        <textarea name="data" rows={14} defaultValue={EKSEMPEL} spellCheck={false} style={{ font: "500 13px/1.5 var(--mono)", minHeight: 240 }} />
      </label>

      <div className="knapper">
        <Knapp type="submit" disabled={pending}>{pending ? "Importerer …" : "Importer"}</Knapp>
      </div>

      {resultat && (
        <Varsel tone={resultat.ok ? "ok" : "advarsel"} tittel={resultat.melding}>
          {resultat.feil.length > 0 && <span style={{ display: "grid", gap: 2 }}>{resultat.feil.map((f, i) => <span key={i}>{f}</span>)}</span>}
        </Varsel>
      )}
    </form>
  );
}
