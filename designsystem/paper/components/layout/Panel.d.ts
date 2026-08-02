/**
 * Kortflaten hele plattformen står på (~60 skjermer). Papir på papir:
 * --surface, 1px --border, --r, --shadow. Erstatter den håndrullede
 * panel-literalen som ble gjentatt seks ganger i templatene.
 *
 * Ikke det samme som KPI-flisen (.akhq-card i KpiCard) — Panel er
 * beholderen, KpiCard er innholdet.
 *
 * Uten `title` rendres Panel som <div>: et landemerke uten tilgjengelig
 * navn skal ikke forekomme.
 */
export interface PanelProps {
  /** Seksjonstittel. Settes den, rendres <section> med aria-labelledby; uten den <div>. */
  title?: string;
  /** Følger skjermens disposisjon, ikke flaten. Default 2 — skjermen overstyrer. */
  titleLevel?: 2 | 3 | 4;
  /** Mono versal-etikett over tittelen (SectionLabel-mønsteret) */
  label?: string;
  /** Høyre handling: ÉN ghost-knapp eller én liten kontroll. Ikke en klynge. */
  action?: React.ReactNode;
  /** Avsluttende prosalinje over skillelinje — Lora, --muted */
  footnote?: React.ReactNode;
  /** md 16/18/18 (standard) · sm tettere, for paneler i sidespalte */
  density?: "md" | "sm";
  /** Nullstiller polstring så rader kan gå til kanten; head/foot beholder sin */
  flush?: boolean;
  /** Med flush: også body går helt til kanten (fullbredde-viz, tabeller) */
  bleed?: boolean;
  /** data-od-id, rolleprefiks panel- */
  dataOdId?: string;
  children?: React.ReactNode;
}
