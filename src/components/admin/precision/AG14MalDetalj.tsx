"use client";

/**
 * Planmal-detalj (/admin/plan-templates/[id]) i Precision Athletics, under
 * Plan-hub (AG-14). Samme data og samme handlinger som før: duplicateTemplate,
 * archiveTemplate/unarchiveTemplate, lenke til editoren og effekt-historikken.
 *
 * Bølge 2 (20.10.2026): sidehode, nøkkeltall, uke-program og fordeling i AgencyOS-språket (canvas «Mal · detalj»).
 * Endret: uke-programmet brytes nå per uke i stedet for et 640 px bredt
 * rutenett som krevde sidelengs rulling. CS-mål på øvelsene vises ikke
 * (CS-skalaen er utgått); verdien ligger urørt i malen.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AkseMerke, Meta } from "@/components/precision/pa";
import { Ark, Etikett, Liste, Listerad, Seksjon as PaSeksjon } from "@/components/precision/pa-planhub";
import { Knapp, KnappLenke, Pille, Seksjon, Tom, Topp, Varsel } from "@/components/admin/agencyos-ny/ny";
import type { LPhase, NgfKategori, PyramidArea, SessionEnvironment, SkillArea } from "@/generated/prisma/enums";
import { archiveTemplate, duplicateTemplate, unarchiveTemplate } from "@/app/admin/(legacy)/plan-templates/actions";
import { DAG_LABEL, ENV_LABEL, KATEGORI_LABEL, SKILL_LABEL, type DisciplinFordeling, type DrillEntry } from "@/components/admin/plan-templates/shared";
import { LPHASE_LABEL } from "@/lib/labels/taxonomy";
import { formaterFortegn, formaterTall } from "@/lib/format-tall";
import { UkeRutenett, akseAv } from "./AG14MalFelles";
import "@/styles/agencyos-ny-mer.css";

export type PlanMalOkt = {
  id: string;
  ukeNr: number;
  dagNr: number;
  title: string;
  varighetMin: number;
  pyramidArea: PyramidArea;
  skillArea: SkillArea | null;
  environment: SessionEnvironment;
  drills: Array<DrillEntry & { exerciseName: string | null }>;
  focus: string | null;
  notes: string | null;
};

export type PlanMalDetalj = {
  id: string;
  name: string;
  description: string | null;
  kategori: NgfKategori;
  lPhase: LPhase;
  varighetUker: number;
  ukentligOktAntall: number;
  fordeling: DisciplinFordeling;
  anbefaltFordeling: DisciplinFordeling;
  minAlder: number | null;
  maxAlder: number | null;
  approved: boolean;
  usageCount: number;
  effectivenessAvg: number | null;
  sessions: PlanMalOkt[];
};

// Pyramide-rekkefølge topp→base, som mal-lista.
const AKSE_ORDEN: PyramidArea[] = ["TURN", "SPILL", "SLAG", "TEK", "FYS"];
const AKSE_FARGE: Record<PyramidArea, string> = { FYS: "var(--fys-ink)", TEK: "var(--tek-ink)", SLAG: "var(--slag)", SPILL: "var(--spill-ink)", TURN: "var(--turn)" };

export function AG14MalDetalj({ template }: { template: PlanMalDetalj }) {
  const router = useRouter();
  const [venter, start] = useTransition();
  const [aktivId, setAktivId] = useState<string | null>(null);
  const [feil, setFeil] = useState<string | null>(null);
  const aktiv = template.sessions.find((s) => s.id === aktivId) ?? null;

  function dupliser() {
    setFeil(null);
    start(async () => {
      const res = await duplicateTemplate(template.id);
      if (res.ok) router.push(`/admin/plan-templates/${res.data.templateId}`);
      else setFeil(`Kunne ikke duplisere: ${res.error}`);
    });
  }

  function arkiver() {
    setFeil(null);
    start(async () => {
      const res = template.approved ? await archiveTemplate(template.id) : await unarchiveTemplate(template.id);
      if (!res.ok) setFeil(res.error);
      else router.refresh();
    });
  }

  // Effektivitet 1–5: SG-Total-delta omregnet til en enkel skala (uendret regel).
  const rating = template.effectivenessAvg != null ? Math.min(5, Math.max(1, 3 + template.effectivenessAvg)) : null;
  const { minAlder: fra, maxAlder: til } = template;
  const alder = fra != null && til != null ? `${fra}–${til} år` : fra != null ? `Fra ${fra} år` : til != null ? `Til ${til} år` : "Alle aldre";

  return <div className="agn-s">
    <Topp tilbake={{ href: "/admin/plan?fane=ukemaler", tekst: "Plan-hub" }}
      dato={`Planmal · ${template.varighetUker <= 1 ? "ukemal" : "program"} · kategori ${template.kategori} · ${LPHASE_LABEL[template.lPhase]}`}
      tittel={template.name}
      ingress={template.description ?? "Ingen beskrivelse lagt til ennå."}
      handlinger={<>
        <KnappLenke variant="pri" href={`/admin/plan-templates/${template.id}/rediger`}>Rediger struktur</KnappLenke>
        <Knapp variant="sek" onClick={dupliser} disabled={venter}>Dupliser</Knapp>
        <Knapp variant="sek" onClick={arkiver} disabled={venter}>{template.approved ? "Arkiver" : "Gjenåpne"}</Knapp>
        <KnappLenke variant="sek" href={`/admin/plan-templates/${template.id}/effectiveness`}>Se effekt-historikk</KnappLenke>
      </>} />
    <div className="chips-lite"><Pille tone={template.approved ? "ok" : "noy"}>{template.approved ? "Godkjent" : "Utkast"}</Pille>
      <span className="kilde">{template.varighetUker} uker · {template.ukentligOktAntall} økter per uke</span></div>
    {feil && <Varsel tone="advarsel" tittel="Handlingen feilet">{feil}</Varsel>}

    <div className="teller-rad">
      <div className="teller"><span className="e">Antall økter</span><b className="t">{template.sessions.length}</b><span className="s">{template.varighetUker} uker</span></div>
      <div className="teller"><span className="e">Brukt</span><b className="t">{template.usageCount}</b><span className="s">{template.usageCount === 1 ? "gang" : "ganger"}</span></div>
      <div className="teller"><span className="e">Effektivitet</span><b className="t">{rating != null ? `${formaterTall(rating, 1, true)}/5` : "—"}</b><span className="s">SG-Total-delta {formaterFortegn(template.effectivenessAvg, 1)}</span></div>
      <div className="teller"><span className="e">Alder</span><b className="t" style={{ fontSize: 22 }}>{alder.replace(" år", "")}</b><span className="s">{KATEGORI_LABEL[template.kategori]}</span></div>
    </div>

    <div className="to-del bred-v">
      <Seksjon tittel="Uke-program" kilde={`${template.sessions.length} økter · ${template.varighetUker} uker`}>
        {template.sessions.length === 0
          ? <Tom tittel="Ingen økter i malen ennå" tekst="Åpne editoren («Rediger struktur») for å legge inn økter uke for uke." />
          : <UkeRutenett varighetUker={template.varighetUker} onVelg={setAktivId}
            okter={template.sessions.map((s) => ({ ...s, drillAntall: s.drills.length }))} />}
      </Seksjon>
      <Seksjon tittel="Fordeling per akse" kilde={`mot anbefalt for nivå ${template.kategori}`}>
        <div className="mal-fordeling">
          {AKSE_ORDEN.map((a) => {
            const verdi = Math.round(template.fordeling[a] * 100), anbefalt = Math.round(template.anbefaltFordeling[a] * 100);
            return <div key={a} className="mal-fordeling-rad">
              <b>{a}</b>
              <span className="mal-spor" role="img" aria-label={`${a}: ${verdi} %, anbefalt ${anbefalt} %`}><i style={{ width: `${verdi}%`, background: AKSE_FARGE[a] }} /><u style={{ left: `${anbefalt}%` }} /></span>
              <b>{verdi} % <span className="kilde">/ {anbefalt}</span></b>
            </div>;
          })}
        </div>
        <p className="kilde">Malens andel / anbefalt, i prosent · streken er anbefalt</p>
      </Seksjon>
    </div>

    <Ark open={aktiv != null} onClose={() => setAktivId(null)} tittel={aktiv?.title ?? ""}
      kicker={aktiv ? `Uke ${aktiv.ukeNr} · ${DAG_LABEL[aktiv.dagNr - 1]} · ${aktiv.varighetMin} min · ${ENV_LABEL[aktiv.environment]}` : undefined}>
      {aktiv && <>
        <div className="a10-knapperad">
          <AkseMerke axis={akseAv(aktiv.pyramidArea)} />
          {aktiv.skillArea && <Meta>{SKILL_LABEL[aktiv.skillArea].toUpperCase()}</Meta>}
        </div>
        {aktiv.focus && <PaSeksjon tittel="Fokus"><p className="a10-ev__tekst" style={{ margin: 0, color: "var(--text-primary)" }}>{aktiv.focus}</p></PaSeksjon>}
        <PaSeksjon tittel={`Øvelser (${aktiv.drills.length})`}>
          {aktiv.drills.length === 0 ? <Meta>INGEN ØVELSER I ØKTA</Meta> : <Liste label="Øvelser">
            {aktiv.drills.map((d, i) => <Listerad key={`${d.exerciseId}-${i}`} mal="minmax(0,1fr)" min={44}>
              <Etikett a={d.exerciseName ?? "Øvelse ikke funnet"} sub={[d.sets != null ? `${d.sets} sett` : null, d.reps != null ? `${d.reps} reps` : null, d.notes].filter(Boolean).join(" · ").toUpperCase()} />
            </Listerad>)}
          </Liste>}
        </PaSeksjon>
        {aktiv.notes && <PaSeksjon tittel="Notater"><p className="a10-ev__tekst" style={{ margin: 0, color: "var(--text-primary)", whiteSpace: "pre-wrap" }}>{aktiv.notes}</p></PaSeksjon>}
      </>}
    </Ark>
  </div>;
}
