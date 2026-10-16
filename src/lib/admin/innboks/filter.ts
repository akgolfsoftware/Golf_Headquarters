/**
 * Innboks (AG-04) — filtrene og adressene. Ren modul: ingen Prisma, ingen React.
 *
 * Tegningen (Claude Design 7d7c2994, ui_kits/agencyos/screens/AG-innboks.jsx)
 * har Alle · Spillere · E-post · Godkjenn · Oppfølging · Varsler. Caddie-forslag
 * (AG-A08) og Datakvalitet (AG-A05, AG-RD-02) er egne faner i Innboks
 * (ui_kits/_shared/ia.js, plassering).
 */

export const INNBOKS_FILTRE = [
  { id: "alle", label: "Alle" },
  { id: "spillere", label: "Spillere" },
  { id: "epost", label: "E-post" },
  { id: "godkjenn", label: "Godkjenn" },
  { id: "oppfolging", label: "Oppfølging" },
  { id: "varsler", label: "Varsler" },
  { id: "caddie", label: "Caddie-forslag" },
  { id: "datakvalitet", label: "Datakvalitet" },
] as const;

export type InnboksFilterId = (typeof INNBOKS_FILTRE)[number]["id"];

/** Oppfølgingens fire kolonner (FollowUpCase.status). Rekkefølgen er visningsrekkefølgen. */
export const OPPF_STATUSER = [
  { id: "risk", label: "Risiko" },
  { id: "watch", label: "Følg med" },
  { id: "check", label: "Sjekk" },
  { id: "ok", label: "Løst" },
] as const;

export type OppfStatus = (typeof OPPF_STATUSER)[number]["id"];

/** Gamle verdier i `?filter=` som fortsatt skal treffe riktig fane. */
const ALIAS: Record<string, InnboksFilterId> = {
  meldinger: "varsler",
  godkjenninger: "godkjenn",
  ko: "godkjenn",
  "e-post": "epost",
  utkast: "epost",
  oppfolgingsko: "oppfolging",
  queue: "oppfolging",
  kvalitet: "datakvalitet",
};

export function lesInnboksFilter(verdi: string | undefined | null): InnboksFilterId {
  if (!verdi) return "alle";
  const v = verdi.toLowerCase();
  if (INNBOKS_FILTRE.some((f) => f.id === v)) return v as InnboksFilterId;
  return ALIAS[v] ?? "alle";
}

export function lesOppfStatus(verdi: string | undefined | null): OppfStatus | null {
  return OPPF_STATUSER.some((o) => o.id === verdi) ? (verdi as OppfStatus) : null;
}

/**
 * Adressen for en fane. Andre søkeparametre beholdes (gamle adresser sender
 * videre med sine egne parametre), men `filter` byttes.
 */
export function innboksHref(filter: InnboksFilterId, ovrige?: URLSearchParams | Record<string, string | string[] | undefined>): string {
  const q = new URLSearchParams();
  if (ovrige instanceof URLSearchParams) {
    ovrige.forEach((v, k) => { if (k !== "filter") q.append(k, v); });
  } else if (ovrige) {
    for (const [k, v] of Object.entries(ovrige)) {
      if (k === "filter" || v == null) continue;
      for (const x of Array.isArray(v) ? v : [v]) q.append(k, x);
    }
  }
  if (filter !== "alle") q.set("filter", filter);
  const s = q.toString();
  return s ? `/admin/innboks?${s}` : "/admin/innboks";
}
