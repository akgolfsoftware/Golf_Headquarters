"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Plus, Trash2, Search, X } from "lucide-react";
import { FONT, WB } from "./theme";
import { dimLabel, DIM_TITLES, type DimField } from "./taxonomy";
import { DimPickerModal } from "./DimPickerModal";
import type { AkFormelInput } from "@/lib/workbench/ak-formel";
import {
  loadSessionDrills,
  searchExercises,
  createSessionDrill,
  updateSessionDrill,
  updateAllDrillsInSession,
  deleteSessionDrill,
  type WbDrill,
  type ExerciseHit,
  type DrillVolumInput,
} from "@/lib/workbench/drill-actions";

/** Rep-type (bølge 2) — kort UI-etikett per type. */
const REP_TYPES: { key: string; label: string }[] = [
  { key: "SVINGER_UTEN_BALL", label: "Svinger" },
  { key: "BALLER_SLATT", label: "Baller" },
  { key: "TID", label: "Tid" },
  { key: "SETT_REPS", label: "Sett×reps" },
];

/** Volum som klarspråk-tekst (read-only-visning). */
function volumText(d: {
  repType: string | null;
  repAntall: number | null;
  repMinutter: number | null;
  repSett: number | null;
  repReps: number | null;
}): string | null {
  switch (d.repType) {
    case "SVINGER_UTEN_BALL":
      return d.repAntall != null ? `${d.repAntall} svinger` : "Svinger uten ball";
    case "BALLER_SLATT":
      return d.repAntall != null ? `${d.repAntall} baller` : "Baller slått";
    case "TID":
      return d.repMinutter != null ? `${d.repMinutter} min` : "Tid";
    case "SETT_REPS":
      return d.repSett != null && d.repReps != null
        ? `${d.repSett} × ${d.repReps}`
        : "Sett × reps";
    default:
      return null;
  }
}

/** Merge en volum-patch inn i en drill (optimistisk UI). */
function applyVolum(d: WbDrill, v: DrillVolumInput): WbDrill {
  return {
    ...d,
    ...(v.repType !== undefined ? { repType: v.repType ?? null } : {}),
    ...(v.repAntall !== undefined ? { repAntall: v.repAntall ?? null } : {}),
    ...(v.repMinutter !== undefined ? { repMinutter: v.repMinutter ?? null } : {}),
    ...(v.repSett !== undefined ? { repSett: v.repSett ?? null } : {}),
    ...(v.repReps !== undefined ? { repReps: v.repReps ?? null } : {}),
  };
}

/** Øktas AK-formel — brukes som arve-default når en ny drill legges til (B2). */
export type SessionDefaults = {
  pyramidArea: string;
  lfase?: string;
  m?: string;
  pr?: string;
  cs?: string;
  ppos?: string[];
};

/** Dimensjon-felt ↔ drill-felt. Single = enum-streng, multi = string[]. */
const AK_DIMS: { field: DimField; drillKey: keyof WbDrill; multi: boolean }[] = [
  { field: "lfase", drillKey: "lFase", multi: false },
  { field: "cs", drillKey: "csNivaa", multi: false },
  { field: "m", drillKey: "miljo", multi: false },
  { field: "pr", drillKey: "prPress", multi: false },
  { field: "ppos", drillKey: "pPosisjoner", multi: true },
];

/** Bygg AkFormelInput fra en drill (for å sende hele formelen ved patch). */
function drillToAk(d: WbDrill): AkFormelInput {
  return { lFase: d.lFase, miljo: d.miljo, csNivaa: d.csNivaa, pressureLevel: d.prPress, pPosisjoner: d.pPosisjoner };
}

type DrillProgramProps = {
  sessionId: string;
  defaults: SessionDefaults;
  isCoach: boolean;
};

