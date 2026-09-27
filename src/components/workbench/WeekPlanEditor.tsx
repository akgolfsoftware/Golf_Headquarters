"use client";

import { useState } from "react";
import { TL } from "@/lib/v2/train-lock";
import type { WeekNote, WeekPlanData, WeekType } from "@/lib/domain/workbench/types";
import type { SaveWeekPlanInput } from "@/lib/workbench/wb-actions";

type Props = {
  weekPlan?: WeekPlanData | null;
  onSave: (data: Partial<SaveWeekPlanInput>) => void;
  lagrer?: boolean;
};

const UKETYPER: { id: WeekType; tittel: string; beskrivelse: string }[] = [
  { id: "UTVIKLING", tittel: "Utvikling", beskrivelse: "Høy treningsmengde, teknisk og fysisk progresjon" },
  { id: "VEDLIKEHOLD", tittel: "Vedlikehold", beskrivelse: "Stabilisering av ferdigheter og overskudd" },
  { id: "TURNERING", tittel: "Turnering", beskrivelse: "Konkurranseuke, spissing og restitusjon" },
];

const UKENOTATER: { id: WeekNote; tittel: string }[] = [
  { id: "TEKNIKK_UKE", tittel: "Teknikkuke" },
  { id: "PRE_TURNERING", tittel: "Pre-turnering" },
  { id: "SAMLING", tittel: "Samling" },
  { id: "TEST", tittel: "Test" },
  { id: "EVALUERING", tittel: "Evaluering" },
  { id: "FERIE", tittel: "Ferie" },
];

