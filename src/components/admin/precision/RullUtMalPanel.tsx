"use client";

/**
 * Å3 · «Rull ut mal til gruppa» — planleggings-pyramidens masseoperasjon:
 * velg planmal + antall uker + startuke → alle medlemmene får ukene lagt inn
 * i én operasjon (coachApplyTemplateToGroup). Dedup PER ØKT (G3): økter som
 * kolliderer med en annen kilde hoppes over og rapporteres ærlig; re-kjøring
 * av samme gruppe er stille idempotent (aldri overskriving).
 *
 * Nytt design 17.10 (pakke 7): vises inni Gruppa (.agn-s) og bruker byggeklossene der.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Knapp, Seksjon, Varsel } from "@/components/admin/agencyos-ny/ny";
import { coachApplyTemplateToGroup } from "@/lib/workbench/apply-template-actions";

export interface RullUtMal {
  id: string;
  name: string;
  varighetUker: number;
  sessionCount: number;
}

export function RullUtMalPanel({ groupId, maler, antallMedlemmer }: {
  groupId: string;
  maler: RullUtMal[];
  antallMedlemmer: number;
}) {
  const router = useRouter();
  const [apen, setApen] = useState(false);
  const [malId, setMalId] = useState(maler[0]?.id ?? "");
  const [uker, setUker] = useState(maler[0]?.varighetUker ?? 4);
  const [start, setStart] = useState<"0" | "1">("1");
  const [kjorer, setKjorer] = useState(false);
  const [resultat, setResultat] = useState<string | null>(null);
  const [hoppet, setHoppet] = useState<{ navn: string; uke: number; okt?: string; grunn?: "KRYSSKILDE" | "FEIL" }[]>([]);
  const [feil, setFeil] = useState<string | null>(null);

  const valgtMal = maler.find((m) => m.id === malId) ?? null;

  const kjor = async () => {
    if (!valgtMal || kjorer) return;
    setKjorer(true);
    setFeil(null);
    setResultat(null);
    const res = await coachApplyTemplateToGroup(groupId, valgtMal.id, {
      startWeekOffset: Number(start),
      uker,
    });
    setKjorer(false);
    if (res.ok) {
      setResultat(`${res.okterOpprettet ?? 0} økter lagt inn for ${res.spillere ?? 0} spillere.`);
      setHoppet(res.hoppet ?? []);
      router.refresh();
    } else {
      setFeil(res.error ?? "Utrullingen feilet.");
    }
  };

  if (maler.length === 0) return null;

  return (
    <Seksjon tittel="Planlegg for hele gruppa">
      {!apen ? (
        <div className="kort dempet">
          <p className="forklar">Rull ut en planmal til alle {antallMedlemmer} medlemmene i én operasjon. {maler.length} maler.</p>
          <div className="knapper"><Knapp variant="sek" onClick={() => setApen(true)}>Rull ut mal</Knapp></div>
        </div>
      ) : (
        <div className="kort">
          <div className="felt">
            <label htmlFor="rull-mal">Planmal</label>
            <select id="rull-mal" value={malId} disabled={kjorer} onChange={(e) => {
              setMalId(e.target.value);
              const m = maler.find((x) => x.id === e.target.value);
              if (m) setUker(m.varighetUker);
            }}>
              {maler.map((m) => <option key={m.id} value={m.id}>{m.name} · {m.varighetUker} uker · {m.sessionCount} økter</option>)}
            </select>
          </div>
          <div className="felt">
            <label htmlFor="rull-uker">Antall uker</label>
            <input id="rull-uker" type="number" min={1} max={valgtMal?.varighetUker ?? 8} value={uker} disabled={kjorer}
              onChange={(e) => setUker(Math.max(1, Math.min(valgtMal?.varighetUker ?? 8, Number(e.target.value) || 1)))} />
          </div>
          <div className="felt">
            <span className="etikett">Start</span>
            <div className="valg" role="group" aria-label="Start">
              <button type="button" aria-pressed={start === "0"} onClick={() => setStart("0")}>Denne uka</button>
              <button type="button" aria-pressed={start === "1"} onClick={() => setStart("1")}>Neste uke</button>
            </div>
          </div>
          <p className="kilde">Økter som kolliderer med noe spilleren alt har, hoppes over. Ingenting overskrives.</p>
          <div className="knapper">
            <Knapp disabled={kjorer || !valgtMal} onClick={kjor}>{kjorer ? "Ruller ut …" : `Rull ut til ${antallMedlemmer} spillere`}</Knapp>
            <Knapp variant="spok" onClick={() => setApen(false)}>Lukk</Knapp>
          </div>
          {feil && <Varsel tone="advarsel">{feil}</Varsel>}
          {resultat && <Varsel tone="ok" tittel={resultat}>
            {hoppet.length > 0 ? `Hoppet over: ${hoppet.map((h) => h.grunn === "FEIL" ? `${h.navn} (uke +${h.uke}, feil)` : `${h.navn} (uke +${h.uke}${h.okt ? `, ${h.okt}` : ""}, kolliderte)`).join(" · ")}` : undefined}
          </Varsel>}
        </div>
      )}
    </Seksjon>
  );
}
