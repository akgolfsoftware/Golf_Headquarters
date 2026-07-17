"use client";

/**
 * AgencyOS — Rediger drill (`/admin/drills/[id]/rediger`) — v2.
 * v2-port 17. juli 2026 (Team D3): erstatter drill-edit-form (hybrid).
 * Samme skjema med alle feltene på ExerciseDefinition og samme server action
 * (updateDrill) — kun presentasjonslaget er nytt. Enum-verdiene (disiplin,
 * L-faser, NGF, miljø) er datanøkler og vises uendret.
 */

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type {
  PyramidArea,
  LPhase,
  SkillArea,
  NgfKategori,
  SessionEnvironment,
} from "@/generated/prisma/enums";
import { updateDrill, type DrillInput } from "@/app/admin/(legacy)/drills/actions";
import { Kort, Caps, Knapp, Icon, HjelpTips, T } from "@/components/v2";

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

export interface AdminDrillRedigerV2Props {
  drill: DrillRecord;
  andreDrills: { id: string; name: string }[];
}

const DISIPLINER: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
const L_PHASES: LPhase[] = ["GRUNN", "SPESIAL", "TURNERING"];
const SKILLS: SkillArea[] = [
  "TEE_TOTAL",
  "TILNAERMING",
  "AROUND_GREEN",
  "PUTTING",
  "SPILL",
];
const NGF: NgfKategori[] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
const ENVS: SessionEnvironment[] = ["RANGE", "BANE", "STUDIO", "HJEM", "SIMULATOR", "GYM"];

function parseCsTarget(raw: unknown): Partial<Record<NgfKategori, number>> {
  if (!raw || typeof raw !== "object") return {};
  const out: Partial<Record<NgfKategori, number>> = {};
  for (const k of NGF) {
    const v = (raw as Record<string, unknown>)[k];
    if (typeof v === "number") out[k] = v;
  }
  return out;
}

/* ── v2-feltstiler (samme idiom som AdminSpillerRedigerV2) ── */

const FELT_STIL: React.CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: 6,
  borderRadius: 10,
  border: `1px solid ${T.border}`,
  background: T.panel2,
  padding: "10px 14px",
  fontFamily: T.ui,
  fontSize: 13,
  color: T.fg,
  outline: "none",
  boxSizing: "border-box",
};

function Etikett({ children, required, hjelp }: { children: React.ReactNode; required?: boolean; hjelp?: "pyramideAkse" | "skillArea" | "miljo" | "lFase" | "csNivaa" }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: T.mono, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: T.mut }}>
      {children}
      {required && <span style={{ color: T.down }}>*</span>}
      {hjelp && <HjelpTips k={hjelp} size={11} />}
    </span>
  );
}

function Felt({
  label,
  required,
  hjelp,
  children,
}: {
  label: React.ReactNode;
  required?: boolean;
  hjelp?: "pyramideAkse" | "skillArea" | "miljo" | "lFase" | "csNivaa";
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "block" }}>
      <Etikett required={required} hjelp={hjelp}>{label}</Etikett>
      {children}
    </label>
  );
}

function Pille({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="v2-press v2-focus"
      style={{
        appearance: "none",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: 30,
        padding: "0 12px",
        borderRadius: 9999,
        background: active ? T.lime : T.panel3,
        border: `1px solid ${active ? "transparent" : T.borderS}`,
        color: active ? T.onLime : T.fg,
        fontFamily: T.mono,
        fontSize: 10.5,
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
      }}
    >
      {active && <Icon name="check" size={11} />}
      {children}
    </button>
  );
}

function ChipMedFjern({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 9999, background: T.panel3, border: `1px solid ${T.borderS}`, padding: "4px 10px", fontFamily: T.mono, fontSize: 11, color: T.fg }}>
      {children}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Fjern"
        className="v2-press"
        style={{ appearance: "none", background: "transparent", border: 0, cursor: "pointer", color: T.mut, display: "inline-flex", padding: 0 }}
      >
        <Icon name="x" size={11} />
      </button>
    </span>
  );
}

