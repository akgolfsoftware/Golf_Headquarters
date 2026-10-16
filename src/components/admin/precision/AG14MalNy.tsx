"use client";

/**
 * Ny planmal (/admin/plan-templates/ny) i Precision Athletics, under Plan-hub
 * (AG-14). Samme felt, samme validering (navn påkrevd, fordelingen må
 * summere til 100 %) og samme handling (createTemplate) med videresending til
 * editoren som før. Kategori-bytte setter anbefalt fordeling som utgangspunkt.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { Knapp, KnappLenke, Meta, StatusPille } from "@/components/precision/pa";
import { SideHode } from "@/components/precision/pa-a4";
import { Seksjon, Varsel } from "@/components/precision/pa-planhub";
import { createTemplate, type TemplateCreateInput } from "@/app/admin/(legacy)/plan-templates/actions";
import { ANBEFALT_FORDELING_PER_KATEGORI, type DisciplinFordeling } from "@/components/admin/plan-templates/shared";
import { FordelingGlidere, MalMetadata, fordelingSum, type MalMetadataVerdier } from "./AG14MalFelles";

export function AG14MalNy() {
  const router = useRouter();
  const [lagrer, start] = useTransition();
  const [v, setV] = useState<MalMetadataVerdier>({ name: "", description: "", kategori: "E", lPhase: "GRUNN", varighetUker: 4, ukentligOktAntall: 5, minAlder: "", maxAlder: "" });
  const [fordeling, setFordeling] = useState<DisciplinFordeling>(ANBEFALT_FORDELING_PER_KATEGORI.E);
  const [feil, setFeil] = useState<string | null>(null);
  const [navnFeil, setNavnFeil] = useState<string | undefined>();
  const sum = fordelingSum(fordeling);

  function endre(p: Partial<MalMetadataVerdier>) {
    setV((x) => ({ ...x, ...p }));
    if (p.kategori) setFordeling(ANBEFALT_FORDELING_PER_KATEGORI[p.kategori]);
  }

  function opprett() {
    setFeil(null);
    setNavnFeil(undefined);
    if (!v.name.trim()) { setNavnFeil("Navn er påkrevd."); return; }
    if (sum !== 100) { setFeil(`Fordelingen må summere til 100 % (er nå ${sum} %).`); return; }
    const input: TemplateCreateInput = {
      name: v.name.trim(),
      description: v.description.trim() || null,
      kategori: v.kategori,
      lPhase: v.lPhase,
      varighetUker: v.varighetUker,
      ukentligOktAntall: v.ukentligOktAntall,
      disciplinFordeling: fordeling,
      minAlder: v.minAlder ? parseInt(v.minAlder, 10) : null,
      maxAlder: v.maxAlder ? parseInt(v.maxAlder, 10) : null,
      approved: false,
    };
    start(async () => {
      const res = await createTemplate(input);
      if (res.ok) router.push(`/admin/plan-templates/${res.data.templateId}/rediger`);
      else setFeil(res.error);
    });
  }

  return <div className="pa-side" style={{ maxWidth: 960 }}>
    <div><KnappLenke href="/admin/plan?fane=ukemaler" variant="ghost" icon={ArrowLeft} iconName="arrow-left">Plan-hub</KnappLenke></div>
    <SideHode kicker="Plan · ny mal" title="Ny planmal" sub="Fyll inn metadata og opprett. Du legger inn økter uke for uke etterpå." />
    <Seksjon tittel="Metadata">
      <MalMetadata v={v} onEndre={endre} navnFeil={navnFeil} />
    </Seksjon>
    <Seksjon tittel="Fordeling · starter fra anbefalt" meta={<StatusPille tone={sum === 100 ? "ok" : "warn"}>{sum} %</StatusPille>}>
      <FordelingGlidere fordeling={fordeling} onEndre={setFordeling} />
      {sum !== 100 && <Meta>FORDELINGEN SUMMERER TIL {sum} % · MÅ VÆRE 100 % FØR MALEN KAN OPPRETTES</Meta>}
    </Seksjon>
    {feil && <Varsel tone="warn" tittel="Malen er ikke opprettet">{feil}</Varsel>}
    <div className="a10-knapperad" style={{ justifyContent: "flex-end" }}>
      <Knapp icon={Check} iconName="check" onClick={opprett} loading={lagrer} loadingText="Oppretter …">Opprett og gå til editoren</Knapp>
    </div>
  </div>;
}
