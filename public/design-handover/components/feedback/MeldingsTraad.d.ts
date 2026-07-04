import * as React from "react";

export type MeldingFra = "meg" | "dem" | "ai";

export interface MeldingsTraadProps {
  /** Tilgjengelig navn på tråden, f.eks. "Samtale med Jonas Haugen". */
  label?: string;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface MeldingProps {
  /** Hvem som sender: "meg" (høyre, primary-fill) · "dem" (venstre, kort) · "ai" (venstre, lime-avatar). */
  fra?: MeldingFra;
  /** Avsendernavn — brukes i aria-label og vises over boblen for "dem". */
  navn?: string;
  /** Initialer i avataren (ignoreres for "ai", som får sparkles-ikon). */
  initialer?: string;
  /** Tidsstempel, f.eks. "10:42" eller "i går". */
  tid?: string;
  /** Innholdet: tekst og/eller rike kort (forslagskort, vedlegg) som children. */
  children?: React.ReactNode;
}

export interface SkilleProps {
  /** Dato-/kontekstetikett, f.eks. "I går" eller "Uke 25". */
  children?: React.ReactNode;
}

export interface SkriverProps {
  /** Navn på den som skriver, f.eks. "AI-Caddie". */
  navn?: string;
}

/**
 * Meldingstråd — chat/samtale-liste (AI-Caddie, innboks-svar, coach↔spiller).
 * Compound: <MeldingsTraad.Melding> · <MeldingsTraad.Skille> · <MeldingsTraad.Skriver>.
 * role="log" + aria-live for nye meldinger.
 */
export declare function MeldingsTraad(props: MeldingsTraadProps): JSX.Element;
export declare namespace MeldingsTraad {
  function Melding(props: MeldingProps): JSX.Element;
  function Skille(props: SkilleProps): JSX.Element;
  function Skriver(props: SkriverProps): JSX.Element;
}
