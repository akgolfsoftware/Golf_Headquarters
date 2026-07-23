"use client";

/**
 * Å3 · «Rull ut mal til gruppa» — planleggings-pyramidens masseoperasjon:
 * velg planmal + antall uker + startuke → alle medlemmene får ukene lagt inn
 * i én operasjon (coachApplyTemplateToGroup). Uker der en spiller alt har
 * plan-økter hoppes over og rapporteres ærlig (aldri overskriving).
 * Kun v2-komponenter.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Caps, Kort, Knapp, PillVelger, Icon, StatusPill, T } from "@/components/v2";
import { coachApplyTemplateToGroup } from "@/lib/workbench/apply-template-actions";

export interface RullUtMal {
  id: string;
  name: string;
  varighetUker: number;
  sessionCount: number;
}

export function RullUtMalPanel({ groupId, maler, antallMedlemmer }: {
  groupId: string;
  maler: RullUtMal[];
  antallMedlemmer: number;
}) {
  const router = useRouter();
  const [apen, setApen] = useState(false);
  const [malId, setMalId] = useState(maler[0]?.id ?? "");
  const [uker, setUker] = useState(maler[0]?.varighetUker ?? 4);
  const [start, setStart] = useState<"0" | "1">("1");
  const [kjorer, setKjorer] = useState(false);
  const [resultat, setResultat] = useState<string | null>(null);
  const [hoppet, setHoppet] = useState<{ navn: string; uke: number }[]>([]);
  const [feil, setFeil] = useState<string | null>(null);

  const valgtMal = maler.find((m) => m.id === malId) ?? null;

  const kjor = async () => {
    if (!valgtMal || kjorer) return;
    setKjorer(true);
    setFeil(null);
    setResultat(null);
    const res = await coachApplyTemplateToGroup(groupId, valgtMal.id, {
      startWeekOffset: Number(start),
      uker,
    });
    setKjorer(false);
    if (res.ok) {
      setResultat(`${res.okterOpprettet ?? 0} økter lagt inn for ${res.spillere ?? 0} spillere.`);
      setHoppet(res.hoppet ?? []);
      router.refresh();
    } else {
      setFeil(res.error ?? "Utrullingen feilet.");
    }
  };

  if (maler.length === 0) return null;

  return (
    <Kort eyebrow="Planlegg for hele gruppa" action={
      <button type="button" onClick={() => setApen((v) => !v)} className="v2-press v2-focus" style={{ appearance: "none", background: "transparent", border: 0, cursor: "pointer", color: T.mut, display: "inline-flex" }}>
        <Icon name={apen ? "chevron-up" : "chevron-down"} size={15} />
      </button>
    }>
      {!apen ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2 }}>
              Rull ut en planmal til alle {antallMedlemmer} medlemmene i én operasjon.
            </span>
            <StatusPill tone="info">{maler.length} maler · {antallMedlemmer} medlemmer</StatusPill>
          </div>
          {/* B: én primær CTA */}
          <Knapp icon="layers" onClick={() => setApen(true)}>Rull ut mal</Knapp>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <StatusPill tone={kjorer ? "warn" : "lime"}>
            {kjorer ? "Ruller ut…" : `Klar · ${antallMedlemmer} spillere`}
          </StatusPill>
          <div>
            <Caps size={9}>Planmal</Caps>
            <select
              value={malId}
              disabled={kjorer}
              onChange={(e) => {
                setMalId(e.target.value);
                const m = maler.find((x) => x.id === e.target.value);
                if (m) setUker(m.varighetUker);
              }}
              style={{ marginTop: 6, width: "100%", appearance: "none", background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "9px 11px", color: T.fg, fontFamily: T.ui, fontSize: 13 }}
            >
              {maler.map((m) => (
                <option key={m.id} value={m.id}>{m.name} · {m.varighetUker} uker · {m.sessionCount} økter</option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div>
              <Caps size={9}>Antall uker</Caps>
              <input
                type="number" min={1} max={valgtMal?.varighetUker ?? 8} value={uker} disabled={kjorer}
                onChange={(e) => setUker(Math.max(1, Math.min(valgtMal?.varighetUker ?? 8, Number(e.target.value) || 1)))}
                style={{ marginTop: 6, width: 90, appearance: "none", background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "9px 11px", color: T.fg, fontFamily: T.ui, fontSize: 13 }}
              />
            </div>
            <div>
              <Caps size={9}>Start</Caps>
              <div style={{ marginTop: 6 }}>
                <PillVelger options={[{ v: "0", l: "Denne uka" }, { v: "1", l: "Neste uke" }]} value={start} onChange={(v) => setStart(v as "0" | "1")} />
              </div>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <Knapp icon="layers" disabled={kjorer || !valgtMal} onClick={kjor}>
                {kjorer ? "Ruller ut…" : `Rull ut til ${antallMedlemmer} spillere`}
              </Knapp>
            </div>
          </div>
          <span style={{ fontFamily: T.mono, fontSize: 9, color: T.mut }}>
            Uker der en spiller allerede har planlagte økter hoppes over — ingenting overskrives.
          </span>

          {feil && <span style={{ fontFamily: T.ui, fontSize: 12, color: T.down }}>{feil}</span>}
          {resultat && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "10px 12px", borderRadius: 11, background: `color-mix(in srgb, ${T.up} 8%, ${T.panel})`, border: `1px solid color-mix(in srgb, ${T.up} 28%, transparent)` }}>
              <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg }}>
                <Icon name="check" size={12} style={{ color: T.up, marginRight: 6 }} />{resultat}
              </span>
              {hoppet.length > 0 && (
                <span style={{ fontFamily: T.mono, fontSize: 9.5, color: T.mut }}>
                  Hoppet over (hadde alt økter): {hoppet.map((h) => `${h.navn} (uke +${h.uke})`).join(" · ")}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </Kort>
  );
}
