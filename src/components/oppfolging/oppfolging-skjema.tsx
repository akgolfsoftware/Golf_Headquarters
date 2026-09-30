"use client";

import { useActionState, type CSSProperties } from "react";

import wang from "@/components/wang/tester-konkurranse/tk.module.css";
import { TnKnapp } from "@/components/team-norway/core";
import { FORSLAG_TYPER, FORSLAG_TYPE_NAVN, SAMTALE_TYPER, SAMTALE_TYPE_NAVN, type SkjemaTilstand } from "@/lib/oppfolging/regler";
import { TN } from "@/lib/v2/team-norway";

type Handling = (forrige: SkjemaTilstand, formData: FormData) => Promise<SkjemaTilstand>;

type Felles = {
  flate: "WANG" | "TEAM_NORWAY";
  /** Elevene treneren kan velge mellom (aktive i gruppa). Er det én, står den fast. */
  elever: Array<{ id: string; navn: string }>;
  valgtElevId?: string;
  action: Handling;
  /** Ordet for personen: «elev» (WANG) eller «spiller» (Team Norway). */
  person: "elev" | "spiller";
};

const tn = {
  lbl: { display: "grid", gap: 6, minWidth: 0, fontFamily: TN.font.body, fontSize: 13, fontWeight: 700, color: TN.navy900 } satisfies CSSProperties,
  felt: { width: "100%", minWidth: 0, minHeight: 44, padding: "10px 12px", border: `1px solid ${TN.borderDefault}`, borderRadius: TN.radius.md, background: TN.white, color: TN.textPrimary, fontFamily: TN.font.body, fontSize: 14, boxSizing: "border-box" } satisfies CSSProperties,
  ok: { margin: 0, fontSize: 14, color: TN.textPrimary } satisfies CSSProperties,
  feil: { margin: 0, fontSize: 14, color: TN.textPrimary, fontWeight: 700 } satisfies CSSProperties,
};

function Rute({ flate, children, tittel, id }: { flate: Felles["flate"]; children: React.ReactNode; tittel: string; id: string }) {
  return flate === "WANG" ? (
    <div id={id} className={wang.registrer} style={{ position: "static" }}>
      <h2 className={wang.h2}>{tittel}</h2>
      {children}
    </div>
  ) : (
    <div id={id} style={{ display: "grid", gap: 14, padding: "16px 0" }}>
      <h2 style={{ margin: 0, fontFamily: TN.font.display, fontSize: 16, fontWeight: 500, color: TN.navy900 }}>{tittel}</h2>
      {children}
    </div>
  );
}

function Felt({ flate, etikett, children }: { flate: Felles["flate"]; etikett: string; children: React.ReactNode }) {
  return flate === "WANG" ? <label className={wang.lbl}>{etikett}{children}</label> : <label style={tn.lbl}>{etikett}{children}</label>;
}

function Knapp({ flate, lagrer, tekst }: { flate: Felles["flate"]; lagrer: boolean; tekst: string }) {
  return flate === "WANG" ? (
    <button type="submit" className={wang.kbtn} style={{ width: "100%", fontSize: 14 }} disabled={lagrer}>{lagrer ? "Lagrer …" : tekst}</button>
  ) : (
    <TnKnapp type="submit" variant="primaer" fullBredde disabled={lagrer}>{lagrer ? "Lagrer …" : tekst}</TnKnapp>
  );
}

function Melding({ flate, tilstand }: { flate: Felles["flate"]; tilstand: SkjemaTilstand }) {
  if (!tilstand) return null;
  const rolle = tilstand.ok ? "status" : "alert";
  if (flate === "WANG") return <p className={tilstand.ok ? wang.okTekst : wang.feilTekst} role={rolle}>{tilstand.melding}</p>;
  return <p style={tilstand.ok ? tn.ok : tn.feil} role={rolle}>{tilstand.melding}</p>;
}

