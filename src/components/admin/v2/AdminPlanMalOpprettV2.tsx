"use client";

/**
 * AgencyOS — Ny plan-mal (v2, retning C «Presis»). Rekomponering av
 * /admin/plan-templates/ny (`NewTemplateForm`) med BEVART funksjon: samme
 * felt-sett, samme sum-til-100%-validering for disciplinFordeling, samme
 * server action `createTemplate` (uendret i (legacy)/plan-templates/actions.ts).
 *
 * Bygget av v2-skjema-familien (Inndata/Velger/Glider) — Glider dekker
 * disciplinFordeling-sliderne uten ad-hoc UI.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { LPhase, NgfKategori } from "@/generated/prisma/client";
import {
  T,
  Caps,
  Tittel,
  Kort,
  SkjemaFelt,
  Inndata,
  Velger,
  TekstOmraade,
  Glider,
  ValideringsChip,
  CTAPill,
  Knapp,
} from "@/components/v2";
import {
  ANBEFALT_FORDELING_PER_KATEGORI,
  FASE_ALLE,
  FASE_LABEL,
  KATEGORI_ALLE,
  KATEGORI_LABEL,
  PYR_LABEL,
  type DisciplinFordeling,
} from "@/components/admin/plan-templates/shared";
import { createTemplate, type TemplateCreateInput } from "@/app/admin/(legacy)/plan-templates/actions";
import type { PyramidArea } from "@/generated/prisma/enums";

const PYR_ALLE: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

export function AdminPlanMalOpprettV2() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [kategori, setKategori] = useState<NgfKategori>("E");
  const [lPhase, setLPhase] = useState<LPhase>("GRUNN");
  const [varighetUker, setVarighetUker] = useState(4);
  const [ukentligOktAntall, setUkentligOktAntall] = useState(5);
  const [fordeling, setFordeling] = useState<DisciplinFordeling>(ANBEFALT_FORDELING_PER_KATEGORI.E);
  const [minAlder, setMinAlder] = useState("");
  const [maxAlder, setMaxAlder] = useState("");

  const sum = Math.round((fordeling.FYS + fordeling.TEK + fordeling.SLAG + fordeling.SPILL + fordeling.TURN) * 100);

  function velgKategori(label: string) {
    const k = KATEGORI_ALLE.find((k) => KATEGORI_LABEL[k] === label) ?? kategori;
    setKategori(k);
    setFordeling(ANBEFALT_FORDELING_PER_KATEGORI[k]);
  }

  function opprett() {
    if (pending) return;
    setFeil(null);
    if (!name.trim()) {
      setFeil("Navn er påkrevd.");
      return;
    }
    if (sum !== 100) {
      setFeil(`Fordelingen må summere til 100 % (er nå ${sum} %).`);
      return;
    }
    const input: TemplateCreateInput = {
      name: name.trim(),
      description: description.trim() || null,
      kategori,
      lPhase,
      varighetUker,
      ukentligOktAntall,
      disciplinFordeling: fordeling,
      minAlder: minAlder ? parseInt(minAlder, 10) : null,
      maxAlder: maxAlder ? parseInt(maxAlder, 10) : null,
      approved: false,
    };
    startTransition(async () => {
      const res = await createTemplate(input);
      if (res.ok) router.push(`/admin/plan-templates/${res.data.templateId}/rediger`);
      else setFeil(res.error);
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div>
        <Caps>AgencyOS · Planlegge · Ny mal</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="mal.">Opprett</Tittel>
        </div>
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, marginTop: 8 }}>
          Fyll inn metadata og opprett. Du kan legge til økter etterpå.
        </p>
      </div>

      <Kort>
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
          <div className="md:col-span-2">
            <SkjemaFelt label="Navn"><Inndata label={null} value={name} onChange={setName} placeholder="F.eks. E Konkurranse Standard" /></SkjemaFelt>
          </div>
          <div className="md:col-span-2">
            <SkjemaFelt label="Beskrivelse"><TekstOmraade label={null} value={description} onChange={setDescription} rows={3} /></SkjemaFelt>
          </div>
          <SkjemaFelt label="Kategori">
            <Velger label={null} options={KATEGORI_ALLE.map((k) => KATEGORI_LABEL[k])} value={KATEGORI_LABEL[kategori]} onChange={velgKategori} />
          </SkjemaFelt>
          <SkjemaFelt label="Fase">
            <Velger label={null} options={FASE_ALLE.map((f) => FASE_LABEL[f])} value={FASE_LABEL[lPhase]} onChange={(l) => setLPhase(FASE_ALLE.find((f) => FASE_LABEL[f] === l) ?? lPhase)} />
          </SkjemaFelt>
          <SkjemaFelt label="Varighet (uker)"><Inndata label={null} mono value={String(varighetUker)} onChange={(v) => setVarighetUker(Math.max(1, Math.min(52, parseInt(v || "1", 10))))} /></SkjemaFelt>
          <SkjemaFelt label="Økt per uke"><Inndata label={null} mono value={String(ukentligOktAntall)} onChange={(v) => setUkentligOktAntall(Math.max(1, Math.min(14, parseInt(v || "1", 10))))} /></SkjemaFelt>
          <SkjemaFelt label="Min alder"><Inndata label={null} mono value={minAlder} onChange={setMinAlder} /></SkjemaFelt>
          <SkjemaFelt label="Maks alder"><Inndata label={null} mono value={maxAlder} onChange={setMaxAlder} /></SkjemaFelt>
        </div>
      </Kort>

      <Kort eyebrow="Discipline-fordeling (start fra anbefalt)" action={<Caps size={9} color={sum === 100 ? T.up : T.down}>{sum} %</Caps>}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {PYR_ALLE.map((p) => (
            <Glider
              key={p}
              label={PYR_LABEL[p]}
              min={0}
              max={100}
              value={Math.round(fordeling[p] * 100)}
              enhet="%"
              onChange={(v) => setFordeling({ ...fordeling, [p]: v / 100 })}
            />
          ))}
        </div>
      </Kort>

      {feil && <ValideringsChip tone="advarsel" tekst={feil} />}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <Link href="/admin/plan-templates" style={{ textDecoration: "none" }}>
          <CTAPill ghost>Avbryt</CTAPill>
        </Link>
        <Knapp icon="save" onClick={opprett} disabled={pending}>{pending ? "Oppretter…" : "Opprett og fortsett til editor"}</Knapp>
      </div>
    </div>
  );
}
