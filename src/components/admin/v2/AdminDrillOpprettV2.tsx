"use client";

/**
 * AgencyOS — Ny drill (v2, retning C «Presis»). Rekomponering av
 * /admin/drills/ny (`DrillCreateForm`) med BEVART funksjon + felt-sett:
 * samme redusert felt-utvalg som legacy (resten finjusteres på
 * drill-detaljen etterpå), samme server action `createDrill` (uendret).
 *
 * Bygget av v2-skjema-familien + delte drill-form-biter
 * (PillGroup/TagListInput). Ingen ad-hoc UI utover disse, ingen rå hex.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { PyramidArea, LPhase, SkillArea, SessionEnvironment } from "@/generated/prisma/enums";
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
import { createDrill, type DrillInput } from "@/app/admin/(legacy)/drills/actions";

const DISIPLINER: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
const L_PHASES: LPhase[] = ["GRUNN", "SPESIAL", "TURNERING"];
const SKILLS: SkillArea[] = ["TEE_TOTAL", "TILNAERMING", "AROUND_GREEN", "PUTTING", "SPILL"];
const ENVS: SessionEnvironment[] = ["RANGE", "BANE", "STUDIO", "HJEM", "SIMULATOR", "GYM"];
const SKILL_LABEL: Record<SkillArea | "", string> = {
  "": "Ingen",
  TEE_TOTAL: "TEE_TOTAL",
  TILNAERMING: "TILNAERMING",
  AROUND_GREEN: "AROUND_GREEN",
  PUTTING: "PUTTING",
  SPILL: "SPILL",
};

export function AdminDrillOpprettV2() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coachNotes, setCoachNotes] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [kilde, setKilde] = useState("");
  const [pyramidArea, setPyramidArea] = useState<PyramidArea>("TEK");
  const [skillArea, setSkillArea] = useState<SkillArea | "">("");
  const [lPhases, setLPhases] = useState<LPhase[]>([]);
  const [environment, setEnvironment] = useState<SessionEnvironment[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [morad, setMorad] = useState(false);
  const [durationMin, setDurationMin] = useState("");
  const [intensitetActive, setIntensitetActive] = useState(false);
  const [intensitet, setIntensitet] = useState("5");
  const [defaultSets, setDefaultSets] = useState("");
  const [defaultReps, setDefaultReps] = useState("");
  const [defaultRepsSets, setDefaultRepsSets] = useState("");

  function opprett() {
    if (pending) return;
    setFeil(null);
    if (name.trim().length < 1) {
      setFeil("Navn er påkrevd.");
      return;
    }
    const numOrNull = (s: string) => (s.trim() === "" ? null : Number(s.replace(",", ".")));

    const input: DrillInput = {
      name: name.trim(),
      description: description.trim() || null,
      coachNotes: coachNotes.trim() || null,
      videoUrl: videoUrl.trim() || null,
      kilde: kilde.trim() || null,
      pyramidArea,
      lPhase: null,
      skillArea: skillArea || null,
      minKategori: null,
      maxKategori: null,
      minHcp: null,
      maxHcp: null,
      environment,
      utstyr: [],
      intensitet: intensitetActive ? Number(intensitet) : null,
      lPhases,
      morad,
      prerequisites: [],
      tags,
      defaultRepsSets: defaultRepsSets.trim() || null,
      csMin: null,
      csMax: null,
      durationMin: numOrNull(durationMin),
      defaultSets: numOrNull(defaultSets),
      defaultReps: numOrNull(defaultReps),
      csTargetByKategori: null,
    };

    startTransition(async () => {
      const res = await createDrill(input);
      if ("error" in res) {
        setFeil(res.error);
        return;
      }
      if (res.success && res.data) router.push(`/admin/drills/${res.data.drillId}`);
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div>
        <Caps>AgencyOS · Planlegge</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="drill.">Ny</Tittel>
        </div>
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, marginTop: 8, maxWidth: 460 }}>
          Legg til en øvelse i biblioteket. Du kan finjustere alle felt etterpå fra drill-detaljen.
        </p>
      </div>

      <Kort eyebrow="Identifikasjon">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SkjemaFelt label="Navn"><Inndata label={null} value={name} onChange={setName} placeholder="F.eks. Stige-putting 1–3 m" /></SkjemaFelt>
          <SkjemaFelt label="Beskrivelse"><TekstOmraade label={null} value={description} onChange={setDescription} rows={4} /></SkjemaFelt>
          <SkjemaFelt label="Coach-notater" hjelp="Hvordan du forklarer drillen til spilleren.">
            <TekstOmraade label={null} value={coachNotes} onChange={setCoachNotes} rows={3} />
          </SkjemaFelt>
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16 }}>
            <SkjemaFelt label="Video-URL"><Inndata label={null} type="url" value={videoUrl} onChange={setVideoUrl} placeholder="https://" /></SkjemaFelt>
            <SkjemaFelt label="Kilde"><Inndata label={null} value={kilde} onChange={setKilde} /></SkjemaFelt>
          </div>
        </div>
      </Kort>

      <Kort eyebrow="Klassifisering">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SkjemaFelt label="Disiplin"><PillGroup options={DISIPLINER} active={[pyramidArea]} onToggle={setPyramidArea} /></SkjemaFelt>
          <SkjemaFelt label="Skill area">
            <Velger label={null} options={["Ingen", ...SKILLS]} value={SKILL_LABEL[skillArea]} onChange={(l) => setSkillArea((Object.entries(SKILL_LABEL).find(([, v]) => v === l)?.[0] ?? "") as SkillArea | "")} />
          </SkjemaFelt>
          <SkjemaFelt label="L-faser (multi)"><PillGroup options={L_PHASES} active={lPhases} onToggle={(p) => setLPhases((a) => (a.includes(p) ? a.filter((x) => x !== p) : [...a, p]))} /></SkjemaFelt>
          <Bryter label="MORAD — kanonisk drill" checked={morad} onChange={setMorad} />
        </div>
      </Kort>

      <Kort eyebrow="Kontekst">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SkjemaFelt label="Environment (multi)"><PillGroup options={ENVS} active={environment} onToggle={(e) => setEnvironment((a) => (a.includes(e) ? a.filter((x) => x !== e) : [...a, e]))} /></SkjemaFelt>
          <SkjemaFelt label="Tags"><TagListInput tags={tags} onChange={setTags} prefix="#" /></SkjemaFelt>
        </div>
      </Kort>

      <Kort eyebrow="Intensitet og varighet">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 16 }}>
            <SkjemaFelt label="Varighet (min)"><Inndata label={null} mono value={durationMin} onChange={setDurationMin} /></SkjemaFelt>
            <SkjemaFelt label="Default sets"><Inndata label={null} mono value={defaultSets} onChange={setDefaultSets} /></SkjemaFelt>
            <SkjemaFelt label="Default reps"><Inndata label={null} mono value={defaultReps} onChange={setDefaultReps} /></SkjemaFelt>
          </div>
          <SkjemaFelt label="repsSets-tekst (fri-form)">
            <Inndata label={null} value={defaultRepsSets} onChange={setDefaultRepsSets} placeholder="3 sett · 10 reps, eller «gjennomfør i 12 min»" />
          </SkjemaFelt>
          <Bryter label="Intensitet aktiv" sub={intensitetActive ? `${intensitet}/10` : "Ikke satt"} checked={intensitetActive} onChange={setIntensitetActive} />
          {intensitetActive && (
            <input type="range" min={1} max={10} step={1} value={intensitet} onChange={(e) => setIntensitet(e.target.value)} style={{ accentColor: T.lime }} />
          )}
        </div>
      </Kort>

      {feil && <ValideringsChip tone="advarsel" tekst={feil} />}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <Link href="/admin/drills" style={{ textDecoration: "none" }}>
          <CTAPill ghost>Avbryt</CTAPill>
        </Link>
        <Knapp icon="plus" onClick={opprett} disabled={pending}>{pending ? "Oppretter…" : "Opprett drill"}</Knapp>
      </div>
    </div>
  );
}
