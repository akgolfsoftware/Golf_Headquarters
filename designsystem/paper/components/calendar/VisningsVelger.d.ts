/**
 * Kalenderens visningsbryter — lukket union Dag/Uke/Måned/Periode/Agenda med
 * fast rekkefølge og faste norske etiketter. Dekker Kalender-flaten, Workbench
 * og PlayerHQ Plan (~6 skjermer). IKKE SegmentControl: den bytter vilkårlige
 * verdier, denne eier kalendervokabularet. Utvidelser skjer i VISNINGER i
 * biblioteket, aldri per skjerm.
 */
export type Visning = "dag" | "uke" | "maaned" | "periode" | "agenda";
export interface VisningsVelgerProps {
  value?: Visning;
  onChange?: (v: Visning) => void;
  /** Delmengde av unionen — rekkefølgen forblir bibliotekets */
  views?: Visning[];
  /** Full bredde, likt fordelte knapper (PlayerHQ-kolonnen) */
  block?: boolean;
  /** data-od-id: gruppen får nav-, knappene cta- */
  dataOdId?: string;
}
