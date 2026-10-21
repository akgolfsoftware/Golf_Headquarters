"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useRef, useState, useTransition, type CSSProperties, type FormEvent, type ReactNode } from "react";

import { TN } from "@/lib/v2/team-norway";
import styles from "./tn-skjerm.module.css";
import { tnKnappStil, type TnKnappVariant } from "./tn-knapp-stil";

export type { TnKnappVariant };

/**
 * Knapper, felt og ark for handlingene på Team Norway-skjermene.
 * Fasit: docs/design-system/utkast-tn/felles/tn.css (pakke 1 grunnmur): navy
 * primærknapp, navy kontur sekundær, Schibsted Grotesk 14 px, hjørner 2 px, minst 44 px høy.
 * Sletting er mørk statusrød. Aldri logorød på knapper.
 *
 * Avvik:
 *   - Grunnmuren tegner ingen skjemaark. Arket bruker kortenes språk: hvit flate,
 *     seksjonstittel, felt og knapper fra grunnmuren.
 */

type Resultat = { ok: true; videre?: string } | { ok: false; feil: string };

export function TnHandlingLenke({ href, children, variant = "primar" }: { href: string; children: ReactNode; variant?: TnKnappVariant }) {
  return <Link href={href} style={tnKnappStil(variant)}>{children}</Link>;
}

export function TnKnapperekke({ children }: { children: ReactNode }) {
  return <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>{children}</div>;
}

const feltStil: CSSProperties = {
  minHeight: 48,
  padding: "0 12px",
  border: `1px solid ${TN.ink500}`,
  borderRadius: TN.radius.md,
  background: TN.white,
  color: TN.ink900,
  fontFamily: TN.font.body,
  fontSize: 16,
  width: "100%",
  minWidth: 0,
};

function Etikett({ children }: { children: ReactNode }) {
  return <span style={{ fontFamily: TN.font.body, fontSize: 14, lineHeight: 1.3, fontWeight: 700, color: TN.ink900 }}>{children}</span>;
}

export function TnFelt({ etikett, navn, type = "text", standard, pakrevd, hint, plassholder, maks }: { etikett: string; navn: string; type?: "text" | "date" | "time" | "datetime-local" | "email" | "number"; standard?: string; pakrevd?: boolean; hint?: string; plassholder?: string; maks?: number }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
      <Etikett>{etikett}</Etikett>
      <input name={navn} type={type} defaultValue={standard} required={pakrevd} placeholder={plassholder} maxLength={maks} inputMode={type === "number" ? "numeric" : undefined} min={type === "number" ? 0 : undefined} step={type === "number" ? 1 : undefined} style={{ ...feltStil, fontFamily: type === "text" || type === "email" ? TN.font.body : TN.font.mono }} />
      {hint ? <span style={{ fontSize: 13, color: TN.ink500 }}>{hint}</span> : null}
    </label>
  );
}

export function TnTekstfelt({ etikett, navn, standard, maks = 2000, rader = 4 }: { etikett: string; navn: string; standard?: string; maks?: number; rader?: number }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
      <Etikett>{etikett}</Etikett>
      <textarea name={navn} defaultValue={standard} maxLength={maks} rows={rader} style={{ ...feltStil, padding: "10px 12px", lineHeight: 1.5, resize: "vertical" }} />
    </label>
  );
}

export function TnValg({ etikett, navn, valg, standard, pakrevd }: { etikett: string; navn: string; valg: { verdi: string; tekst: string }[]; standard?: string; pakrevd?: boolean }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
      <Etikett>{etikett}</Etikett>
      <select name={navn} defaultValue={standard} required={pakrevd} style={feltStil}>
        {valg.map((v) => <option key={v.verdi} value={v.verdi}>{v.tekst}</option>)}
      </select>
    </label>
  );
}

export function TnFeltrad({ children }: { children: ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: 14 }}>{children}</div>;
}

/**
 * Ark (modal) med skjema. `send` får skjemaets verdier og returnerer
 * resultatet fra server-actionen. Ved suksess lukkes arket og siden oppdateres,
 * eller brukeren sendes til `videre`.
 */
