/**
 * Datakontrakten for godkjenningskøen (PlanAction, Caddie-utkast, økt-forespørsler,
 * ukesrapport). Flyttet hit fra components/admin/v2/AdminGodkjenningerV2 19.10.2026,
 * så Kø, Innboks og Cockpit i nytt design ikke importerer fra det gamle designet.
 */

export interface AdminGodkjenningV2Row {
  id: string;
  actionType: string;
  playerId: string;
  who: string;
  title: string;
  detail: string;
  signalKind: string | null;
  signalValue: string | null;
  diffPreview: string | null;
  when: string;
  urgent: boolean;
  lowRisk: boolean;
  /** A1: kilde-chip — "agent" (PlanAction) | "caddie" | "forespørsel". */
  kilde?: "agent" | "caddie" | "forespørsel";
  /** A1: kilder uten inline godkjenn-action lenker til sin flate. */
  eksternHref?: string | null;
  /** Punkt 5: lesbar forklaring fra PlanAction.provenance. Skjules når null
   *  (eldre saker uten strukturert kilde-sporing). */
  hvorfor?: string | null;
  /** Når saken kom inn (ISO). Innboks sorterer nyeste først på den. */
  opprettetIso?: string;
}
export interface AdminGodkjenningerV2Data {
  rows: AdminGodkjenningV2Row[];
  lowRiskCount: number;
  /** Kanonisk kø-telling (koTelling) — samme tall som innboks-banner/varsler. */
  totalt?: number;
  /** Nylig godkjente saker med sjekkpunkt (Løst / ETTER→FØR). */
  lostSjekkpunkter?: {
    id: string;
    who: string;
    sjekkpunkt: string;
    when: string;
  }[];
  /** Fasitens kildefaner-tellinger (agent/caddie-utkast/økt-forespørsler). */
  kilder?: { agent: number; caddie: number; forespørsel: number };
  /** Eldste sak i køen — «Køen i tall». Null når køen er tom. */
  eldste?: { dagerLabel: string; who: string } | null;
  /** Godkjent/avvist siste 7 dager på tvers av alle tre kilder. */
  godkjent7Dager?: number;
  avvist7Dager?: number;
  /** D3: ukesrapporten — et LESEELEMENT i køen, ikke en beslutning. */
  ukesrapport?: AdminUkesrapportKort | null;
}

/**
 * D3 · ukesrapport-kortet.
 * Fasit: designsystem/paper/fase2/agencyos/agencyos-godkjenninger.html
 *
 * Rapporten ber ikke om noen beslutning — den har derfor ingen Godkjenn-knapp
 * og bærer info-kant i stedet for beslutningskortenes fg-kant. Agenten leser
 * alt og skriver ingenting; å dele digesten er en manuell handling.
 */
export interface AdminUkesrapportKort {
  ukenummer: number;
  when: string;
  /** Talte nøkkeltall — hver med sin nevner i klartekst. */
  tall: { key: string; verdi: string; nevner: string }[];
  /** «Hvorfor?» — agent, kjøretid, datagrunnlag, nevner. */
  hvorfor: string[];
}
