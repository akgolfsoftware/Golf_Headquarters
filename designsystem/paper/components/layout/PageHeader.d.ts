/**
 * Sidehodet (~30 skjermer): kicker + h1 + ingress, med metadatalinje og
 * handlingsklynge bunnjustert til høyre. Verdiene er hentet fra
 * referanse-dashboardet — flex-end, 52ch og ingress 14.5px er tilsiktet.
 *
 * Antar IKKE én instans per dokument. Tilstandsmaskiner (playerhq-live,
 * playerhq-diagnose) har én PageHeader per visning; se .prompt.md for
 * kravet om at skjulte visninger fjernes fra tilgjengelighetstreet.
 */
export interface PageHeaderProps {
  /** Mono versaletikett — rendres av SectionLabel. Dato, uke, kontekst. */
  kicker?: React.ReactNode;
  title: React.ReactNode;
  /** Ingress i Lora 14.5px, maks 52ch. Én setning, du-form. */
  lead?: React.ReactNode;
  /** Metadatalinje i mono 11/500 over handlingene: «Sist oppdatert 08:42» */
  meta?: React.ReactNode;
  /** Maks 3, maks 1 primær. Panels én-kontroll-regel gjelder ikke her. */
  actions?: React.ReactNode;
  /** 1 som standard. 2–3 kun i en visning som ikke eier dokumentets h1. */
  level?: 1 | 2 | 3;
  dataOdId?: string;
}
