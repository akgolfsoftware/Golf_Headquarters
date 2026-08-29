"use client";

/**
 * AO-08 Godkjenn-kø. Én hvit Godkjenn på uthevet sak. Avvis dim.
 * Godkjent = warm hake, aldri ok-grønn.
 *
 * Fasit: designsystem/train-lock/AO-01 Cockpit ko godkjenning.dc.html
 * (§AO-08 Godkjenn), AO-12 Godkjenningspolicy A3 B1 C3.dc.html (uthevet
 * sak-mønsteret: caps-undertype + tittel + diff-linje + hvit Godkjenn +
 * hairline Avvis — tom-tilstanden matcher AO-12f).
 */

import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TL } from "@/lib/v2/train-lock";
import { acceptPlanAction, rejectPlanAction } from "@/lib/agents/actions";
import type { AgenticosGodkjennData, AgenticosGodkjennRad } from "@/lib/agencyos/last-agenticos";
import { AoCaps, AoKnapp, AoKort, AoTom, AoTittel, AoWarmHake } from "./tl-agenticos";

export function AdminAgenticosGodkjenn({ data }: { data: AgenticosGodkjennData }) {
  const params = useSearchParams();
  const fraUrl = params.get("sak");
  const forste = data.rader[0]?.id ?? null;
  const uthevetId = useMemo(() => {
    if (fraUrl && data.rader.some((r) => r.id === fraUrl)) return fraUrl;
    return forste;
  }, [fraUrl, data.rader, forste]);

  if (data.rader.length === 0) {
    return (
      <div data-screen-label="AO-12f Tom godkjenn-ko">
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
          <AoTittel size={20}>Godkjenn</AoTittel>
          <span style={{ fontSize: 12, color: TL.mute }}>Kun oppgaver med sideeffekt. Research lander i Cockpit.</span>
        </div>
        <AoTom tittel="Ingen som venter" tekst="Ingen som venter. Research lander i Cockpit." />
        {data.godkjentIDag > 0 ? <GodkjentFot n={data.godkjentIDag} /> : null}
      </div>
    );
  }

  const uthevet = data.rader.find((r) => r.id === uthevetId) ?? data.rader[0];
  const resten = data.rader.filter((r) => r.id !== uthevet.id);

  return (
    <div data-screen-label="AO-08 Godkjenn" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <AoTittel size={20}>Godkjenn</AoTittel>
        <span style={{ fontSize: 12, color: TL.mute }}>Kun oppgaver med sideeffekt. Research lander i Cockpit.</span>
      </div>

      <UthevetSak rad={uthevet} />

      {resten.map((r) => (
        <AoKort key={r.id} pad="14px 16px" radius={14} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: TL.text }}>{r.tittel}</div>
            <div style={{ fontSize: 11, color: TL.mute }}>{r.meta}</div>
          </div>
          <AoCaps color={r.merke === "resultat" ? TL.mute : TL.warn}>{r.merkeLabel}</AoCaps>
          <AoKnapp variant="lenke" href={`/admin/agenticos/godkjenn?sak=${r.id}`}>
            Se resultat
          </AoKnapp>
        </AoKort>
      ))}

      <GodkjentFot n={data.godkjentIDag} />
    </div>
  );
}

function UthevetSak({ rad }: { rad: AgenticosGodkjennRad }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [avvis, setAvvis] = useState(false);
  const [grunn, setGrunn] = useState("");
  const [visDiff, setVisDiff] = useState(Boolean(rad.diff));

  const kjor = (fn: () => Promise<unknown>) =>
    start(async () => {
      await fn();
      router.refresh();
    });

  return (
    <AoKort pad="18px 20px" radius={18} style={{ gap: 12, opacity: pending ? 0.55 : 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <AoCaps color={TL.warn}>{rad.merkeLabel}</AoCaps>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: TL.mute }}>
          {rad.agentNavn} · {rad.naar}
        </span>
      </div>
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, color: TL.text }}>{rad.tittel}</div>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: TL.mute, lineHeight: 1.55 }}>{rad.beskrivelse}</p>
      </div>
      {visDiff && rad.diff ? (
        <div
          style={{
            background: TL.dock,
            borderRadius: 12,
            padding: "10px 12px",
            fontSize: 12,
            color: TL.mute,
            lineHeight: 1.7,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {rad.diff}
        </div>
      ) : null}
      {avvis ? (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="text"
            value={grunn}
            onChange={(e) => setGrunn(e.target.value)}
            placeholder="Hvorfor avvises? (valgfritt)"
            maxLength={500}
            autoFocus
            style={{
              flex: 1,
              minWidth: 0,
              borderRadius: TL.radius.field,
              background: TL.dock,
              boxShadow: `inset 0 0 0 1px ${TL.hair}`,
              padding: "10px 14px",
              fontSize: 13,
              color: TL.text,
              border: "none",
            }}
          />
          <AoKnapp onClick={() => kjor(() => rejectPlanAction(rad.id, grunn.trim() || undefined))}>Avvis</AoKnapp>
          <AoKnapp onClick={() => { setAvvis(false); setGrunn(""); }}>Angre</AoKnapp>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <AoKnapp variant="primaer" disabled={pending} onClick={() => kjor(() => acceptPlanAction(rad.id))}>
            Godkjenn
          </AoKnapp>
          <AoKnapp onClick={() => setAvvis(true)}>Avvis</AoKnapp>
          {rad.diff ? (
            <AoKnapp onClick={() => setVisDiff((v) => !v)}>{visDiff ? "Skjul diff" : "Se diff"}</AoKnapp>
          ) : null}
        </div>
      )}
    </AoKort>
  );
}

function GodkjentFot({ n }: { n: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 2 }}>
      <AoWarmHake />
      <span style={{ fontSize: 12, color: TL.mute }}>
        Godkjent i dag: {n} · ok-grønn finnes ikke i AgenticOS — den er Player Godta
      </span>
    </div>
  );
}
