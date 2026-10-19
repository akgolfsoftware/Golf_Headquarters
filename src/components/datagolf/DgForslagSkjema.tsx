"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { dgForslagOkter, innspillOvelseTittel } from "@/lib/datagolf/spiller-mot-proff";
import { lagTrenerforslag, lagTrenerforslagSerie } from "@/lib/workbench/trenerforslag";
import { TN } from "@/lib/v2/team-norway";

/**
 * Handlingene i DG-06 Innspill-tak og DG-07 Fra funn til forslag (WANG og Team Norway).
 * Begge lager et forslag spilleren godtar eller avviser i PlayerHQ. Ingenting skrives i planen herfra.
 * Spilleren ser målet i meter, aldri proffens navn eller andre Data Golf-tall.
 */

type Org = "WANG" | "TEAM_NORWAY";
type Tema = "tn" | "wang";

const tnKort: React.CSSProperties = { display: "grid", gap: 14, padding: "16px 18px 18px", border: `1px solid ${TN.borderSubtle}`, borderRadius: TN.radius.sm, background: TN.surfaceCard, fontFamily: TN.font.body, minWidth: 0 };
const tnKnapp: React.CSSProperties = { minHeight: 44, padding: "0 18px", border: `1px solid ${TN.navy900}`, borderRadius: TN.radius.sm, background: TN.navy900, color: TN.white, fontFamily: TN.font.body, fontSize: 14, fontWeight: 700, cursor: "pointer" };
const tnValg = (pa: boolean): React.CSSProperties => ({ minHeight: 44, minWidth: 52, padding: "0 14px", border: `1px solid ${pa ? TN.navy900 : TN.ink200}`, borderRadius: TN.radius.sm, background: pa ? TN.navy900 : TN.white, color: pa ? TN.white : TN.ink900, fontFamily: TN.font.body, fontSize: 14, fontWeight: 700, cursor: "pointer" });
const tnFelt: React.CSSProperties = { display: "grid", gap: 6, minWidth: 0, fontSize: 14, fontWeight: 700, color: TN.ink900 };
const tnInput: React.CSSProperties = { minHeight: 44, minWidth: 0, padding: "8px 12px", border: `1px solid ${TN.ink500}`, borderRadius: TN.radius.sm, background: TN.white, color: TN.ink900, fontFamily: TN.font.body, fontSize: 16 };

