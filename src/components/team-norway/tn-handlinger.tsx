"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useRef, useState, useTransition, type CSSProperties, type FormEvent, type ReactNode } from "react";

import { TN } from "@/lib/v2/team-norway";
import styles from "./tn-skjerm.module.css";

/**
 * Knapper, felt og ark for handlingene på Team Norway-skjermene.
 * Fasit: Claude Design «Team Norway App delivery» (bc3e41fc): navy knapp med
 * hvit tekst, Jost i versaler med sperring, hjørner 2 px, minst 44 px høy.
 * Sletting er grafitt i et kort med rød kant, aldri en rød knapp.
 *
 * Avvik:
 *   - Designet tegner ingen skjemaark. Arket bruker kortenes språk: hvit flate,
 *     tittel over 2 px navy strek, felt og knapper fra TN-03 «Registrer resultat».
 *   - Bekreftelsesarket har rød toppkant i stedet for rød kant rundt hele kortet.
 */

type Resultat = { ok: true; videre?: string } | { ok: false; feil: string };

const knappGrunn: CSSProperties = {
  minHeight: 44,
  padding: "0 18px",
  borderRadius: 2,
  fontFamily: TN.font.display,
  fontSize: 12,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  cursor: "pointer",
  textDecoration: "none",
  whiteSpace: "nowrap",
  maxWidth: "100%",
};

export type TnKnappVariant = "primar" | "sekundar" | "grafitt" | "tekst";

export function tnKnappStil(variant: TnKnappVariant = "primar"): CSSProperties {
  if (variant === "primar") return { ...knappGrunn, background: TN.navy900, color: TN.white, border: `1px solid ${TN.navy900}` };
  if (variant === "grafitt") return { ...knappGrunn, background: TN.ink900, color: TN.white, border: `1px solid ${TN.ink900}` };
  if (variant === "tekst") return { ...knappGrunn, padding: "0 4px", background: "transparent", color: TN.navy900, border: "1px solid transparent" };
  return { ...knappGrunn, background: TN.white, color: TN.navy900, border: `1px solid ${TN.navy900}` };
}

export function TnHandlingLenke({ href, children, variant = "primar" }: { href: string; children: ReactNode; variant?: TnKnappVariant }) {
  return <Link href={href} style={tnKnappStil(variant)}>{children}</Link>;
}

export function TnKnapperekke({ children }: { children: ReactNode }) {
  return <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>{children}</div>;
}

const feltStil: CSSProperties = {
  minHeight: 44,
  padding: "0 12px",
  border: `1px solid ${TN.ink300}`,
  borderRadius: 2,
  background: TN.white,
  color: TN.ink900,
  fontFamily: TN.font.body,
  fontSize: 15,
  width: "100%",
  minWidth: 0,
};

function Etikett({ children }: { children: ReactNode }) {
  return <span style={{ fontFamily: TN.font.display, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: TN.textSecondary }}>{children}</span>;
}

export function TnFelt({ etikett, navn, type = "text", standard, pakrevd, hint, plassholder, maks }: { etikett: string; navn: string; type?: "text" | "date" | "time" | "datetime-local" | "email"; standard?: string; pakrevd?: boolean; hint?: string; plassholder?: string; maks?: number }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
      <Etikett>{etikett}</Etikett>
      <input name={navn} type={type} defaultValue={standard} required={pakrevd} placeholder={plassholder} maxLength={maks} style={{ ...feltStil, fontFamily: type === "text" || type === "email" ? TN.font.body : TN.font.mono }} />
      {hint ? <span style={{ fontSize: 13, color: TN.textSecondary }}>{hint}</span> : null}
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
      <dialog ref={ref} aria-labelledby={tittelId} className={styles.ark} style={{ border: `1px solid ${TN.navy100}`, borderRadius: 4, padding: 0, width: "min(560px, calc(100vw - 32px))", maxHeight: "calc(100dvh - 32px)", color: TN.ink900 }}>
        <form onSubmit={lagre} style={{ display: "flex", flexDirection: "column", gap: 16, padding: "clamp(18px, 3vw, 26px)" }}>
          <h2 id={tittelId} style={{ fontFamily: TN.font.display, fontWeight: 400, fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: TN.navy900, margin: 0, paddingBottom: 12, borderBottom: `2px solid ${TN.navy900}` }}>{tittel}</h2>
          {children}
          {feil ? <div role="alert" style={{ fontSize: 13.5, color: TN.status.redText, padding: "10px 12px", background: TN.navy50, borderLeft: `3px solid ${TN.status.red}`, borderRadius: 2 }}>{feil}</div> : null}
          <TnKnapperekke>
            <button type="submit" disabled={venter} style={{ ...tnKnappStil("primar"), opacity: venter ? 0.6 : 1 }}>{venter ? "Lagrer …" : lagreTekst}</button>
            <button type="button" onClick={() => ref.current?.close()} style={tnKnappStil("sekundar")}>Avbryt</button>
          </TnKnapperekke>
        </form>
      </dialog>
    </>
  );
}

/** Slett/avslutt med bekreftelse: grafitt knapp i et kort med rød kant. */
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
      <dialog ref={ref} aria-labelledby={tittelId} className={styles.ark} style={{ border: `1px solid ${TN.navy100}`, borderTop: `3px solid ${TN.red600}`, borderRadius: 4, padding: 0, width: "min(460px, calc(100vw - 32px))", color: TN.ink900 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "clamp(18px, 3vw, 24px)" }}>
          <h2 id={tittelId} style={{ fontFamily: TN.font.display, fontWeight: 400, fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: TN.navy900, margin: 0 }}>{tittel}</h2>
          <p style={{ fontSize: 14.5, lineHeight: 1.6, margin: 0 }}>{tekst}</p>
          {feil ? <div role="alert" style={{ fontSize: 13.5, color: TN.status.redText }}>{feil}</div> : null}
          <TnKnapperekke>
            <button type="button" disabled={venter} onClick={utfor} style={{ ...tnKnappStil("grafitt"), opacity: venter ? 0.6 : 1 }}>{venter ? "Vent …" : bekreft}</button>
            <button type="button" onClick={() => ref.current?.close()} style={tnKnappStil("sekundar")}>Avbryt</button>
          </TnKnapperekke>
        </div>
      </dialog>
    </>
  );
}
