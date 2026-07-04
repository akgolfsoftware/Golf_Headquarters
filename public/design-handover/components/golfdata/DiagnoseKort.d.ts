import * as React from "react";

export interface DiagnoseBevis {
  /** Enhet vist etter verdiene, f.eks. "%" eller "slag". */
  enhet?: string;
  /** Spillerens verdi, f.eks. { label: "Deg", verdi: 52 }. */
  spiller: { label: string; verdi: number | string };
  /** Navngitt baseline, f.eks. { label: "Kat. A-snitt", verdi: 68 }. */
  baseline: { label: string; verdi: number | string };
}

export interface DiagnoseResept {
  /** Pyramide-akse (KANONISK 5) — farger chip via --axis-*-soft/-text. */
  akse: "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
  /** Valgfri arena-/CS-kode i chip, f.eks. "M2" eller "CS90". */
  kode?: string;
  /** Resepten i klarspråk, f.eks. «Kravtrening på innspill 100–150 m — tre økter per uke.» */
  tekst?: string;
}

export interface DiagnoseKortProps {
  /** Symptomet i klarspråk (helten), f.eks. «Mister 0,8 slag på innspill 100–150 m». */
  symptom?: string;
  /** Mini-viz: deg mot navngitt baseline (to barer + verdier). */
  bevis?: DiagnoseBevis;
  /** Datagrunnlag — ALLTID synlig. F.eks. "14 runder · 62 innspill". Mangler det, vises det ærlig. */
  grunnlag?: string;
  /** AK-formel-akse + klarspråk-resept. */
  resept?: DiagnoseResept;
  /** CTA-tekst. Default «Planlegg dette». */
  ctaTekst?: string;
  /** Primærhandling — uten den vises ingen CTA. */
  onPlanlegg?: () => void;
  /** Progressiv dybde — én kodevei: nybegynner (symptom+resept) · ovet (+bevis-viz) · elite (+fagkode-chip). Default "ovet". */
  nivaa?: "nybegynner" | "ovet" | "elite";
  loading?: boolean;
  /** Tomtilstand = onboarding, aldri blank. */
  tomt?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * DiagnoseKort — analytikerkjeden: SYMPTOM → BEVIS (mot navngitt baseline,
 * datagrunnlag alltid synlig) → RESEPT (AK-formel-akse + «Planlegg dette»).
 */
export declare function DiagnoseKort(props: DiagnoseKortProps): JSX.Element;
