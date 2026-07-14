"use client";

/**
 * AgencyOS v2 — Ny plan-mal (`/admin/plan-templates/ny`, AgencyOS Bølge 1.5,
 * 2026-07-14). Port fra `(legacy)/plan-templates/ny/page.tsx` +
 * `new-template-form.tsx` — samme `createTemplate`-kontrakt og
 * `ANBEFALT_FORDELING_PER_KATEGORI`-startpunkt.
 *
 * Mal-detalj (`[id]`), rediger-editoren (`[id]/rediger`, 1000+ linjer
 * uke-grid/masseredigering) og effektivitets-siden er IKKE del av denne
 * bølgen — for store/komplekse til å re-komponeres trygt i samme økt som
 * resten av Bølge 1; egen plan anbefales (se `docs/MASTER-SKJERMPLAN.md`
 * Endringslogg).
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Caps, Tittel, Kort, Knapp, Icon, T } from "@/components/v2";
import { Inndata, Velger, TekstOmraade, Glider } from "@/components/v2/skjema";
import { createTemplate, type TemplateCreateInput } from "@/app/admin/(legacy)/plan-templates/actions";
import {
  ANBEFALT_FORDELING_PER_KATEGORI,
  FASE_ALLE,
  FASE_LABEL,
  KATEGORI_ALLE,
  KATEGORI_LABEL,
  PYR_LABEL,
  type DisciplinFordeling,
} from "@/components/admin/plan-templates/shared";
import type { LPhase, NgfKategori, PyramidArea } from "@/generated/prisma/client";

const PYR_ALLE: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

function felt<T extends string>(arr: T[], label: Record<T, string>) {
  return arr.map((v) => ({ value: v, label: label[v] }));
}

export function AdminPlanMalNyV2() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [kategori, setKategori] = useState<NgfKategori>("E");
  const [lPhase, setLPhase] = useState<LPhase>("GRUNN");
  const [varighetUker, setVarighetUker] = useState("4");
  const [ukentligOktAntall, setUkentligOktAntall] = useState("5");
  const [fordeling, setFordeling] = useState<DisciplinFordeling>(ANBEFALT_FORDELING_PER_KATEGORI.E);
  const [minAlder, setMinAlder] = useState("");
  const [maxAlder, setMaxAlder] = useState("");

  const sum = Math.round((fordeling.FYS + fordeling.TEK + fordeling.SLAG + fordeling.SPILL + fordeling.TURN) * 100);

  const settKategori = (v: string) => {
    const k = v as NgfKategori;
    setKategori(k);
    setFordeling(ANBEFALT_FORDELING_PER_KATEGORI[k]);
  };

  const submit = () => {
    setFeil(null);
    if (!name.trim()) { setFeil("Navn er påkrevd."); return; }
    if (sum !== 100) { setFeil(`Fordelingen må summere til 100% (er nå ${sum}%).`); return; }
    const input: TemplateCreateInput = {
      name: name.trim(),
      description: description.trim() || null,
      kategori,
      lPhase,
      varighetUker: parseInt(varighetUker, 10) || 1,
      ukentligOktAntall: parseInt(ukentligOktAntall, 10) || 1,
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
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 720 }}>
      <Link href="/admin/plan-templates" style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none", color: T.mut, fontFamily: T.mono, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        <Icon name="arrow-left" size={12} /> Tilbake til biblioteket
      </Link>

      <div>
        <Caps size={9}>Ny mal</Caps>
        <Tittel em="mal">Opprett</Tittel>
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, marginTop: 4, maxWidth: 480 }}>Fyll inn metadata og opprett. Du kan legge til økter etterpå.</p>
      </div>

      <Kort>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Inndata label="Navn" value={name} onChange={setName} placeholder="F.eks. E Konkurranse Standard" />
          <TekstOmraade label="Beskrivelse" value={description} onChange={setDescription} rows={3} />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
            <Velger label="Kategori" options={felt(KATEGORI_ALLE, KATEGORI_LABEL)} value={kategori} onChange={settKategori} />
            <Velger label="Fase" options={felt(FASE_ALLE, FASE_LABEL)} value={lPhase} onChange={(v) => setLPhase(v as LPhase)} />
            <Inndata label="Varighet (uker)" type="number" value={varighetUker} onChange={setVarighetUker} />
            <Inndata label="Økt per uke" type="number" value={ukentligOktAntall} onChange={setUkentligOktAntall} />
            <Inndata label="Min alder" type="number" value={minAlder} onChange={setMinAlder} />
            <Inndata label="Maks alder" type="number" value={maxAlder} onChange={setMaxAlder} />
          </div>
        </div>
      </Kort>

      <Kort eyebrow="Discipline-fordeling (start fra anbefalt)">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {PYR_ALLE.map((p) => (
            <Glider
              key={p}
              label={PYR_LABEL[p]}
              min={0}
              max={100}
              step={1}
              value={Math.round(fordeling[p] * 100)}
              onChange={(n) => setFordeling({ ...fordeling, [p]: n / 100 })}
              enhet="%"
            />
          ))}
        </div>
        <div style={{ marginTop: 4, textAlign: "right", fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: sum === 100 ? T.up : T.down }}>
          Sum: {sum}%
        </div>
      </Kort>

      {feil && <div role="alert" style={{ fontFamily: T.ui, fontSize: 12.5, color: T.down }}>{feil}</div>}

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Knapp icon="check" onClick={submit} disabled={pending}>{pending ? "Oppretter…" : "Opprett og fortsett til editor"}</Knapp>
      </div>
    </div>
  );
}