export function DrillProgram({ sessionId, defaults, isCoach }: DrillProgramProps) {
  const [drills, setDrills] = useState<WbDrill[]>([]);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [picker, setPicker] = useState<{ drillId: string; field: DimField } | null>(null);
  const [exOpen, setExOpen] = useState(false);
  // «Sett samme for hele økten»-panel (bølge 3).
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkVolum, setBulkVolum] = useState<DrillVolumInput>({});
  // Drills krever en lagret økt (ekte cuid). Usynkede økter (synt. id) har ingen ennå.
  const persisted = /^c[a-z0-9]{20,}$/i.test(sessionId);
  const canEdit = isCoach && persisted;
  const loading = loadedFor !== sessionId;

  useEffect(() => {
    let alive = true;
    // Synkede økter (synt. id) finnes ikke i DB → loaderen returnerer [].
    loadSessionDrills(sessionId).then((d) => {
      if (alive) {
        setDrills(d);
        setLoadedFor(sessionId);
      }
    });
    return () => {
      alive = false;
    };
  }, [sessionId]);

  const handleAddExercise = useCallback(
    (ex: ExerciseHit) => {
      setExOpen(false);
      // Ny drill arver øktas AK-formel-default (B2).
      const ak: AkFormelInput = {
        lFase: defaults.lfase ?? null,
        miljo: defaults.m ?? null,
        csNivaa: defaults.cs ?? null,
        pressureLevel: defaults.pr ?? null,
        pPosisjoner: defaults.ppos ?? [],
      };
      startTransition(async () => {
        const res = await createSessionDrill({ sessionId, exerciseId: ex.id, repsSets: ex.defaultRepsSets ?? undefined, akFormel: ak });
        if (res.ok && res.drill) setDrills((prev) => [...prev, res.drill!]);
      });
    },
    [sessionId, defaults],
  );

  const handleDelete = useCallback((drillId: string) => {
    setDrills((prev) => prev.filter((d) => d.id !== drillId));
    startTransition(async () => {
      await deleteSessionDrill(drillId);
    });
  }, []);

  // Persister en endret drill (idempotent AK-patch — trygt å kalle per chip-klikk).
  const saveDrill = useCallback((drillId: string, next: WbDrill) => {
    setDrills((prev) => prev.map((d) => (d.id === drillId ? next : d)));
    startTransition(async () => {
      await updateSessionDrill(drillId, { akFormel: drillToAk(next) });
    });
  }, []);

  // Persister en volum-patch på én drill (rep-type/antall/minutter/sett/reps).
  const saveVolum = useCallback((drillId: string, volum: DrillVolumInput) => {
    setDrills((prev) => prev.map((d) => (d.id === drillId ? applyVolum(d, volum) : d)));
    startTransition(async () => {
      await updateSessionDrill(drillId, { volum });
    });
  }, []);

  // «Sett samme for hele økten» — bulk-apply til alle drills.
  const applyBulk = useCallback(() => {
    if (!bulkVolum.repType) return;
    setDrills((prev) => prev.map((d) => applyVolum(d, bulkVolum)));
    setBulkOpen(false);
    startTransition(async () => {
      const res = await updateAllDrillsInSession(sessionId, { volum: bulkVolum });
      if (res.ok && res.drills) setDrills(res.drills);
    });
  }, [sessionId, bulkVolum]);

  // Per-drill AK-akse valgt fra DimPickerModal.
  const handlePick = useCallback(
    (value: string) => {
      if (!picker) return;
      const { drillId, field } = picker;
      const dim = AK_DIMS.find((d) => d.field === field);
      const cur = drills.find((d) => d.id === drillId);
      if (!dim || !cur) return;
      const next: WbDrill = dim.multi
        ? {
            ...cur,
            pPosisjoner: (cur.pPosisjoner ?? []).includes(value)
              ? (cur.pPosisjoner ?? []).filter((x) => x !== value)
              : [...(cur.pPosisjoner ?? []), value],
          }
        : { ...cur, [dim.drillKey]: value };
      saveDrill(drillId, next);
      if (!dim.multi) setPicker(null);
    },
    [picker, drills, saveDrill],
  );

  const closePicker = useCallback(() => setPicker(null), []);

  const removePpos = useCallback(
    (drillId: string, value: string) => {
      const cur = drills.find((d) => d.id === drillId);
      if (!cur) return;
      saveDrill(drillId, { ...cur, pPosisjoner: (cur.pPosisjoner ?? []).filter((x) => x !== value) });
    },
    [drills, saveDrill],
  );

  const pickerSelected =
    picker && AK_DIMS.find((d) => d.field === picker.field)?.multi
      ? ((drills.find((d) => d.id === picker.drillId)?.pPosisjoner ?? []) as string[])
      : picker
        ? [String(drills.find((d) => d.id === picker.drillId)?.[AK_DIMS.find((x) => x.field === picker.field)!.drillKey] ?? "")].filter(Boolean)
        : [];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 15, color: WB.text }}>Drill-program</span>
        <span style={{ fontFamily: FONT.mono, fontSize: 9, fontWeight: 700, color: WB.muted3 }}>
          {loading ? "laster…" : `${drills.length} ${drills.length === 1 ? "drill" : "drills"}`}
        </span>
      </div>

      {!loading && drills.length > 0 && <DrillFordeling drills={drills} />}

      {/* «Sett samme for hele økten» — bulk rep-type/volum (bølge 3) */}
      {canEdit && drills.length > 1 && (
        <div style={{ marginBottom: 12 }}>
          {!bulkOpen ? (
            <button
              type="button"
              onClick={() => setBulkOpen(true)}
              style={{
                fontFamily: FONT.mono,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                background: WB.railBg,
                border: `1px solid ${WB.panelBorder}`,
                borderRadius: 9999,
                padding: "6px 12px",
                color: WB.muted,
                cursor: "pointer",
              }}
            >
              Sett samme for hele økten
            </button>
          ) : (
            <div
              style={{
                background: WB.railBg,
                border: `1px solid ${WB.lime}`,
                borderRadius: 10,
                padding: "10px 12px",
              }}
            >
              <div
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: WB.muted3,
                  marginBottom: 8,
                }}
              >
                Sett rep-type + volum på alle {drills.length} drills
              </div>
              <VolumEditor value={bulkVolum} onChange={(patch) => setBulkVolum((v) => ({ ...v, ...patch }))} />
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={applyBulk}
                  disabled={!bulkVolum.repType || pending}
                  style={{
                    fontFamily: FONT.mono,
                    fontSize: 11,
                    fontWeight: 700,
                    background: bulkVolum.repType ? WB.lime : WB.railBg,
                    border: `1px solid ${bulkVolum.repType ? WB.lime : WB.panelBorder}`,
                    borderRadius: 9999,
                    padding: "6px 14px",
                    color: bulkVolum.repType ? WB.limeDark : WB.muted,
                    cursor: bulkVolum.repType ? "pointer" : "default",
                  }}
                >
                  Bruk på alle
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBulkOpen(false);
                    setBulkVolum({});
                  }}
                  style={{
                    fontFamily: FONT.mono,
                    fontSize: 11,
                    fontWeight: 700,
                    background: "transparent",
                    border: "none",
                    color: WB.muted,
                    cursor: "pointer",
                  }}
                >
                  Avbryt
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!loading && drills.length === 0 && (
        <div
          style={{
            border: `1px dashed ${WB.panelBorder}`,
            borderRadius: 10,
            padding: "18px 12px",
            textAlign: "center",
            color: WB.muted,
            fontSize: 12,
          }}
        >
          {!persisted
            ? "Lagre økta først for å legge til drills."
            : canEdit
              ? "Ingen drills ennå — legg til øvelser under."
              : "Ingen drills lagt til ennå."}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {!loading && drills.map((d, i) => (
          <div
            key={d.id}
            style={{
              background: WB.cardBg,
              border: `1px solid ${WB.panelBorder}`,
              borderRadius: 10,
              padding: "10px 12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: WB.railBg,
                  border: `1px solid ${WB.panelBorder}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: FONT.display,
                  fontWeight: 700,
                  fontSize: 12,
                  color: WB.lime,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: WB.text }}>{d.exerciseName}</div>
                <div style={{ fontSize: 11, color: WB.muted, marginTop: 1 }}>
                  {volumText(d) ?? d.repsSets}
                </div>
              </div>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => handleDelete(d.id)}
                  disabled={pending}
                  aria-label="Slett drill"
                  style={{ border: "none", background: "transparent", color: WB.muted, cursor: "pointer", padding: 4 }}
                >
                  <Trash2 size={14} strokeWidth={1.8} />
                </button>
              )}
            </div>

            {/* AK-formel-chips per drill */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
              {AK_DIMS.filter((dim) => !dim.multi).map((dim) => {
                const val = d[dim.drillKey] as string | null;
                const label = val ? dimLabel(dim.field, val) : DIM_TITLES[dim.field];
                return (
                  <ChipBtn
                    key={dim.field}
                    active={!!val}
                    disabled={!canEdit}
                    onClick={canEdit ? () => setPicker({ drillId: d.id, field: dim.field }) : undefined}
                  >
                    {label}
                  </ChipBtn>
                );
              })}
              {(d.pPosisjoner ?? []).map((p) => (
                <ChipBtn key={p} active disabled={!canEdit} onClick={canEdit ? () => removePpos(d.id, p) : undefined}>
                  {p} {isCoach ? "×" : ""}
                </ChipBtn>
              ))}
              {canEdit && (
                <ChipBtn active={false} onClick={() => setPicker({ drillId: d.id, field: "ppos" })}>
                  + P
                </ChipBtn>
              )}
            </div>

            {/* Rep-type + volum per drill (bølge 2/3) */}
            {canEdit && (
              <VolumEditor
                value={d}
                onChange={(patch) => saveVolum(d.id, patch)}
              />
            )}
          </div>
        ))}
      </div>

      {canEdit && (
        <button
          type="button"
          onClick={() => setExOpen(true)}
          disabled={pending}
          style={{
            marginTop: 10,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            background: "transparent",
            border: `1px dashed ${WB.panelBorder}`,
            borderRadius: 10,
            padding: "10px 12px",
            color: WB.lime,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <Plus size={16} />
          Legg til øvelse
        </button>
      )}

      {picker && (
        <DimPickerModal
          field={picker.field}
          selected={pickerSelected}
          multi={!!AK_DIMS.find((d) => d.field === picker.field)?.multi}
          onPick={handlePick}
          onClose={closePicker}
        />
      )}

      {exOpen && (
        <ExercisePicker
          pyramidArea={defaults.pyramidArea}
          onPick={handleAddExercise}
          onClose={() => setExOpen(false)}
        />
      )}
    </div>
  );
}

/** Fordelings-visning (B3): hvordan drill-kodene fordeler seg per AK-akse. */
function DrillFordeling({ drills }: { drills: WbDrill[] }) {
  const axes: { label: string; field: DimField; get: (d: WbDrill) => string | null }[] = [
    { label: "L-fase", field: "lfase", get: (d) => d.lFase },
    { label: "CS", field: "cs", get: (d) => d.csNivaa },
    { label: "Miljø", field: "m", get: (d) => d.miljo },
    { label: "Press", field: "pr", get: (d) => d.prPress },
  ];
  const rows = axes
    .map((a) => {
      const counts = new Map<string, number>();
      drills.forEach((d) => {
        const v = a.get(d);
        if (v) counts.set(v, (counts.get(v) ?? 0) + 1);
      });
      return { label: a.label, field: a.field, entries: [...counts.entries()] };
    })
    .filter((r) => r.entries.length > 0);

  const ppos = new Map<string, number>();
  drills.forEach((d) => (d.pPosisjoner ?? []).forEach((p) => ppos.set(p, (ppos.get(p) ?? 0) + 1)));

  if (rows.length === 0 && ppos.size === 0) return null;

  const tally = (label: string, items: [string, number][], render: (v: string) => string) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
      <span style={{ width: 48, flexShrink: 0, fontSize: 10, color: WB.muted, paddingTop: 2 }}>{label}</span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {items.map(([val, n]) => (
          <span
            key={val}
            style={{
              fontFamily: FONT.mono,
              fontSize: 9,
              fontWeight: 700,
              background: WB.limeSoft,
              border: `1px solid ${WB.panelBorder}`,
              borderRadius: 9999,
              padding: "2px 7px",
              color: WB.lime,
            }}
          >
            {render(val)} ×{n}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ background: WB.railBg, border: `1px solid ${WB.panelBorder}`, borderRadius: 10, padding: "10px 12px", marginBottom: 12 }}>
      <div style={{ fontFamily: FONT.mono, fontSize: 8, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: WB.muted3, marginBottom: 8 }}>
        Fordeling · {drills.length} {drills.length === 1 ? "drill" : "drills"}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {rows.map((r) => (
          <div key={r.field}>{tally(r.label, r.entries, (v) => dimLabel(r.field, v))}</div>
        ))}
        {ppos.size > 0 && tally("P-pos", [...ppos.entries()], (v) => v)}
      </div>
    </div>
  );
}

/**
 * Rep-type + volum-editor (bølge 3). Fire rep-type-chips; valgt type viser
 * relevant tall-input (antall / minutter / sett×reps). Kontrollert —
 * `value` fra parent, `onChange` sender en volum-patch (kun endrede felt).
 */
function VolumEditor({
  value,
  onChange,
}: {
  value: {
    repType?: string | null;
    repAntall?: number | null;
    repMinutter?: number | null;
    repSett?: number | null;
    repReps?: number | null;
  };
  onChange: (patch: DrillVolumInput) => void;
}) {
  const rt = value.repType ?? null;
  const numInputStyle: React.CSSProperties = {
    width: 60,
    fontFamily: FONT.mono,
    fontSize: 12,
    fontWeight: 600,
    background: WB.cardBg,
    border: `1px solid ${WB.panelBorder}`,
    borderRadius: 8,
    padding: "4px 8px",
    color: WB.text,
    outline: "none",
  };
  const numVal = (n: number | null | undefined) => (n == null ? "" : String(n));
  const parse = (s: string): number | null => {
    if (s.trim() === "") return null;
    const n = parseInt(s, 10);
    return Number.isFinite(n) && n >= 0 ? n : null;
  };
  return (
    <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
      {REP_TYPES.map((t) => (
        <ChipBtn
          key={t.key}
          active={rt === t.key}
          onClick={() => onChange({ repType: rt === t.key ? null : t.key })}
        >
          {t.label}
        </ChipBtn>
      ))}
      {(rt === "SVINGER_UTEN_BALL" || rt === "BALLER_SLATT") && (
        <input
          type="number"
          min={0}
          inputMode="numeric"
          placeholder="antall"
          value={numVal(value.repAntall)}
          onChange={(e) => onChange({ repAntall: parse(e.target.value) })}
          style={numInputStyle}
          aria-label="Antall"
        />
      )}
      {rt === "TID" && (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="min"
            value={numVal(value.repMinutter)}
            onChange={(e) => onChange({ repMinutter: parse(e.target.value) })}
            style={numInputStyle}
            aria-label="Minutter"
          />
          <span style={{ fontSize: 11, color: WB.muted }}>min</span>
        </span>
      )}
      {rt === "SETT_REPS" && (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="sett"
            value={numVal(value.repSett)}
            onChange={(e) => onChange({ repSett: parse(e.target.value) })}
            style={numInputStyle}
            aria-label="Sett"
          />
          <span style={{ fontSize: 12, color: WB.muted }}>×</span>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="reps"
            value={numVal(value.repReps)}
            onChange={(e) => onChange({ repReps: parse(e.target.value) })}
            style={numInputStyle}
            aria-label="Reps"
          />
        </span>
      )}
    </div>
  );
}

function ChipBtn({
  children,
  active,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || !onClick}
      style={{
        fontFamily: FONT.mono,
        fontSize: 10,
        fontWeight: 700,
        background: active ? WB.limeSoft : WB.railBg,
        border: `1px solid ${active ? WB.lime : WB.panelBorder}`,
        borderRadius: 9999,
        padding: "4px 9px",
        color: active ? WB.lime : WB.muted,
        cursor: disabled || !onClick ? "default" : "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

function ExercisePicker({
  pyramidArea,
  onPick,
  onClose,
}: {
  pyramidArea: string;
  onPick: (ex: ExerciseHit) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<ExerciseHit[]>([]);
  const [searching, startSearch] = useTransition();

  useEffect(() => {
    const t = setTimeout(() => {
      startSearch(async () => {
        const res = await searchExercises(q, pyramidArea);
        setHits(res);
      });
    }, 200);
    return () => clearTimeout(t);
  }, [q, pyramidArea]);

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 80, background: WB.scrim, backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 420, maxHeight: "80vh", display: "flex", flexDirection: "column", background: WB.railBg, border: `1px solid ${WB.panelBorder}`, borderRadius: 16, overflow: "hidden" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: `1px solid ${WB.panelBorder}` }}>
          <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 15, color: WB.text }}>Legg til øvelse</span>
          <button type="button" onClick={onClose} aria-label="Lukk" style={{ border: "none", background: "transparent", color: WB.muted, cursor: "pointer" }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: "10px 16px", borderBottom: `1px solid ${WB.panelBorder}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: WB.cardBg, border: `1px solid ${WB.panelBorder}`, borderRadius: 9999, padding: "7px 12px" }}>
            <Search size={14} style={{ color: WB.muted }} />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Søk i øvelsesbiblioteket…"
              style={{ flex: 1, border: "none", background: "transparent", outline: "none", color: WB.text, fontSize: 13 }}
            />
          </div>
        </div>
        <div className="wb-scroll" style={{ flex: 1, overflowY: "auto", padding: 8 }}>
          {searching && <div style={{ padding: 12, color: WB.muted, fontSize: 12 }}>Søker…</div>}
          {!searching && hits.length === 0 && <div style={{ padding: 12, color: WB.muted, fontSize: 12 }}>Ingen treff.</div>}
          {hits.map((ex) => (
            <button
              key={ex.id}
              type="button"
              onClick={() => onPick(ex)}
              style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", gap: 10, background: "transparent", border: "none", borderRadius: 8, padding: "9px 10px", cursor: "pointer", textAlign: "left" }}
            >
              <span style={{ fontSize: 13, color: WB.text }}>{ex.name}</span>
              <span style={{ fontFamily: FONT.mono, fontSize: 9, fontWeight: 700, color: WB.muted3 }}>{ex.pyramidArea}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
