"use client";

/**
 * AgencyOS v2 — delt felt-sett for drill-skjemaet («Ny drill» + «Rediger drill»,
 * AgencyOS Bølge 1.2, 2026-07-14).
 *
 * Port fra `(legacy)/drills/ny/drill-create-form.tsx` + `[id]/rediger/drill-edit-form.tsx`
 * (samme `DrillInput`/`createDrill`/`updateDrill`-kontrakt, uendret) — men ETT felles
 * felt-sett i stedet for to divergerende skjemaer. Legacy-create-formen utelot
 * prerequisites/csTarget/lPhase(primary)/csMin/csMax; her får «Ny drill» samme
 * fullstendige felt-sett som «Rediger» (ren utvidelse — ingen data fjernes, kun
 * konsistens: coachen skal kunne sette akkurat det samme uansett om drillen er ny
 * eller gammel). Ingen v2-mockup finnes for drill-skjemaet spesifikt («ren
 * komposisjon» per SKJERMPLAN-GJENSTAENDE.md) — komponert av v2-skjema-primitivene
 * (`Inndata`/`Velger`/`TekstOmraade`/`Avkryssing`/`Glider`) + lokale
 * chip-velgere for felt uten generisk v2-motstykke (multi-toggle akse/miljø/L-fase,
 * tag-input, csTarget-rutenett) — samme idiom som `NyOvelseArk.tsx` (Bølge 4).
 */

import { useState, type CSSProperties } from "react";
import type {
  PyramidArea,
  LPhase,
  SkillArea,
  NgfKategori,
  SessionEnvironment,
} from "@/generated/prisma/enums";
import { T, Kort, Caps, Knapp, Icon } from "@/components/v2";
import { Inndata, Velger, TekstOmraade, Avkryssing, Glider, type VelgerIdValg } from "@/components/v2/skjema";
import type { DrillInput, ActionResult } from "@/app/admin/(legacy)/drills/actions";

const DISIPLINER: { v: PyramidArea; l: string }[] = [
  { v: "FYS", l: "Fysisk" },
  { v: "TEK", l: "Teknikk" },
  { v: "SLAG", l: "Slag" },
  { v: "SPILL", l: "Spill" },
  { v: "TURN", l: "Turnering" },
];
const L_PHASES: LPhase[] = ["GRUNN", "SPESIAL", "TURNERING"];
const SKILLS: SkillArea[] = ["TEE_TOTAL", "TILNAERMING", "AROUND_GREEN", "PUTTING", "SPILL"];
const NGF: NgfKategori[] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
const ENVS: SessionEnvironment[] = ["RANGE", "BANE", "STUDIO", "HJEM", "SIMULATOR", "GYM"];

const inputStil: CSSProperties = {
  width: "100%", boxSizing: "border-box", appearance: "none",
  background: T.panel2, border: `1px solid ${T.borderS}`, borderRadius: 11,
  padding: "10px 13px", fontFamily: T.ui, fontSize: 13.5, color: T.fg, outline: "none",
};

export interface DrillSkjemaInitial {
  name: string;
  description: string | null;
  videoUrl: string | null;
  kilde: string | null;
  coachNotes: string | null;
  pyramidArea: PyramidArea;
  lPhase: LPhase | null;
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
  defaultSets: number | null;
  defaultReps: number | null;
  defaultRepsSets: string | null;
  durationMin: number | null;
  csMin: number | null;
  csMax: number | null;
  csTargetByKategori: Partial<Record<NgfKategori, number>> | null;
}

export const TOM_DRILL: DrillSkjemaInitial = {
  name: "", description: null, videoUrl: null, kilde: null, coachNotes: null,
  pyramidArea: "TEK", lPhase: null, skillArea: null,
  minKategori: null, maxKategori: null, minHcp: null, maxHcp: null,
  environment: [], utstyr: [], intensitet: null, lPhases: [], morad: false,
  prerequisites: [], tags: [], defaultSets: null, defaultReps: null, defaultRepsSets: null,
  durationMin: null, csMin: null, csMax: null, csTargetByKategori: null,
};

function felt<T extends string>(arr: T[]): VelgerIdValg[] {
  return arr.map((v) => ({ value: v, label: v }));
}

function Seksjon({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <Kort eyebrow={eyebrow}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>{children}</div>
    </Kort>
  );
}

