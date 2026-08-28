"use client";

/**
 * Fangsten-artefaktet — rask notering, under 20 sekunder. Fasit:
 * jarvis/meg-fangst.html (type-chips, autolagring, ingen Lagre-knapp).
 *
 * Ekte skriving: opprettSak (src/app/meg/actions.ts sin opprettFangst)
 * lager en ny Sak (kanal TASK, status VENTER) — havner i den vanlige
 * Saker-køen, «triage sorterer resten» akkurat som fasitens fottekst sier.
 *
 * Bevisst avvik fra fasiten: stemmeopptak (mikrofonknappen) er IKKE koblet
 * til — det finnes ingen tale-til-tekst-integrasjon i repoet. Knappen vises
 * (samme layout som fasiten), men er deaktivert med en ærlig forklaring i
 * stedet for å late som den fanger noe (samme mønster som den delte
 * Composer-en i MegApp, som allerede er "disabled" med "ikke koblet til
 * ennå"). Bekreftelsen vises kun i artefaktpanelet, ikke som en egen linje
 * i hovedtråden — tråden er i dag statisk (Én ting nå-kortet), og å gjøre
 * den dynamisk per artefakt er en egen, større endring utenfor denne PR-en.
 */
import { useRef, useState } from "react";
import { TL } from "@/lib/v2/train-lock";

import { Icon } from "@/components/v2/icon";
import { FANGST_TYPER, FANGST_TYPE_LABEL, type FangstType } from "@/lib/jarvis/types";

const AUTOLAGRE_FORSINKELSE_MS = 1200;

type MutasjonSvar = { ok: true } | { ok: false; feil: string };

export function FangstArtefakt({ onFang }: { onFang: (type: FangstType, tekst: string) => Promise<MutasjonSvar> }) {
  const [type, setType] = useState<FangstType>("oppgave");
  const [tekst, setTekst] = useState("");
  const [status, setStatus] = useState<"venter" | "lagrer" | "feil">("venter");
  const [kvittering, setKvittering] = useState<{ type: FangstType; klokke: string } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function lagre(gjeldendeTekst: string) {
    const svar = await onFang(type, gjeldendeTekst);
    if (svar.ok) {
      setKvittering({ type, klokke: new Date().toLocaleTimeString("nb-NO", { timeZone: "Europe/Oslo", hour: "2-digit", minute: "2-digit" }) });
      setTekst("");
      setStatus("venter");
    } else {
      setStatus("feil");
    }
  }

  function håndterInput(verdi: string) {
    setTekst(verdi);
    setKvittering(null);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!verdi.trim()) {
      setStatus("venter");
      return;
    }
    setStatus("lagrer");
    timerRef.current = setTimeout(() => lagre(verdi), AUTOLAGRE_FORSINKELSE_MS);
  }

  return (
    <div data-od-id="panel-fangst" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ fontFamily: TL.font.mono, fontSize: 11, color: TL.mute, marginBottom: 8 }}>under 20 sekunder</div>

      <button
        type="button"
        disabled
        aria-label="Stemme er ikke koblet til ennå — bruk tekstfeltet under"
        data-od-id="cta-fangst-mic"
        style={{
          width: 60,
          height: 60,
          display: "grid",
          placeItems: "center",
          background: TL.dock,
          color: TL.mute,
          border: `1px solid ${TL.hair}`,
          borderRadius: TL.radius.pill,
          margin: "0 auto",
          cursor: "not-allowed",
        }}
      >
        <Icon name="mic" size={24} strokeWidth={1.6} />
      </button>
      <div style={{ textAlign: "center", fontFamily: TL.font.mono, fontSize: 10.5, letterSpacing: "0.05em", color: TL.mute, margin: "8px 0 16px" }}>
        STEMME IKKE KOBLET TIL — SKRIV I STEDET
      </div>

      <div role="group" aria-label="Fangst-type" style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 16 }}>
        {FANGST_TYPER.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            aria-pressed={type === t}
            data-od-id={`chip-${t}`}
            className="v2-press v2-focus"
            style={{
              minHeight: 32,
              padding: "0 14px",
              fontSize: 13,
              fontFamily: TL.font.sans,
              color: type === t ? TL.onFill : TL.text,
              background: type === t ? TL.text : TL.elev,
              border: `1px solid ${type === t ? TL.text : TL.hair}`,
              borderRadius: TL.radius.pill,
              cursor: "pointer",
            }}
          >
            {FANGST_TYPE_LABEL[t]}
          </button>
        ))}
      </div>

      <textarea
        value={tekst}
        onChange={(e) => håndterInput(e.target.value)}
        placeholder="Skriv tanken her …"
        aria-label="Fangst-tekst"
        data-od-id="input-fangst"
        rows={3}
        style={{
          display: "block",
          width: "100%",
          minHeight: 64,
          border: `1px solid ${TL.hair}`,
          borderRadius: TL.radius.row,
          background: TL.elev,
          padding: 10,
          fontFamily: TL.font.sans,
          fontSize: 15,
          lineHeight: 1.5,
          color: TL.text,
          resize: "none",
        }}
      />
      <div style={{ fontFamily: TL.font.mono, fontSize: 10, color: TL.mute, marginTop: 4 }}>
        {status === "lagrer" && "LAGRES …"}
        {status === "feil" && "KUNNE IKKE LAGRE — PRØV IGJEN"}
        {status === "venter" && "AUTOLAGRES — INGEN LAGRE-KNAPP"}
      </div>

      {kvittering && (
        <div
          data-od-id="fkvittering"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 12px",
            background: TL.dock,
            border: `1px solid ${TL.hair}`,
            borderRadius: TL.radius.row,
            fontSize: 13,
            fontFamily: TL.font.sans,
            marginTop: 12,
          }}
        >
          <Icon name="check" size={16} strokeWidth={2} style={{ color: TL.ok, flex: "none" }} />
          <span>
            Fanget → inbox som <strong>{FANGST_TYPE_LABEL[kvittering.type].toLowerCase()}</strong>
          </span>
          <span style={{ marginLeft: "auto", fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute }}>{kvittering.klokke}</span>
        </div>
      )}
    </div>
  );
}