export function AdminDrillRedigerV2({ drill, andreDrills }: AdminDrillRedigerV2Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // State for hvert felt
  const [name, setName] = useState(drill.name);
  const [description, setDescription] = useState(drill.description ?? "");
  const [videoUrl, setVideoUrl] = useState(drill.videoUrl ?? "");
  const [pyramidArea, setPyramidArea] = useState<PyramidArea>(drill.pyramidArea);
  const [lPhase, setLPhase] = useState<LPhase | "">(drill.lPhase ?? "");
  const [defaultRepsSets, setDefaultRepsSets] = useState(drill.defaultRepsSets ?? "");
  const [csMin, setCsMin] = useState<string>(drill.csMin !== null ? String(drill.csMin) : "");
  const [csMax, setCsMax] = useState<string>(drill.csMax !== null ? String(drill.csMax) : "");
  const [durationMin, setDurationMin] = useState<string>(
    drill.durationMin !== null ? String(drill.durationMin) : "",
  );
  const [skillArea, setSkillArea] = useState<SkillArea | "">(drill.skillArea ?? "");
  const [minKategori, setMinKategori] = useState<NgfKategori | "">(drill.minKategori ?? "");
  const [maxKategori, setMaxKategori] = useState<NgfKategori | "">(drill.maxKategori ?? "");
  const [minHcp, setMinHcp] = useState<string>(drill.minHcp !== null ? String(drill.minHcp) : "");
  const [maxHcp, setMaxHcp] = useState<string>(drill.maxHcp !== null ? String(drill.maxHcp) : "");
  const [environment, setEnvironment] = useState<SessionEnvironment[]>(drill.environment);
  const [utstyr, setUtstyr] = useState<string[]>(drill.utstyr);
  const [utstyrDraft, setUtstyrDraft] = useState("");
  const [intensitet, setIntensitet] = useState<number>(drill.intensitet ?? 5);
  const [intensitetActive, setIntensitetActive] = useState(drill.intensitet !== null);
  const [lPhases, setLPhases] = useState<LPhase[]>(drill.lPhases);
  const [morad, setMorad] = useState(drill.morad);
  const [prerequisites, setPrerequisites] = useState<string[]>(drill.prerequisites);
  const [tags, setTags] = useState<string[]>(drill.tags);
  const [tagDraft, setTagDraft] = useState("");
  const [coachNotes, setCoachNotes] = useState(drill.coachNotes ?? "");
  const [kilde, setKilde] = useState(drill.kilde ?? "");
  const [defaultSets, setDefaultSets] = useState<string>(
    drill.defaultSets !== null ? String(drill.defaultSets) : "",
  );
  const [defaultReps, setDefaultReps] = useState<string>(
    drill.defaultReps !== null ? String(drill.defaultReps) : "",
  );
  const [csTarget, setCsTarget] = useState<Partial<Record<NgfKategori, number>>>(
    parseCsTarget(drill.csTargetByKategori),
  );

  function toggle<Tv extends string>(arr: Tv[], v: Tv): Tv[] {
    return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
  }

  function leggTilTag() {
    const v = tagDraft.trim();
    if (v && !tags.includes(v)) setTags([...tags, v]);
    setTagDraft("");
  }

  function leggTilUtstyr() {
    const v = utstyrDraft.trim();
    if (v && !utstyr.includes(v)) setUtstyr([...utstyr, v]);
    setUtstyrDraft("");
  }

  function lagre(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const numOrNull = (s: string) =>
      s.trim() === "" ? null : Number(s.replace(",", "."));

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
      csMin: numOrNull(csMin) as number | null,
      csMax: numOrNull(csMax) as number | null,
      durationMin: numOrNull(durationMin) as number | null,
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
      coachNotes: coachNotes.trim() || null,
      kilde: kilde.trim() || null,
      defaultSets: numOrNull(defaultSets) as number | null,
      defaultReps: numOrNull(defaultReps) as number | null,
      csTargetByKategori:
        Object.keys(csTargetClean).length > 0
          ? (csTargetClean as Record<NgfKategori, number>)
          : null,
    };

    startTransition(async () => {
      const res = await updateDrill(drill.id, input);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      router.push(`/admin/drills/${drill.id}`);
    });
  }

  return (
    <form onSubmit={lagre} style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Topptekst */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <Link
            href={`/admin/drills/${drill.id}`}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: T.mut, textDecoration: "none" }}
          >
            <Icon name="arrow-left" size={12} />
            Tilbake til drill
          </Link>
          <h1 style={{ margin: "4px 0 0", fontFamily: T.disp, fontWeight: 700, fontSize: 26, letterSpacing: "-0.02em", color: T.fg }}>
            Rediger <em style={{ fontStyle: "italic", fontWeight: 400, color: T.lime }}>{drill.name}</em>
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Knapp ghost disabled={pending} onClick={() => router.push(`/admin/drills/${drill.id}`)}>
            Avbryt
          </Knapp>
          <Knapp type="submit" icon="check" disabled={pending}>
            {pending ? "Lagrer…" : "Lagre endringer"}
          </Knapp>
        </div>
      </div>

      <Kort>
        <Caps>Identifikasjon</Caps>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
          <Felt label="Navn" required>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} style={FELT_STIL} />
          </Felt>
          <Felt label="Beskrivelse">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} style={{ ...FELT_STIL, resize: "vertical", lineHeight: 1.55 }} />
          </Felt>
          <Felt label="Coach-notater">
            <textarea
              value={coachNotes}
              onChange={(e) => setCoachNotes(e.target.value)}
              rows={3}
              style={{ ...FELT_STIL, resize: "vertical", lineHeight: 1.55 }}
              placeholder="Hvordan du forklarer drillen til spilleren."
            />
          </Felt>
          <Felt label="Video-URL">
            <input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://" style={FELT_STIL} />
          </Felt>
          <Felt label="Kilde">
            <input
              type="text"
              value={kilde}
              onChange={(e) => setKilde(e.target.value)}
              placeholder="f.eks. ak-second-brain:morad-drill-bibliotek"
              style={FELT_STIL}
            />
          </Felt>
        </div>
      </Kort>

      <Kort>
        <Caps>Klassifisering</Caps>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
          <div>
            <Etikett required hjelp="pyramideAkse">Disiplin</Etikett>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {DISIPLINER.map((d) => (
                <Pille key={d} active={pyramidArea === d} onClick={() => setPyramidArea(d)}>
                  {d}
                </Pille>
              ))}
            </div>
          </div>

          <Felt label="Ferdighetsområde" hjelp="skillArea">
            <select value={skillArea} onChange={(e) => setSkillArea(e.target.value as SkillArea | "")} style={FELT_STIL}>
              <option value="">— Ingen —</option>
              {SKILLS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Felt>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12 }}>
            <Felt label="Min NGF-kategori">
              <select value={minKategori} onChange={(e) => setMinKategori(e.target.value as NgfKategori | "")} style={FELT_STIL}>
                <option value="">—</option>
                {NGF.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </Felt>
            <Felt label="Maks NGF-kategori">
              <select value={maxKategori} onChange={(e) => setMaxKategori(e.target.value as NgfKategori | "")} style={FELT_STIL}>
                <option value="">—</option>
                {NGF.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </Felt>
            <Felt label="Min HCP">
              <input type="number" step="0.1" value={minHcp} onChange={(e) => setMinHcp(e.target.value)} style={FELT_STIL} />
            </Felt>
            <Felt label="Maks HCP">
              <input type="number" step="0.1" value={maxHcp} onChange={(e) => setMaxHcp(e.target.value)} style={FELT_STIL} />
            </Felt>
          </div>

          <div>
            <Etikett hjelp="lFase">L-faser (flervalg)</Etikett>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {L_PHASES.map((p) => (
                <Pille key={p} active={lPhases.includes(p)} onClick={() => setLPhases(toggle(lPhases, p))}>
                  {p}
                </Pille>
              ))}
            </div>
          </div>

          <Felt label="L-fase (primær — legacy)">
            <select value={lPhase} onChange={(e) => setLPhase(e.target.value as LPhase | "")} style={FELT_STIL}>
              <option value="">—</option>
              {L_PHASES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Felt>

          <div
            onClick={() => setMorad(!morad)}
            role="checkbox"
            aria-checked={morad}
            tabIndex={0}
            className="v2-focus"
            style={{ display: "inline-flex", alignItems: "center", gap: 10, cursor: "pointer", width: "fit-content" }}
          >
            <span style={{ width: 20, height: 20, borderRadius: 6, background: morad ? T.lime : T.panel2, border: `1px solid ${morad ? "transparent" : T.borderS}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
              {morad && <Icon name="check" size={13} style={{ color: T.onLime }} />}
            </span>
            <span style={{ fontFamily: T.ui, fontSize: 13, color: T.fg }}>MORAD — kanonisk drill</span>
          </div>
        </div>
      </Kort>

      <Kort>
        <Caps>Kontekst</Caps>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
          <div>
            <Etikett hjelp="miljo">Miljø (flervalg)</Etikett>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {ENVS.map((env) => (
                <Pille key={env} active={environment.includes(env)} onClick={() => setEnvironment(toggle(environment, env))}>
                  {env}
                </Pille>
              ))}
            </div>
          </div>

          <div>
            <Etikett>Utstyr</Etikett>
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <input
                type="text"
                value={utstyrDraft}
                onChange={(e) => setUtstyrDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    leggTilUtstyr();
                  }
                }}
                placeholder="legg til, trykk Enter"
                style={{ ...FELT_STIL, marginTop: 0, flex: 1 }}
              />
              <Knapp ghost onClick={leggTilUtstyr}>
                Legg til
              </Knapp>
            </div>
            {utstyr.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                {utstyr.map((u) => (
                  <ChipMedFjern key={u} onRemove={() => setUtstyr(utstyr.filter((x) => x !== u))}>
                    {u}
                  </ChipMedFjern>
                ))}
              </div>
            )}
          </div>

          <div>
            <Etikett>Tags</Etikett>
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <input
                type="text"
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    leggTilTag();
                  }
                }}
                placeholder="legg til, trykk Enter"
                style={{ ...FELT_STIL, marginTop: 0, flex: 1 }}
              />
              <Knapp ghost onClick={leggTilTag}>
                Legg til
              </Knapp>
            </div>
            {tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                {tags.map((t) => (
                  <ChipMedFjern key={t} onRemove={() => setTags(tags.filter((x) => x !== t))}>
                    #{t}
                  </ChipMedFjern>
                ))}
              </div>
            )}
          </div>

          <div>
            <Etikett>Forutsetninger (flervalg)</Etikett>
            <div style={{ marginTop: 6, maxHeight: 192, overflowY: "auto", borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel2, padding: 8, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 2 }}>
              {andreDrills.length === 0 ? (
                <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: 4 }}>Ingen andre drills.</p>
              ) : (
                andreDrills.map((d) => {
                  const on = prerequisites.includes(d.id);
                  return (
                    <div
                      key={d.id}
                      onClick={() => setPrerequisites(toggle(prerequisites, d.id))}
                      role="checkbox"
                      aria-checked={on}
                      tabIndex={0}
                      className="v2-row-h v2-focus"
                      style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 8, padding: "5px 8px", cursor: "pointer" }}
                    >
                      <span style={{ width: 16, height: 16, borderRadius: 5, background: on ? T.lime : T.panel3, border: `1px solid ${on ? "transparent" : T.borderS}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                        {on && <Icon name="check" size={11} style={{ color: T.onLime }} />}
                      </span>
                      <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </Kort>

      <Kort>
        <Caps>Intensitet og varighet</Caps>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
            <Felt label="Varighet (min)">
              <input type="number" min="1" value={durationMin} onChange={(e) => setDurationMin(e.target.value)} style={FELT_STIL} />
            </Felt>
            <Felt label="CS min" hjelp="csNivaa">
              <input type="number" min="0" max="100" value={csMin} onChange={(e) => setCsMin(e.target.value)} style={FELT_STIL} />
            </Felt>
            <Felt label="CS maks" hjelp="csNivaa">
              <input type="number" min="0" max="100" value={csMax} onChange={(e) => setCsMax(e.target.value)} style={FELT_STIL} />
            </Felt>
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
              <Etikett>Intensitet {intensitetActive ? `(${intensitet}/10)` : "(ikke satt)"}</Etikett>
              <span
                onClick={() => setIntensitetActive(!intensitetActive)}
                role="checkbox"
                aria-checked={intensitetActive}
                tabIndex={0}
                className="v2-focus"
                style={{ display: "inline-flex", alignItems: "center", gap: 7, cursor: "pointer", fontFamily: T.ui, fontSize: 12, color: T.fg2 }}
              >
                <span style={{ width: 16, height: 16, borderRadius: 5, background: intensitetActive ? T.lime : T.panel3, border: `1px solid ${intensitetActive ? "transparent" : T.borderS}`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  {intensitetActive && <Icon name="check" size={11} style={{ color: T.onLime }} />}
                </span>
                Aktiv
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={intensitet}
              onChange={(e) => setIntensitet(Number(e.target.value))}
              disabled={!intensitetActive}
              style={{ width: "100%", marginTop: 10, accentColor: T.lime, opacity: intensitetActive ? 1 : 0.4 }}
            />
          </div>
        </div>
      </Kort>

      <Kort>
        <Caps>Standard sett/reps</Caps>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12 }}>
            <Felt label="Standard sett">
              <input type="number" min="1" value={defaultSets} onChange={(e) => setDefaultSets(e.target.value)} style={FELT_STIL} />
            </Felt>
            <Felt label="Standard reps">
              <input type="number" min="1" value={defaultReps} onChange={(e) => setDefaultReps(e.target.value)} style={FELT_STIL} />
            </Felt>
          </div>

          <Felt label="Reps/sett-tekst (fri form)">
            <input
              type="text"
              value={defaultRepsSets}
              onChange={(e) => setDefaultRepsSets(e.target.value)}
              placeholder="3 sett · 10 reps, eller «gjennomfør i 12 min»"
              style={FELT_STIL}
            />
          </Felt>

          <div>
            <Etikett hjelp="csNivaa">CS-mål per NGF-kategori</Etikett>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))", gap: 8, marginTop: 8 }}>
              {NGF.map((k) => (
                <div key={k}>
                  <span style={{ display: "block", fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.mut }}>{k}</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
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
                    style={{ ...FELT_STIL, marginTop: 4, padding: "8px 10px", fontFamily: T.mono, fontVariantNumeric: "tabular-nums" }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Kort>

      {error && (
        <div
          role="alert"
          style={{ borderRadius: 12, border: `1px solid color-mix(in srgb, ${T.down} 35%, transparent)`, background: `color-mix(in srgb, ${T.down} 10%, transparent)`, padding: "10px 14px", fontFamily: T.ui, fontSize: 13, color: T.down }}
        >
          {error}
        </div>
      )}

      {/* Sticky lagre-bar */}
      <div style={{ position: "sticky", bottom: 0, zIndex: 20, background: `color-mix(in srgb, ${T.bg} 95%, transparent)`, backdropFilter: "blur(6px)", borderTop: `1px solid ${T.border}`, padding: "10px 0", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
        <Knapp ghost disabled={pending} onClick={() => router.push(`/admin/drills/${drill.id}`)}>
          Avbryt
        </Knapp>
        <Knapp type="submit" icon="check" disabled={pending}>
          {pending ? "Lagrer…" : "Lagre endringer"}
        </Knapp>
      </div>
    </form>
  );
}