export function TnSkjemaArk({ knapp, knappVariant = "primar", tittel, send, lagreTekst = "Lagre", videre, children }: {
  knapp: ReactNode;
  knappVariant?: TnKnappVariant;
  tittel: string;
  send: (verdier: Record<string, string>) => Promise<Resultat>;
  lagreTekst?: string;
  videre?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const tittelId = useId();
  const [feil, setFeil] = useState<string | null>(null);
  const [venter, start] = useTransition();

  function apne() {
    setFeil(null);
    ref.current?.showModal();
  }

  function lagre(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const verdier = Object.fromEntries([...new FormData(e.currentTarget).entries()].map(([k, v]) => [k, String(v)]));
    start(async () => {
      try {
        const r = await send(verdier);
        if (!r.ok) return setFeil(r.feil);
        ref.current?.close();
        const mal = r.videre ?? videre;
        if (mal) router.push(mal);
        else router.refresh();
      } catch {
        setFeil("Kunne ikke lagre akkurat nå. Prøv igjen.");
      }
    });
  }

  return (
    <>
      <button type="button" onClick={apne} style={tnKnappStil(knappVariant)}>{knapp}</button>
      <dialog ref={ref} aria-labelledby={tittelId} className={styles.ark} style={{ border: 0, borderRadius: TN.radius.xl, boxShadow: TN.shadow.lg, padding: 0, width: "min(560px, calc(100vw - 32px))", maxHeight: "calc(100dvh - 32px)", color: TN.ink900 }}>
        <form onSubmit={lagre} style={{ display: "flex", flexDirection: "column", gap: 16, padding: "clamp(18px, 3vw, 26px)" }}>
          <h2 id={tittelId} style={{ fontFamily: TN.font.display, fontWeight: 700, fontSize: 20, lineHeight: 1.25, letterSpacing: "-0.01em", color: TN.navy900, margin: 0 }}>{tittel}</h2>
          {children}
          {feil ? <div role="alert" style={{ fontSize: 13.5, fontWeight: 700, color: TN.status.redText, padding: "10px 12px", background: TN.status.redBg, borderRadius: TN.radius.md }}>{feil}</div> : null}
          <TnKnapperekke>
            <button type="submit" disabled={venter} style={{ ...tnKnappStil("primar"), opacity: venter ? 0.6 : 1 }}>{venter ? "Lagrer …" : lagreTekst}</button>
            <button type="button" onClick={() => ref.current?.close()} style={tnKnappStil("sekundar")}>Avbryt</button>
          </TnKnapperekke>
        </form>
      </dialog>
    </>
  );
}

/** Slett/avslutt med bekreftelse: mørk statusrød knapp i et ark med statusrød toppkant. */
export function TnSlettKnapp({ knapp, tittel, tekst, bekreft, handling, videre, variant = "sekundar" }: {
  knapp: string;
  tittel: string;
  tekst: string;
  bekreft: string;
  handling: () => Promise<Resultat>;
  videre?: string;
  variant?: TnKnappVariant;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const tittelId = useId();
  const [feil, setFeil] = useState<string | null>(null);
  const [venter, start] = useTransition();

  function utfor() {
    start(async () => {
      try {
        const r = await handling();
        if (!r.ok) return setFeil(r.feil);
        ref.current?.close();
        if (videre) router.push(videre);
        else router.refresh();
      } catch {
        setFeil("Kunne ikke fullføre akkurat nå. Prøv igjen.");
      }
    });
  }

  return (
    <>
      <button type="button" onClick={() => { setFeil(null); ref.current?.showModal(); }} style={tnKnappStil(variant)}>{knapp}</button>
      <dialog ref={ref} aria-labelledby={tittelId} className={styles.ark} style={{ border: 0, borderRadius: TN.radius.xl, boxShadow: TN.shadow.lg, padding: 0, width: "min(460px, calc(100vw - 32px))", color: TN.ink900 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "clamp(18px, 3vw, 24px)" }}>
          <h2 id={tittelId} style={{ fontFamily: TN.font.display, fontWeight: 700, fontSize: 20, lineHeight: 1.25, letterSpacing: "-0.01em", color: TN.navy900, margin: 0 }}>{tittel}</h2>
          <p style={{ fontSize: 14.5, lineHeight: 1.6, margin: 0 }}>{tekst}</p>
          {feil ? <div role="alert" style={{ fontSize: 13.5, color: TN.status.redText }}>{feil}</div> : null}
          <TnKnapperekke>
            <button type="button" disabled={venter} onClick={utfor} style={{ ...tnKnappStil("slett"), opacity: venter ? 0.6 : 1 }}>{venter ? "Vent …" : bekreft}</button>
            <button type="button" onClick={() => ref.current?.close()} style={tnKnappStil("sekundar")}>Avbryt</button>
          </TnKnapperekke>
        </div>
      </dialog>
    </>
  );
}
