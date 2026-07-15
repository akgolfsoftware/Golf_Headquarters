"use client";

/**
 * AgencyOS — Rediger drill (v2, retning C «Presis»). Rekomponering av
 * /admin/drills/[id]/rediger (`DrillEditForm`, 27 felt) med BEVART funksjon
 * + felt-sett: samme server action `updateDrill` (uendret). Alle felt fra
 * legacy-editoren er med — dette er den fulle redaktøren (i motsetning til
 * `AdminDrillOpprettV2` sitt reduserte opprett-utvalg).
 *
 * Bygget av v2-skjema-familien + delte drill-form-biter
 * (PillGroup/TagListInput). csTarget-matrisen og prerequisites-listen er
 * egne, enkle rutenett/lister (samme kompleksitetsnivå som andre
 * skjerm-spesifikke mini-mønstre i biblioteket) — ingen ny mockup nødvendig.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type {
  PyramidArea,
  LPhase,
  SkillArea,
  NgfKategori,
  SessionEnvironment,
} from "@/generated/prisma/enums";
import {
  T,
  Caps,
  Tittel,
  Kort,
  SkjemaFelt,
  Inndata,
  Velger,
  TekstOmraade,
  Bryter,
  ValideringsChip,
  CTAPill,
  Knapp,
} from "@/components/v2";
import { PillGroup, TagListInput } from "./drill-form-bits";
import { updateDrill, type DrillInput } from "@/app/admin/(legacy)/drills/actions";

const DISIPLINER: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
const L_PHASES: LPhase[] = ["GRUNN", "SPESIAL", "TURNERING"];
const SKILLS: SkillArea[] = ["TEE_TOTAL", "TILNAERMING", "AROUND_GREEN", "PUTTING", "SPILL"];
const NGF: NgfKategori[] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
const ENVS: SessionEnvironment[] = ["RANGE", "BANE", "STUDIO", "HJEM", "SIMULATOR", "GYM"];

const NULLBAR_LABEL = "— Ingen —";
function velgerLabel<T extends string>(v: T | ""): string {
  return v || NULLBAR_LABEL;
}
function velgerVerdi<T extends string>(label: string, gyldige: readonly T[]): T | "" {
  return (gyldige as readonly string[]).includes(label) ? (label as T) : "";
}

export type DrillRecord = {
  id: string;
  name: string;
  description: string | null;
  videoUrl: string | null;
  pyramidArea: PyramidArea;
  lPhase: LPhase | null;
  defaultRepsSets: string | null;
  csMin: number | null;
  csMax: number | null;
  durationMin: number | null;
  skillArea: SkillArea | null;
  minKategori: NgfKategori | null;
  maxKategori: NgfKategori | null;
  minHcp: number | null;
  maxHcp: number | null;
  environment: SessionEnvironment[];
  utstyr: string[];
  intensitet: number | null;
  lPhases: LPhase[];
  morad: boolean;
  prerequisites: string[];
  tags: string[];
  coachNotes: string | null;
  kilde: string | null;
  defaultSets: number | null;
  defaultReps: number | null;
  csTargetByKategori: unknown;
};

function parseCsTarget(raw: unknown): Partial<Record<NgfKategori, number>> {
  if (!raw || typeof raw !== "object") return {};
  const out: Partial<Record<NgfKategori, number>> = {};
  for (const k of NGF) {
    const v = (raw as Record<string, unknown>)[k];
    if (typeof v === "number") out[k] = v;
  }
  return out;
}

export function AdminDrillRedigerV2({
  drill,
  andreDrills,
}: {
  drill: DrillRecord;
  andreDrills: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);

  const [name, setName] = useState(drill.name);
  const [description, setDescription] = useState(drill.description ?? "");
  const [videoUrl, setVideoUrl] = useState(drill.videoUrl ?? "");
  const [pyramidArea, setPyramidArea] = useState<PyramidArea>(drill.pyramidArea);
  const [lPhase, setLPhase] = useState<LPhase | "">(drill.lPhase ?? "");
  const [defaultRepsSets, setDefaultRepsSets] = useState(drill.defaultRepsSets ?? "");
  const [csMin, setCsMin] = useState(drill.csMin !== null ? String(drill.csMin) : "");
  const [csMax, setCsMax] = useState(drill.csMax !== null ? String(drill.csMax) : "");
  const [durationMin, setDurationMin] = useState(drill.durationMin !== null ? String(drill.durationMin) : "");
  const [skillArea, setSkillArea] = useState<SkillArea | "">(drill.skillArea ?? "");
  const [minKategori, setMinKategori] = useState<NgfKategori | "">(drill.minKategori ?? "");
  const [maxKategori, setMaxKategori] = useState<NgfKategori | "">(drill.maxKategori ?? "");
  const [minHcp, setMinHcp] = useState(drill.minHcp !== null ? String(drill.minHcp) : "");
  const [maxHcp, setMaxHcp] = useState(drill.maxHcp !== null ? String(drill.maxHcp) : "");
  const [environment, setEnvironment] = useState<SessionEnvironment[]>(drill.environment);
  const [utstyr, setUtstyr] = useState<string[]>(drill.utstyr);
  const [intensitet, setIntensitet] = useState(String(drill.intensitet ?? 5));
  const [intensitetActive, setIntensitetActive] = useState(drill.intensitet !== null);
  const [lPhases, setLPhases] = useState<LPhase[]>(drill.lPhases);
  const [morad, setMorad] = useState(drill.morad);
  const [prerequisites, setPrerequisites] = useState<string[]>(drill.prerequisites);
  const [tags, setTags] = useState<string[]>(drill.tags);
  const [coachNotes, setCoachNotes] = useState(drill.coachNotes ?? "");
  const [kilde, setKilde] = useState(drill.kilde ?? "");
  const [defaultSets, setDefaultSets] = useState(drill.defaultSets !== null ? String(drill.defaultSets) : "");
  const [defaultReps, setDefaultReps] = useState(drill.defaultReps !== null ? String(drill.defaultReps) : "");
  const [csTarget, setCsTarget] = useState<Partial<Record<NgfKategori, number>>>(parseCsTarget(drill.csTargetByKategori));

  function togglePrereq(id: string) {
    setPrerequisites((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));
  }

  function lagre() {
    if (pending) return;
    setFeil(null);
    const numOrNull = (s: string) => (s.trim() === "" ? null : Number(s.replace(",", ".")));

    const csTargetClean: Partial<Record<NgfKategori, number>> = {};
    for (const k of NGF) {
      const v = csTarget[k];
      if (typeof v === "number" && !Number.isNaN(v)) csTargetClean[k] = v;
    }

    const input: DrillInput = {
      name: name.trim(),
      description: description.trim() || null,
      videoUrl: videoUrl.trim() || null,
      pyramidArea,
      lPhase: lPhase || null,
      defaultRepsSets: defaultRepsSets.trim() || null,
      csMin: numOrNull(csMin),
      csMax: numOrNull(csMax),
      durationMin: numOrNull(durationMin),
      skillArea: skillArea || null,
      minKategori: minKategori || null,
      maxKategori: maxKategori || null,
      minHcp: numOrNull(minHcp),
      maxHcp: numOrNull(maxHcp),
      environment,
      utstyr,
      intensitet: intensitetActive ? Number(intensitet) : null,
      lPhases,
      morad,
      prerequisites,
      tags,
      coachNotes: coachNotes.trim() || null,
      kilde: kilde.trim() || null,
      defaultSets: numOrNull(defaultSets),
      defaultReps: numOrNull(defaultReps),
      csTargetByKategori: Object.keys(csTargetClean).length > 0 ? (csTargetClean as Record<NgfKategori, number>) : null,
    };

    startTransition(async () => {
      const res = await updateDrill(drill.id, input);
      if ("error" in res) {
        setFeil(res.error);
        return;
      }
      router.push(`/admin/drills/${drill.id}`);
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div>
        <Caps>{`AgencyOS · Rediger drill · ${drill.name}`}</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="drill.">Rediger</Tittel>
        </div>
      </div>

      <Kort eyebrow="Identifikasjon">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SkjemaFelt label="Navn"><Inndata label={null} value={name} onChange={setName} /></SkjemaFelt>
          <SkjemaFelt label="Beskrivelse"><TekstOmraade label={null} value={description} onChange={setDescription} rows={4} /></SkjemaFelt>
          <SkjemaFelt label="Coach-notater"><TekstOmraade label={null} value={coachNotes} onChange={setCoachNotes} rows={3} /></SkjemaFelt>
          <SkjemaFelt label="Video-URL"><Inndata label={null} type="url" value={videoUrl} onChange={setVideoUrl} placeholder="https://" /></SkjemaFelt>
          <SkjemaFelt label="Kilde"><Inndata label={null} value={kilde} onChange={setKilde} placeholder="f.eks. ak-second-brain:morad-drill-bibliotek" /></SkjemaFelt>
        </div>
      </Kort>

      <Kort eyebrow="Klassifisering">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SkjemaFelt label="Disiplin"><PillGroup options={DISIPLINER} active={[pyramidArea]} onToggle={setPyramidArea} /></SkjemaFelt>
          <SkjemaFelt label="Skill area">
            <Velger label={null} options={[NULLBAR_LABEL, ...SKILLS]} value={velgerLabel(skillArea)} onChange={(l) => setSkillArea(velgerVerdi(l, SKILLS))} />
          </SkjemaFelt>
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16 }}>
            <SkjemaFelt label="Min NGF-kategori">
              <Velger label={null} options={[NULLBAR_LABEL, ...NGF]} value={velgerLabel(minKategori)} onChange={(l) => setMinKategori(velgerVerdi(l, NGF))} />
            </SkjemaFelt>
            <SkjemaFelt label="Max NGF-kategori">
              <Velger label={null} options={[NULLBAR_LABEL, ...NGF]} value={velgerLabel(maxKategori)} onChange={(l) => setMaxKategori(velgerVerdi(l, NGF))} />
            </SkjemaFelt>
            <SkjemaFelt label="Min HCP"><Inndata label={null} mono value={minHcp} onChange={setMinHcp} /></SkjemaFelt>
            <SkjemaFelt label="Max HCP"><Inndata label={null} mono value={maxHcp} onChange={setMaxHcp} /></SkjemaFelt>
          </div>
          <SkjemaFelt label="L-faser (multi)"><PillGroup options={L_PHASES} active={lPhases} onToggle={(p) => setLPhases((a) => (a.includes(p) ? a.filter((x) => x !== p) : [...a, p]))} /></SkjemaFelt>
          <SkjemaFelt label="L-fase (primær — legacy)">
            <Velger label={null} options={[NULLBAR_LABEL, ...L_PHASES]} value={velgerLabel(lPhase)} onChange={(l) => setLPhase(velgerVerdi(l, L_PHASES))} />
          </SkjemaFelt>
          <Bryter label="MORAD — kanonisk drill" checked={morad} onChange={setMorad} />
        </div>
      </Kort>

      <Kort eyebrow="Kontekst">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SkjemaFelt label="Environment (multi)"><PillGroup options={ENVS} active={environment} onToggle={(e) => setEnvironment((a) => (a.includes(e) ? a.filter((x) => x !== e) : [...a, e]))} /></SkjemaFelt>
          <SkjemaFelt label="Utstyr"><TagListInput tags={utstyr} onChange={setUtstyr} /></SkjemaFelt>
          <SkjemaFelt label="Tags"><TagListInput tags={tags} onChange={setTags} prefix="#" /></SkjemaFelt>
          <SkjemaFelt label="Prerequisites (multi)">
            {andreDrills.length === 0 ? (
              <p style={{ margin: 0, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>Ingen andre drills.</p>
            ) : (
              <div style={{ maxHeight: 200, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2, borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel2, padding: 6 }}>
                {andreDrills.map((d) => (
                  <label key={d.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 8px", borderRadius: 8, cursor: "pointer", fontFamily: T.ui, fontSize: 13, color: T.fg }}>
                    <input type="checkbox" checked={prerequisites.includes(d.id)} onChange={() => togglePrereq(d.id)} style={{ accentColor: T.lime }} />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</span>
                  </label>
                ))}
              </div>
            )}
          </SkjemaFelt>
        </div>
      </Kort>

      <Kort eyebrow="Intensitet og varighet">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 16 }}>
            <SkjemaFelt label="Varighet (min)"><Inndata label={null} mono value={durationMin} onChange={setDurationMin} /></SkjemaFelt>
            <SkjemaFelt label="csMin"><Inndata label={null} mono value={csMin} onChange={setCsMin} /></SkjemaFelt>
            <SkjemaFelt label="csMax"><Inndata label={null} mono value={csMax} onChange={setCsMax} /></SkjemaFelt>
          </div>
          <Bryter label="Intensitet aktiv" sub={intensitetActive ? `${intensitet}/10` : "Ikke satt"} checked={intensitetActive} onChange={setIntensitetActive} />
          {intensitetActive && (
            <input type="range" min={1} max={10} step={1} value={intensitet} onChange={(e) => setIntensitet(e.target.value)} style={{ accentColor: T.lime }} />
          )}
        </div>
      </Kort>

      <Kort eyebrow="Default sets/reps">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16 }}>
            <SkjemaFelt label="Default sets"><Inndata label={null} mono value={defaultSets} onChange={setDefaultSets} /></SkjemaFelt>
            <SkjemaFelt label="Default reps"><Inndata label={null} mono value={defaultReps} onChange={setDefaultReps} /></SkjemaFelt>
          </div>
          <SkjemaFelt label="repsSets-tekst (fri-form)">
            <Inndata label={null} value={defaultRepsSets} onChange={setDefaultRepsSets} placeholder="3 sett · 10 reps, eller «gjennomfør i 12 min»" />
          </SkjemaFelt>
          <SkjemaFelt label="csTarget per NGF-kategori">
            <div className="grid grid-cols-3 sm:grid-cols-6" style={{ gap: 8 }}>
              {NGF.map((k) => (
                <div key={k} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <Caps size={9}>{k}</Caps>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={csTarget[k] ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      setCsTarget((prev) => {
                        const next = { ...prev };
                        if (v === "") delete next[k];
                        else next[k] = Number(v);
                        return next;
                      });
                    }}
                    style={{ height: 36, borderRadius: 8, border: `1px solid ${T.border}`, background: T.panel2, padding: "0 8px", fontFamily: T.mono, fontSize: 13, color: T.fg, outline: "none" }}
                  />
                </div>
              ))}
            </div>
          </SkjemaFelt>
        </div>
      </Kort>

      {feil && <ValideringsChip tone="advarsel" tekst={feil} />}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <Link href={`/admin/drills/${drill.id}`} style={{ textDecoration: "none" }}>
          <CTAPill ghost>Avbryt</CTAPill>
        </Link>
        <Knapp icon="save" onClick={lagre} disabled={pending}>{pending ? "Lagrer…" : "Lagre endringer"}</Knapp>
      </div>
    </div>
  );
}