function ElevValg({ flate, elever, valgtElevId, person }: Pick<Felles, "flate" | "elever" | "valgtElevId" | "person">) {
  const felt = flate === "WANG" ? { className: wang.felt } : { style: tn.felt };
  return (
    <Felt flate={flate} etikett={person === "elev" ? "Elev" : "Spiller"}>
      <select name="elevId" defaultValue={valgtElevId ?? elever[0]?.id} required {...felt}>
        {elever.map((e) => <option key={e.id} value={e.id}>{e.navn}</option>)}
      </select>
    </Felt>
  );
}

/** Nytt forslag til elev/spiller (WANG-44/46, TN-02). Treneren endrer aldri planen selv. */
export function ForslagSkjema({ flate, elever, valgtElevId, action, person }: Felles) {
  const [tilstand, handling, lagrer] = useActionState<SkjemaTilstand, FormData>(action, null);
  const felt = flate === "WANG" ? { className: wang.felt } : { style: tn.felt };
  return (
    <form action={handling} aria-label="Nytt forslag">
      <Rute flate={flate} id="nytt-forslag" tittel="Foreslå endring">
        <ElevValg flate={flate} elever={elever} valgtElevId={valgtElevId} person={person} />
        <Felt flate={flate} etikett="Type">
          <select name="type" defaultValue="PLAN" {...felt}>
            {FORSLAG_TYPER.map((t) => <option key={t} value={t}>{FORSLAG_TYPE_NAVN[t]}</option>)}
          </select>
        </Felt>
        <Felt flate={flate} etikett="Forslag">
          <textarea name="tekst" rows={3} maxLength={1000} required {...(flate === "WANG" ? { className: wang.felt, style: { padding: 12, minHeight: 88 } } : { style: { ...tn.felt, minHeight: 88 } })} />
        </Felt>
        <Melding flate={flate} tilstand={tilstand} />
        <Knapp flate={flate} lagrer={lagrer} tekst="Send forslag" />
      </Rute>
    </form>
  );
}

/** Ny samtale: dato, type og hva som ble avtalt (WANG-44/45, TN-02). */
export function SamtaleSkjema({ flate, elever, valgtElevId, action, person, iDag, sjekker }: Felles & { iDag: string; sjekker?: Array<{ id: string; etikett: string }> }) {
  const [tilstand, handling, lagrer] = useActionState<SkjemaTilstand, FormData>(action, null);
  const felt = flate === "WANG" ? { className: wang.felt } : { style: tn.felt };
  return (
    <form action={handling} aria-label="Ny samtale">
      <Rute flate={flate} id="ny-samtale" tittel="Logg samtale">
        <ElevValg flate={flate} elever={elever} valgtElevId={valgtElevId} person={person} />
        <Felt flate={flate} etikett="Dato">
          <input name="dag" type="date" defaultValue={iDag} required {...felt} />
        </Felt>
        <Felt flate={flate} etikett="Type">
          <select name="type" defaultValue="OPPFOLGING" {...felt}>
            {SAMTALE_TYPER.map((t) => <option key={t} value={t}>{SAMTALE_TYPE_NAVN[t]}</option>)}
          </select>
        </Felt>
        {sjekker && sjekker.length > 0 ? (
          <Felt flate={flate} etikett="Gjelder fireukerssjekk">
            <select name="fireukerssjekkId" defaultValue="" {...felt}>
              <option value="">Ingen</option>
              {sjekker.map((s) => <option key={s.id} value={s.id}>{s.etikett}</option>)}
            </select>
          </Felt>
        ) : null}
        <Felt flate={flate} etikett="Det dere avtalte">
          <textarea name="avtalt" rows={4} maxLength={2000} required {...(flate === "WANG" ? { className: wang.felt, style: { padding: 12, minHeight: 100 } } : { style: { ...tn.felt, minHeight: 100 } })} />
        </Felt>
        <Melding flate={flate} tilstand={tilstand} />
        <Knapp flate={flate} lagrer={lagrer} tekst="Lagre samtale" />
      </Rute>
    </form>
  );
}