export function WeekPlanEditor({ weekPlan, onSave, lagrer = false }: Props) {
  const [weekType, setWeekType] = useState<WeekType>(weekPlan?.weekType ?? "UTVIKLING");
  const [notes, setNotes] = useState<WeekNote[]>(weekPlan?.notes ?? []);

  // Timer per pyramide
  const [timerFys, setTimerFys] = useState<string>(weekPlan?.plannedHoursFys != null ? String(weekPlan.plannedHoursFys) : "");
  const [timerTek, setTimerTek] = useState<string>(weekPlan?.plannedHoursTek != null ? String(weekPlan.plannedHoursTek) : "");
  const [timerSlag, setTimerSlag] = useState<string>(weekPlan?.plannedHoursSlag != null ? String(weekPlan.plannedHoursSlag) : "");
  const [timerSpill, setTimerSpill] = useState<string>(weekPlan?.plannedHoursSpill != null ? String(weekPlan.plannedHoursSpill) : "");
  const [timerTurn, setTimerTurn] = useState<string>(weekPlan?.plannedHoursTurn != null ? String(weekPlan.plannedHoursTurn) : "");

  // Repetisjonsmål
  const [repDry, setRepDry] = useState<string>(weekPlan?.repTargetDry != null ? String(weekPlan.repTargetDry) : "");
  const [repLow, setRepLow] = useState<string>(weekPlan?.repTargetLowSpeed != null ? String(weekPlan.repTargetLowSpeed) : "");
  const [repFull, setRepFull] = useState<string>(weekPlan?.repTargetFullSpeed != null ? String(weekPlan.repTargetFullSpeed) : "");
  const [repPutt, setRepPutt] = useState<string>(weekPlan?.repTargetPutting != null ? String(weekPlan.repTargetPutting) : "");
  const [repShort, setRepShort] = useState<string>(weekPlan?.repTargetShortGame != null ? String(weekPlan.repTargetShortGame) : "");

  // Belastningstak og notater
  const [loadCeiling, setLoadCeiling] = useState<string>(weekPlan?.loadCeiling != null ? String(weekPlan.loadCeiling) : "");
  const [customNotes, setCustomNotes] = useState<string>(weekPlan?.customNotes ?? "");

  function veksleNotat(note: WeekNote) {
    if (notes.includes(note)) {
      setNotes(notes.filter((n) => n !== note));
    } else {
      setNotes([...notes, note]);
    }
  }

  function handleSave() {
    onSave({
      weekType,
      notes,
      plannedHoursFys: timerFys.trim() === "" ? null : parseFloat(timerFys),
      plannedHoursTek: timerTek.trim() === "" ? null : parseFloat(timerTek),
      plannedHoursSlag: timerSlag.trim() === "" ? null : parseFloat(timerSlag),
      plannedHoursSpill: timerSpill.trim() === "" ? null : parseFloat(timerSpill),
      plannedHoursTurn: timerTurn.trim() === "" ? null : parseFloat(timerTurn),
      repTargetDry: repDry.trim() === "" ? null : parseInt(repDry, 10),
      repTargetLowSpeed: repLow.trim() === "" ? null : parseInt(repLow, 10),
      repTargetFullSpeed: repFull.trim() === "" ? null : parseInt(repFull, 10),
      repTargetPutting: repPutt.trim() === "" ? null : parseInt(repPutt, 10),
      repTargetShortGame: repShort.trim() === "" ? null : parseInt(repShort, 10),
      loadCeiling: loadCeiling.trim() === "" ? null : parseInt(loadCeiling, 10),
      customNotes: customNotes.trim() === "" ? null : customNotes.trim(),
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
      {/* Uketype */}
      <div>
        <label style={{ display: "block", fontSize: 11, fontWeight: 700, fontFamily: TL.font.mono, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--wb-muted)", marginBottom: 8 }}>
          Uketype
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
          {UKETYPER.map((u) => {
            const valgt = weekType === u.id;
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => setWeekType(u.id)}
                title={u.beskrivelse}
                style={{
                  padding: "6px 8px",
                  fontSize: 12,
                  fontFamily: TL.font.sans,
                  fontWeight: valgt ? 600 : 400,
                  borderRadius: 4,
                  border: `1px solid ${valgt ? "var(--ak-grunn-farge-rust-600)" : "var(--wb-border)"}`,
                  background: valgt ? "color-mix(in srgb, var(--ak-grunn-farge-rust-600) 12%, transparent)" : "var(--wb-surface)",
                  color: valgt ? "var(--ak-grunn-farge-rust-600)" : "var(--wb-body)",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.15s ease",
                }}
              >
                {u.tittel}
              </button>
            );
          })}
        </div>
      </div>

      {/* Ukenotater */}
      <div>
        <label style={{ display: "block", fontSize: 11, fontWeight: 700, fontFamily: TL.font.mono, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--wb-muted)", marginBottom: 8 }}>
          Ukenotater & merker
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {UKENOTATER.map((n) => {
            const aktiv = notes.includes(n.id);
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => veksleNotat(n.id)}
                style={{
                  padding: "4px 9px",
                  fontSize: 11,
                  fontFamily: TL.font.sans,
                  borderRadius: 14,
                  border: `1px solid ${aktiv ? "var(--ak-grunn-farge-rust-600)" : "var(--wb-border)"}`,
                  background: aktiv ? "var(--ak-grunn-farge-rust-600)" : "var(--wb-surface)",
                  color: aktiv ? TL.onFill : "var(--wb-body)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {n.tittel}
              </button>
            );
          })}
        </div>
      </div>

      {/* Planlagte timer per pyramide */}
      <div>
        <label style={{ display: "block", fontSize: 11, fontWeight: 700, fontFamily: TL.font.mono, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--wb-muted)", marginBottom: 8 }}>
          Planlagte timer per pyramide
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
          {[
            { label: "FYS", val: timerFys, set: setTimerFys, title: "Fysisk trening" },
            { label: "TEK", val: timerTek, set: setTimerTek, title: "Teknikktrening" },
            { label: "SLAG", val: timerSlag, set: setTimerSlag, title: "Golfslag" },
            { label: "SPILL", val: timerSpill, set: setTimerSpill, title: "Spill på bane" },
            { label: "TURN", val: timerTurn, set: setTimerTurn, title: "Turnering" },
          ].map((felt) => (
            <div key={felt.label} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <span style={{ fontSize: 10, fontFamily: TL.font.mono, color: "var(--wb-muted)", textAlign: "center" }} title={felt.title}>
                {felt.label}
              </span>
              <input
                type="number"
                step="0.5"
                min="0"
                placeholder="0"
                value={felt.val}
                onChange={(e) => felt.set(e.target.value)}
                style={{
                  width: "100%",
                  height: 30,
                  fontSize: 12,
                  fontFamily: TL.font.mono,
                  textAlign: "center",
                  background: "var(--wb-surface)",
                  border: "1px solid var(--wb-border)",
                  borderRadius: 3,
                  color: "var(--wb-heading)",
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Repetisjonsmål */}
      <div>
        <label style={{ display: "block", fontSize: 11, fontWeight: 700, fontFamily: TL.font.mono, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--wb-muted)", marginBottom: 8 }}>
          Repetisjonsmål (antall slag/repetisjoner)
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <span style={{ fontSize: 10, fontFamily: TL.font.sans, color: "var(--wb-muted)" }}>Full fart (sving)</span>
            <input
              type="number"
              step="10"
              min="0"
              placeholder="f.eks. 300"
              value={repFull}
              onChange={(e) => setRepFull(e.target.value)}
              style={{
                height: 30,
                fontSize: 12,
                fontFamily: TL.font.mono,
                padding: "0 8px",
                background: "var(--wb-surface)",
                border: "1px solid var(--wb-border)",
                borderRadius: 3,
                color: "var(--wb-heading)",
              }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <span style={{ fontSize: 10, fontFamily: TL.font.sans, color: "var(--wb-muted)" }}>Putting</span>
            <input
              type="number"
              step="10"
              min="0"
              placeholder="f.eks. 200"
              value={repPutt}
              onChange={(e) => setRepPutt(e.target.value)}
              style={{
                height: 30,
                fontSize: 12,
                fontFamily: TL.font.mono,
                padding: "0 8px",
                background: "var(--wb-surface)",
                border: "1px solid var(--wb-border)",
                borderRadius: 3,
                color: "var(--wb-heading)",
              }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <span style={{ fontSize: 10, fontFamily: TL.font.sans, color: "var(--wb-muted)" }}>Nærspill (chip/pitch)</span>
            <input
              type="number"
              step="10"
              min="0"
              placeholder="f.eks. 200"
              value={repShort}
              onChange={(e) => setRepShort(e.target.value)}
              style={{
                height: 30,
                fontSize: 12,
                fontFamily: TL.font.mono,
                padding: "0 8px",
                background: "var(--wb-surface)",
                border: "1px solid var(--wb-border)",
                borderRadius: 3,
                color: "var(--wb-heading)",
              }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <span style={{ fontSize: 10, fontFamily: TL.font.sans, color: "var(--wb-muted)" }}>Uten ball (tørrsving)</span>
            <input
              type="number"
              step="10"
              min="0"
              placeholder="f.eks. 150"
              value={repDry}
              onChange={(e) => setRepDry(e.target.value)}
              style={{
                height: 30,
                fontSize: 12,
                fontFamily: TL.font.mono,
                padding: "0 8px",
                background: "var(--wb-surface)",
                border: "1px solid var(--wb-border)",
                borderRadius: 3,
                color: "var(--wb-heading)",
              }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <span style={{ fontSize: 10, fontFamily: TL.font.sans, color: "var(--wb-muted)" }}>Lav fart (teknikk)</span>
            <input
              type="number"
              step="10"
              min="0"
              placeholder="f.eks. 100"
              value={repLow}
              onChange={(e) => setRepLow(e.target.value)}
              style={{
                height: 30,
                fontSize: 12,
                fontFamily: TL.font.mono,
                padding: "0 8px",
                background: "var(--wb-surface)",
                border: "1px solid var(--wb-border)",
                borderRadius: 3,
                color: "var(--wb-heading)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Belastningstak og coachnotat */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <span style={{ fontSize: 11, fontWeight: 700, fontFamily: TL.font.mono, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--wb-muted)" }}>
            Belastningstak (sRPE-poeng)
          </span>
          <input
            type="number"
            step="100"
            min="0"
            placeholder="f.eks. 3500 (minutter × anstrengelse)"
            value={loadCeiling}
            onChange={(e) => setLoadCeiling(e.target.value)}
            style={{
              height: 30,
              fontSize: 12,
              fontFamily: TL.font.mono,
              padding: "0 8px",
              background: "var(--wb-surface)",
              border: "1px solid var(--wb-border)",
              borderRadius: 3,
              color: "var(--wb-heading)",
            }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <span style={{ fontSize: 11, fontWeight: 700, fontFamily: TL.font.mono, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--wb-muted)" }}>
            Kommentar / ukenotat
          </span>
          <textarea
            rows={2}
            placeholder="Fokusområder, spissing eller avtaler for uken..."
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            style={{
              fontSize: 12,
              fontFamily: TL.font.sans,
              padding: "6px 8px",
              background: "var(--wb-surface)",
              border: "1px solid var(--wb-border)",
              borderRadius: 3,
              color: "var(--wb-heading)",
              resize: "vertical",
            }}
          />
        </div>
      </div>

      {/* Lagreknapp */}
      <button
        type="button"
        onClick={handleSave}
        disabled={lagrer}
        style={{
          marginTop: 6,
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          fontFamily: TL.font.sans,
          fontSize: 13,
          fontWeight: 600,
          borderRadius: 3,
          border: "none",
          background: "var(--ak-grunn-farge-rust-600)",
          color: TL.onFill,
          cursor: lagrer ? "not-allowed" : "pointer",
          opacity: lagrer ? 0.7 : 1,
          transition: "background 0.15s ease",
        }}
      >
        {lagrer ? "Lagrer ukeplan..." : "Lagre ukeplan"}
      </button>
    </div>
  );
}
