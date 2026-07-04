import * as React from "react";

export interface NesteFokusKortProps {
  /** Verdikten i klarspråk (helten). F.eks. «Putting innenfor 6 ft er største lekkasje». */
  omrade?: string;
  /** SG-aksen lekkasjen gjelder — styrer klarspråk/fagkode-visning. */
  akse?: "OTT" | "APP" | "ARG" | "PUTT";
  /** AK-formel-akse-kode (elite/coach), f.eks. "SLAG_PUTT" → «Tren SLAG_PUTT». */
  formelAkse?: string;
  /** SG-tap som visningsstreng m/ fortegn og desimal, f.eks. "−1,2". Enheten «slag» legges på. */
  sgTap?: string;
  /** Navngitt baseline — ALLTID vist. F.eks. "Broadie scratch" / "Team Norway IUP" / "Kategori B-krav". */
  baseline?: string;
  /** Klarspråk-forklaring (vises fra nivå «øvet»). */
  begrunnelse?: string;
  /** Benchmark-linje (kun «elite»), f.eks. "Tour-snitt +0,4 slag". */
  benchmark?: string;
  /** Progressiv dybde — én kodevei, gater lag + klarspråk↔fagkode. Default "ovet". */
  nivaa?: "nybegynner" | "ovet" | "elite";
  handlingTekst?: string;
  onHandling?: () => void;
  loading?: boolean;
  /** Tomtilstand = onboarding, aldri blank. */
  tomt?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * NesteFokusKort — dommen som selger abonnementet: største SG-lekkasje →
 * anbefalt treningsområde. Verdikt er helten, SG-tapet er bevis under. SG mot
 * navngitt baseline, --up/--down (aldri lime). Tomt = onboarding.
 */
export declare function NesteFokusKort(props: NesteFokusKortProps): JSX.Element;
