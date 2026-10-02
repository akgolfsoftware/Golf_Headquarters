"use client";

/**
 * Planmal-detalj (/admin/plan-templates/[id]) i Precision Athletics, under
 * Plan-hub (AG-14). Samme data og samme handlinger som før: duplicateTemplate,
 * archiveTemplate/unarchiveTemplate, lenke til editoren og effekt-historikken.
 *
 * Endret: uke-programmet brytes nå per uke i stedet for et 640 px bredt
 * rutenett som krevde sidelengs rulling. CS-mål på øvelsene vises ikke
 * (CS-skalaen er utgått); verdien ligger urørt i malen.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore, ArrowLeft, CalendarX, Copy, LineChart, Pencil } from "lucide-react";
import { AkseMerke, Knapp, KnappLenke, Meta, StatusPille, TomTilstand } from "@/components/precision/pa";
import { Nokkelverdi, SideHode } from "@/components/precision/pa-a4";
import { Ark, Etikett, Liste, Listerad, Prosentbar, Seksjon, Varsel } from "@/components/precision/pa-planhub";
import type { LPhase, NgfKategori, PyramidArea, SessionEnvironment, SkillArea } from "@/generated/prisma/enums";
import { archiveTemplate, duplicateTemplate, unarchiveTemplate } from "@/app/admin/(legacy)/plan-templates/actions";
import { DAG_LABEL, ENV_LABEL, KATEGORI_LABEL, SKILL_LABEL, type DisciplinFordeling, type DrillEntry } from "@/components/admin/plan-templates/shared";
import { LPHASE_LABEL } from "@/lib/labels/taxonomy";
import { formaterFortegn, formaterTall } from "@/lib/format-tall";
import { AkseForklaring, UkeRutenett, akseAv } from "./AG14MalFelles";

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

  return <div className="pa-side" style={{ maxWidth: 1100 }}>
    <div><KnappLenke href="/admin/plan?fane=ukemaler" variant="ghost" icon={ArrowLeft} iconName="arrow-left">Plan-hub</KnappLenke></div>
    <SideHode kicker={`Planmal · ${template.varighetUker <= 1 ? "ukemal" : "program"}`} title={template.name}
      sub={template.description ?? "Ingen beskrivelse lagt til ennå."}
      actions={<KnappLenke href={`/admin/plan-templates/${template.id}/rediger`} icon={Pencil} iconName="pencil">Rediger struktur</KnappLenke>} />

    <div className="a10-knapperad">
      <StatusPille tone={template.approved ? "ok" : "neutral"}>{template.approved ? "Godkjent" : "Utkast"}</StatusPille>
      <Meta>KATEGORI {template.kategori} · {LPHASE_LABEL[template.lPhase].toUpperCase()} · {template.varighetUker} UKER · {template.ukentligOktAntall} ØKTER/UKE</Meta>
    </div>

    <div className="a10-to">
      <Seksjon tittel="Uke-program" meta={`${template.sessions.length} ØKTER · ${template.varighetUker} UKER`}>
        {template.sessions.length === 0
          ? <TomTilstand icon={CalendarX} title="Ingen økter i malen ennå" text="Åpne editoren («Rediger struktur») for å legge inn økter uke for uke." />
          : <UkeRutenett varighetUker={template.varighetUker} onVelg={setAktivId}
            okter={template.sessions.map((s) => ({ ...s, drillAntall: s.drills.length }))} />}
        <AkseForklaring />
      </Seksjon>
      <div className="a10-stabel">
        <Seksjon tittel="Nøkkeltall">
          <Nokkelverdi items={[
            ["Brukt", `${template.usageCount} ${template.usageCount === 1 ? "gang" : "ganger"}`],
            ["SG-Total-delta", formaterFortegn(template.effectivenessAvg, 1), { mono: true }],
            ["Antall økter", String(template.sessions.length), { mono: true }],
            ["Effektivitet", rating != null ? `${formaterTall(rating, 1, true)}/5` : "—", { mono: true, hint: "SG-TOTAL-DELTA OMREGNET TIL 1–5" }],
            ["Kategori", KATEGORI_LABEL[template.kategori]],
            ["Alder", alder],
          ]} />
        </Seksjon>
        <Seksjon tittel="Fordeling" meta={`MOT ANBEFALT FOR NIVÅ ${template.kategori}`}>
          <Liste label="Fordeling per akse">
            {AKSE_ORDEN.map((a) => {
              const verdi = Math.round(template.fordeling[a] * 100), anbefalt = Math.round(template.anbefaltFordeling[a] * 100);
              return <Listerad key={a} mal="72px minmax(0,1fr) auto" min={44}>
                <AkseMerke axis={akseAv(a)} size="sm" />
                <Prosentbar verdi={verdi} merke={anbefalt} akse={akseAv(a)} label={`${a}: ${verdi} %, anbefalt ${anbefalt} %`} />
                <Meta>{verdi} % / {anbefalt} %</Meta>
              </Listerad>;
            })}
          </Liste>
          <Meta>MALENS ANDEL / ANBEFALT, I PROSENT · STREKEN ER ANBEFALT</Meta>
        </Seksjon>
      </div>
    </div>

    {feil && <Varsel tone="warn" tittel="Handlingen feilet">{feil}</Varsel>}
    <div className="a10-knapperad">
      <Knapp variant="secondary" icon={Copy} iconName="copy" onClick={dupliser} disabled={venter}>Dupliser</Knapp>
      <Knapp variant="ghost" icon={template.approved ? Archive : ArchiveRestore} iconName={template.approved ? "archive" : "archive-restore"} onClick={arkiver} disabled={venter}>{template.approved ? "Arkiver" : "Gjenåpne"}</Knapp>
      <KnappLenke href={`/admin/plan-templates/${template.id}/effectiveness`} variant="ghost" icon={LineChart} iconName="line-chart">Se effekt-historikk</KnappLenke>
    </div>

    <Ark open={aktiv != null} onClose={() => setAktivId(null)} tittel={aktiv?.title ?? ""}
      kicker={aktiv ? `Uke ${aktiv.ukeNr} · ${DAG_LABEL[aktiv.dagNr - 1]} · ${aktiv.varighetMin} min · ${ENV_LABEL[aktiv.environment]}` : undefined}>
      {aktiv && <>
        <div className="a10-knapperad">
          <AkseMerke axis={akseAv(aktiv.pyramidArea)} />
          {aktiv.skillArea && <Meta>{SKILL_LABEL[aktiv.skillArea].toUpperCase()}</Meta>}
        </div>
        {aktiv.focus && <Seksjon tittel="Fokus"><p className="a10-ev__tekst" style={{ margin: 0, color: "var(--text-primary)" }}>{aktiv.focus}</p></Seksjon>}
        <Seksjon tittel={`Øvelser (${aktiv.drills.length})`}>
          {aktiv.drills.length === 0 ? <Meta>INGEN ØVELSER I ØKTA</Meta> : <Liste label="Øvelser">
            {aktiv.drills.map((d, i) => <Listerad key={`${d.exerciseId}-${i}`} mal="minmax(0,1fr)" min={44}>
              <Etikett a={d.exerciseName ?? "Øvelse ikke funnet"} sub={[d.sets != null ? `${d.sets} sett` : null, d.reps != null ? `${d.reps} reps` : null, d.notes].filter(Boolean).join(" · ").toUpperCase()} />
            </Listerad>)}
          </Liste>}
        </Seksjon>
        {aktiv.notes && <Seksjon tittel="Notater"><p className="a10-ev__tekst" style={{ margin: 0, color: "var(--text-primary)", whiteSpace: "pre-wrap" }}>{aktiv.notes}</p></Seksjon>}
      </>}
    </Ark>
  </div>;
}
