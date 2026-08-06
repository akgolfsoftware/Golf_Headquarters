/**
 * Launch-vinduet per kølle: målt launch/spinn/angrepsvinkel mot målvindu
 * (~4 skjermer). Markør i blekk innenfor, leire utenfor. IKKE
 * StrikeSmashKort (kontakten) og IKKE GappingChart (lengder) — dette er
 * ballens START. Chromeless — flaten eies av Panel.
 */
export interface LaunchParam {
  /** «Launch», «Spinn», «Angrepsvinkel» */
  label: string;
  value: number;
  /** «12,4°» — alltid med enhet */
  display: string;
  windowMin: number;
  windowMax: number;
  /** «11–14°» */
  windowDisplay: string;
  scaleMin: number;
  scaleMax: number;
  inWindow?: boolean;
}
export interface LaunchWindowKortProps {
  club?: string;
  params: LaunchParam[];
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  dataOdId?: string;
}