function Valg<T extends number>({ tema, etikett, verdier, valgt, sett, enhet }: { tema: Tema; etikett: string; verdier: readonly T[]; valgt: T; sett: (v: T) => void; enhet?: string }) {
  return (
    <fieldset style={{ border: 0, margin: 0, padding: 0, minWidth: 0, display: "grid", gap: 6 }}>
      <legend className={tema === "wang" ? "wg-lbl" : undefined} style={tema === "tn" ? { ...tnFelt, padding: 0 } : { padding: 0 }}>{etikett}</legend>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {verdier.map((v) => (
          <button key={v} type="button" aria-pressed={v === valgt} onClick={() => sett(v)}
            className={tema === "wang" ? `wg-chip${v === valgt ? " wg-chip-pa" : ""}` : undefined}
            style={tema === "tn" ? tnValg(v === valgt) : { minHeight: 44 }}>
            {v}{enhet ? ` ${enhet}` : ""}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function Status({ tema, melding }: { tema: Tema; melding: string }) {
  if (!melding) return null;
  return <p role="status" className={tema === "wang" ? "wg-kilde" : undefined} style={tema === "tn" ? { margin: 0, color: TN.ink700, fontSize: 14 } : undefined}>{melding}</p>;
}

/** DG-06: én økt med øvelsen, som forslag i spillerens Workbench. */
export function DgOvelseSkjema({ tema, organisasjon, spillerId, spillerNavn, rad, maalMeter, standardDato }: {
  tema: Tema; organisasjon: Org; spillerId: string; spillerNavn: string;
  rad: { etikett: string; lie: "fairway" | "rough" }; maalMeter: number; standardDato: string;
}) {
  const [slag, setSlag] = useState<20 | 30 | 40>(20);
  const [pending, start] = useTransition();
  const [melding, setMelding] = useState("");
  const router = useRouter();
  const tittel = innspillOvelseTittel(rad, maalMeter, slag);
  return (
    <form
      className={tema === "wang" ? "wg-kort wg-fyll" : undefined}
      style={tema === "tn" ? tnKort : { display: "grid", gap: 14, minWidth: 0 }}
      onSubmit={(e) => {
        e.preventDefault();
        const dato = String(new FormData(e.currentTarget).get("dato") || standardDato);
        start(async () => {
          const r = await lagTrenerforslag({
            organisasjon, spillerId, handling: "ADD",
            etter: { date: dato, startMinute: 16 * 60, durationMinutes: 45, title: tittel, pyramid: "SLAG", location: null },
            begrunnelse: `Innspill fra ${rad.etikett.split(" · ")[1] ?? rad.etikett}, ${rad.lie}: treff innenfor ${maalMeter.toLocaleString("nb-NO", { maximumFractionDigits: 1 })} m fra hullet teller.`,
          });
          setMelding(r.ok ? `Forslaget er sendt til ${spillerNavn}. Det legges inn når hen godtar.` : r.feil);
          if (r.ok) router.refresh();
        });
      }}
    >
      <p style={{ margin: 0, fontWeight: 700 }}>{tittel}</p>
      <Valg tema={tema} etikett="Antall slag" verdier={[20, 30, 40] as const} valgt={slag} sett={setSlag} />
      <label className={tema === "wang" ? "wg-lbl" : undefined} style={tema === "tn" ? tnFelt : undefined}>
        Dato
        <input name="dato" type="date" defaultValue={standardDato} min={standardDato} required className={tema === "wang" ? "wg-field" : undefined} style={tema === "tn" ? tnInput : undefined} />
      </label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        <button type="submit" disabled={pending} className={tema === "wang" ? "wg-btn wg-btn-primary" : undefined} style={tema === "tn" ? { ...tnKnapp, opacity: pending ? 0.65 : 1 } : undefined}>
          {pending ? "Sender …" : "Send forslag"}
        </button>
      </div>
      <Status tema={tema} melding={melding} />
    </form>
  );
}

/** DG-07: planforslag med flere økter, sendt som ett forslag spilleren godtar samlet. */
export function DgPlanSkjema({ tema, organisasjon, spillerId, spillerNavn, tittel, maalsetning, fraMandag }: {
  tema: Tema; organisasjon: Org; spillerId: string; spillerNavn: string; tittel: string; maalsetning: string; fraMandag: string;
}) {
  const [perUke, setPerUke] = useState<1 | 2 | 3>(2);
  const [uker, setUker] = useState<4 | 6 | 8>(6);
  const [pending, start] = useTransition();
  const [melding, setMelding] = useState("");
  const router = useRouter();
  const okter = dgForslagOkter({ fraMandag, oekterPerUke: perUke, uker, varighet: 45, tittel });
  return (
    <form
      className={tema === "wang" ? "wg-kort wg-fyll" : undefined}
      style={tema === "tn" ? tnKort : { display: "grid", gap: 14, minWidth: 0 }}
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await lagTrenerforslagSerie({ organisasjon, spillerId, okter, begrunnelse: maalsetning });
          setMelding(r.ok ? `Forslaget er sendt til ${spillerNavn}. Hen godtar eller avviser selv.` : r.feil);
          if (r.ok) router.refresh();
        });
      }}
    >
      <Valg tema={tema} etikett="Økter per uke" verdier={[1, 2, 3] as const} valgt={perUke} sett={setPerUke} />
      <Valg tema={tema} etikett="Uker" verdier={[4, 6, 8] as const} valgt={uker} sett={setUker} />
      <p className={tema === "wang" ? "wg-kilde" : undefined} style={tema === "tn" ? { margin: 0, color: TN.ink700, fontSize: 14, lineHeight: 1.5 } : undefined}>
        {okter.length} økter · {okter[0]?.date}–{okter[okter.length - 1]?.date} · 45 min. Sendes til Workbench for {spillerNavn} som forslag.
        Godtatt forslag legges inn én gang; har planen endret seg i perioden siden, får hen beskjed om konflikt.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        <button type="submit" disabled={pending} className={tema === "wang" ? "wg-btn wg-btn-primary" : undefined} style={tema === "tn" ? { ...tnKnapp, opacity: pending ? 0.65 : 1 } : undefined}>
          {pending ? "Sender …" : `Send forslag til ${spillerNavn}`}
        </button>
      </div>
      <Status tema={tema} melding={melding} />
    </form>
  );
}