function TogglePiller<V extends string>({ opts, valgt, onToggle, disabled, prikkFarge }: {
  opts: { v: V; l: string }[];
  valgt: V[];
  onToggle: (v: V) => void;
  disabled?: boolean;
  prikkFarge?: (v: V) => string;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {opts.map((o) => {
        const on = valgt.includes(o.v);
        return (
          <button
            key={o.v}
            type="button"
            disabled={disabled}
            onClick={() => onToggle(o.v)}
            style={{
              appearance: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
              padding: "7px 12px", borderRadius: 9999, border: `1px solid ${on ? "transparent" : T.borderS}`,
              background: on ? T.lime : T.panel2, color: on ? T.onLime : T.fg2,
              fontFamily: T.ui, fontSize: 11.5, fontWeight: 600,
            }}
          >
            {prikkFarge && <span style={{ width: 6, height: 6, borderRadius: 9999, background: on ? T.onLime : prikkFarge(o.v) }} />}
            {o.l}
          </button>
        );
      })}
    </div>
  );
}

function TagInput({ label, verdier, onChange, disabled, placeholder }: {
  label: string;
  verdier: string[];
  onChange: (v: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  const leggTil = () => {
    const v = draft.trim();
    if (v && !verdier.includes(v)) onChange([...verdier, v]);
    setDraft("");
  };
  return (
    <div>
      <Caps size={9} style={{ display: "block", marginBottom: 7 }}>{label}</Caps>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); leggTil(); } }}
          placeholder={placeholder}
          disabled={disabled}
          style={{ ...inputStil, flex: 1 }}
        />
        <Knapp ghost onClick={leggTil} disabled={disabled}>Legg til</Knapp>
      </div>
      {verdier.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
          {verdier.map((v) => (
            <span key={v} style={{ display: "inline-flex", alignItems: "center", gap: 5, borderRadius: 9999, background: T.panel2, border: `1px solid ${T.border}`, padding: "4px 6px 4px 10px", fontFamily: T.mono, fontSize: 11, color: T.fg2 }}>
              {v}
              <button
                type="button"
                onClick={() => onChange(verdier.filter((x) => x !== v))}
                disabled={disabled}
                aria-label={`Fjern ${v}`}
                style={{ appearance: "none", cursor: "pointer", background: "none", border: "none", color: T.fg2, padding: 2 }}
              >
                <Icon name="x" size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export interface DrillSkjemaFelterProps {
  initial: DrillSkjemaInitial;
  andreDrills: { id: string; name: string }[];
  onLagre: (input: DrillInput) => Promise<ActionResult<{ drillId: string }>>;
  onSuksess: (drillId: string) => void;
  onAvbryt: () => void;
  lagreLabel?: string;
}

export function DrillSkjemaFelter({ initial, andreDrills, onLagre, onSuksess, onAvbryt, lagreLabel = "Lagre drill" }: DrillSkjemaFelterProps) {
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description ?? "");
  const [coachNotes, setCoachNotes] = useState(initial.coachNotes ?? "");
  const [videoUrl, setVideoUrl] = useState(initial.videoUrl ?? "");
  const [kilde, setKilde] = useState(initial.kilde ?? "");
  const [pyramidArea, setPyramidArea] = useState<PyramidArea>(initial.pyramidArea);
  const [lPhase, setLPhase] = useState<LPhase | "">(initial.lPhase ?? "");
  const [skillArea, setSkillArea] = useState<SkillArea | "">(initial.skillArea ?? "");
  const [minKategori, setMinKategori] = useState<NgfKategori | "">(initial.minKategori ?? "");
  const [maxKategori, setMaxKategori] = useState<NgfKategori | "">(initial.maxKategori ?? "");
  const [minHcp, setMinHcp] = useState(initial.minHcp !== null ? String(initial.minHcp) : "");
  const [maxHcp, setMaxHcp] = useState(initial.maxHcp !== null ? String(initial.maxHcp) : "");
  const [environment, setEnvironment] = useState<SessionEnvironment[]>(initial.environment);
  const [utstyr, setUtstyr] = useState<string[]>(initial.utstyr);
  const [lPhases, setLPhases] = useState<LPhase[]>(initial.lPhases);
  const [morad, setMorad] = useState(initial.morad);
  const [prerequisites, setPrerequisites] = useState<string[]>(initial.prerequisites);
  const [tags, setTags] = useState<string[]>(initial.tags);
  const [varighet, setVarighet] = useState(initial.durationMin !== null ? String(initial.durationMin) : "");
  const [defaultSets, setDefaultSets] = useState(initial.defaultSets !== null ? String(initial.defaultSets) : "");
  const [defaultReps, setDefaultReps] = useState(initial.defaultReps !== null ? String(initial.defaultReps) : "");
  const [defaultRepsSets, setDefaultRepsSets] = useState(initial.defaultRepsSets ?? "");
  const [csMin, setCsMin] = useState(initial.csMin !== null ? String(initial.csMin) : "");
  const [csMax, setCsMax] = useState(initial.csMax !== null ? String(initial.csMax) : "");
  const [intensitetActive, setIntensitetActive] = useState(initial.intensitet !== null);
  const [intensitet, setIntensitet] = useState(initial.intensitet ?? 5);
  const [csTarget, setCsTarget] = useState<Partial<Record<NgfKategori, number>>>(initial.csTargetByKategori ?? {});
  const [pending, setPending] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  const toggle = <V extends string>(arr: V[], v: V): V[] => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const numOrNull = (s: string) => (s.trim() === "" ? null : Number(s.replace(",", ".")));

  const lagre = async () => {
    setFeil(null);
    if (name.trim().length < 1) { setFeil("Navn er påkrevd."); return; }
    const csTargetClean: Partial<Record<NgfKategori, number>> = {};
    for (const k of NGF) {
      const v = csTarget[k];
      if (typeof v === "number" && !Number.isNaN(v)) csTargetClean[k] = v;
    }
    const input: DrillInput = {
      name: name.trim(),
      description: description.trim() || null,
      coachNotes: coachNotes.trim() || null,
      videoUrl: videoUrl.trim() || null,
      kilde: kilde.trim() || null,
      pyramidArea,
      lPhase: lPhase || null,
      skillArea: skillArea || null,
      minKategori: minKategori || null,
      maxKategori: maxKategori || null,
      minHcp: numOrNull(minHcp),
      maxHcp: numOrNull(maxHcp),
      environment,
      utstyr,
      intensitet: intensitetActive ? intensitet : null,
      lPhases,
      morad,
      prerequisites,
      tags,
      defaultRepsSets: defaultRepsSets.trim() || null,
      csMin: numOrNull(csMin),
      csMax: numOrNull(csMax),
      durationMin: numOrNull(varighet) as number | null,
      defaultSets: numOrNull(defaultSets) as number | null,
      defaultReps: numOrNull(defaultReps) as number | null,
      csTargetByKategori: (Object.keys(csTargetClean).length > 0 ? csTargetClean : null) as DrillInput["csTargetByKategori"],
    };
    setPending(true);
    const res = await onLagre(input);
    setPending(false);
    if ("error" in res) { setFeil(res.error); return; }
    if (res.success && res.data) onSuksess(res.data.drillId);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 720 }}>
      <Seksjon eyebrow="Identifikasjon">
        <Inndata label="Navn *" value={name} onChange={setName} placeholder="F.eks. Wedge-stige 40–80 m" />
        <TekstOmraade label="Beskrivelse" value={description} onChange={setDescription} rows={4} placeholder="Utførelse, mål, tips …" />
        <TekstOmraade label="Coach-notater" value={coachNotes} onChange={setCoachNotes} rows={3} placeholder="Hvordan du forklarer drillen til spilleren." />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Inndata label="Video-URL" type="url" value={videoUrl} onChange={setVideoUrl} placeholder="https://" />
          <Inndata label="Kilde" value={kilde} onChange={setKilde} placeholder="f.eks. morad-drill-bibliotek" />
        </div>
      </Seksjon>

      <Seksjon eyebrow="Klassifisering">
        <div>
          <Caps size={9} style={{ display: "block", marginBottom: 7 }}>Disiplin *</Caps>
          <TogglePiller opts={DISIPLINER} valgt={[pyramidArea]} onToggle={(v) => setPyramidArea(v)} prikkFarge={(v) => T.ax[v]} />
        </div>
        <Velger label="Skill area" options={[{ value: "", label: "— Ingen —" }, ...felt(SKILLS)]} value={skillArea} onChange={(v) => setSkillArea(v as SkillArea | "")} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Velger label="Min NGF-kategori" options={[{ value: "", label: "—" }, ...felt(NGF)]} value={minKategori} onChange={(v) => setMinKategori(v as NgfKategori | "")} />
          <Velger label="Max NGF-kategori" options={[{ value: "", label: "—" }, ...felt(NGF)]} value={maxKategori} onChange={(v) => setMaxKategori(v as NgfKategori | "")} />
          <Inndata label="Min HCP" type="number" value={minHcp} onChange={setMinHcp} />
          <Inndata label="Max HCP" type="number" value={maxHcp} onChange={setMaxHcp} />
        </div>
        <div>
          <Caps size={9} style={{ display: "block", marginBottom: 7 }}>L-faser (multi)</Caps>
          <TogglePiller opts={L_PHASES.map((p) => ({ v: p, l: p }))} valgt={lPhases} onToggle={(v) => setLPhases(toggle(lPhases, v))} />
        </div>
        <Velger label="L-fase (primary — legacy)" options={[{ value: "", label: "—" }, ...felt(L_PHASES)]} value={lPhase} onChange={(v) => setLPhase(v as LPhase | "")} />
        <Avkryssing label="MORAD — kanonisk drill" checked={morad} onChange={setMorad} />
      </Seksjon>

      <Seksjon eyebrow="Kontekst">
        <div>
          <Caps size={9} style={{ display: "block", marginBottom: 7 }}>Environment (multi)</Caps>
          <TogglePiller opts={ENVS.map((e) => ({ v: e, l: e }))} valgt={environment} onToggle={(v) => setEnvironment(toggle(environment, v))} />
        </div>
        <TagInput label="Utstyr" verdier={utstyr} onChange={setUtstyr} disabled={pending} placeholder="legg til, trykk Enter" />
        <TagInput label="Tags" verdier={tags} onChange={setTags} disabled={pending} placeholder="legg til, trykk Enter" />
        <div>
          <Caps size={9} style={{ display: "block", marginBottom: 7 }}>Prerequisites (multi)</Caps>
          {andreDrills.length === 0 ? (
            <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>Ingen andre drills.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, maxHeight: 180, overflowY: "auto", border: `1px solid ${T.border}`, borderRadius: 11, padding: 8 }}>
              {andreDrills.map((d) => (
                <Avkryssing key={d.id} label={d.name} checked={prerequisites.includes(d.id)} onChange={() => setPrerequisites(toggle(prerequisites, d.id))} />
              ))}
            </div>
          )}
        </div>
      </Seksjon>

      <Seksjon eyebrow="Intensitet og varighet">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <Inndata label="Varighet (min)" type="number" value={varighet} onChange={setVarighet} />
          <Inndata label="Default sets" type="number" value={defaultSets} onChange={setDefaultSets} />
          <Inndata label="Default reps" type="number" value={defaultReps} onChange={setDefaultReps} />
        </div>
        <Inndata label="repsSets-tekst (fri-form)" value={defaultRepsSets} onChange={setDefaultRepsSets} placeholder="3 sett · 10 reps, eller «gjennomfør i 12 min»" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Inndata label="csMin" type="number" value={csMin} onChange={setCsMin} />
          <Inndata label="csMax" type="number" value={csMax} onChange={setCsMax} />
        </div>
        <Avkryssing label="Intensitet aktiv" checked={intensitetActive} onChange={setIntensitetActive} />
        {intensitetActive && <Glider label="Intensitet" min={1} max={10} step={1} value={intensitet} onChange={setIntensitet} />}
      </Seksjon>

      <Seksjon eyebrow="csTarget per NGF-kategori">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
          {NGF.map((k) => (
            <div key={k} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, color: T.mut, textTransform: "uppercase" }}>{k}</span>
              <input
                type="number" min={0} max={100}
                value={csTarget[k] ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setCsTarget((prev) => {
                    const next = { ...prev };
                    if (v === "") delete next[k]; else next[k] = Number(v);
                    return next;
                  });
                }}
                style={{ ...inputStil, padding: "8px 6px", textAlign: "center", fontFamily: T.mono }}
              />
            </div>
          ))}
        </div>
      </Seksjon>

      {feil && (
        <div role="alert" style={{ borderRadius: 11, border: `1px solid color-mix(in srgb, ${T.down} 40%, transparent)`, background: `color-mix(in srgb, ${T.down} 12%, transparent)`, padding: "10px 14px", fontFamily: T.ui, fontSize: 12.5, color: T.down }}>
          {feil}
        </div>
      )}

      <div
        style={{
          position: "sticky", bottom: 0, display: "flex", justifyContent: "flex-end", gap: 8,
          padding: "14px 0 max(14px, env(safe-area-inset-bottom))",
          background: `linear-gradient(0deg, ${T.bg} 60%, transparent)`,
        }}
      >
        <Knapp ghost onClick={onAvbryt} disabled={pending}>Avbryt</Knapp>
        <Knapp icon="check" onClick={lagre} disabled={pending || !name.trim()}>
          {pending ? "Lagrer…" : lagreLabel}
        </Knapp>
      </div>
    </div>
  );
}
