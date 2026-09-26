import type { ReactNode } from "react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import type { TnArbeidskontekst } from "@/lib/domain/tn-arbeidsflate";
import { TnShell, tnRolleNavn, type TnAktivSide } from "../tn-shell";

export async function hentSkjermbruker() {
  return requirePortalUser({ kreverTilgang: "INGEN" });
}

export function SkjermRamme({ aktiv, brukerNavn, kontekst, children }: { aktiv: TnAktivSide; brukerNavn: string | null; kontekst: TnArbeidskontekst; children: ReactNode }) {
  return (
    <TnShell aktiv={aktiv} brukerNavn={brukerNavn ?? "Ukjent"} rolle={tnRolleNavn(kontekst.rolle)} groupId={kontekst.gruppe.id} visTrenerflater={!kontekst.erSpiller} kanAdministrere={kontekst.kanAdministrere}>
      {children}
    </TnShell>
  );
}

const deler = new Intl.DateTimeFormat("en-GB", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Europe/Oslo" });

/** Kalenderdag i Oslo, uavhengig av serverens tidssone. */
export function osloDag(dato: Date) {
  const p = Object.fromEntries(deler.formatToParts(dato).map((d) => [d.type, d.value]));
  return { aar: Number(p.year), maned: Number(p.month), dag: Number(p.day) };
}

const kortDato = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "2-digit", timeZone: "Europe/Oslo" });
const langDato = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Oslo" });

/** «19.10–25.10» eller «19.10–25.10.2026» med år. */
export function periode(fra: Date, til: Date, medAar = false) {
  const a = kortDato.format(fra);
  const b = medAar ? langDato.format(til) : kortDato.format(til);
  return a === kortDato.format(til) ? (medAar ? langDato.format(fra) : a) : `${a}–${b}`;
}

export function datoKort(dato: Date) {
  return kortDato.format(dato);
}

export function datoLang(dato: Date) {
  return langDato.format(dato);
}

export const MANEDER = ["JAN", "FEB", "MAR", "APR", "MAI", "JUN", "JUL", "AUG", "SEP", "OKT", "NOV", "DES"] as const;
export const MANEDER_LANG = ["Januar", "Februar", "Mars", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Desember"] as const;

/** Leser et heltall fra søkeparameter innenfor [min, max], ellers standardverdien. */
export function heltallParam(verdi: string | string[] | undefined, min: number, max: number, standard: number) {
  const n = Number(Array.isArray(verdi) ? verdi[0] : verdi);
  return Number.isInteger(n) && n >= min && n <= max ? n : standard;
}

/** Spiller på college i USA (skolefeltet i profilen). Norske universiteter hører til Skoleoversikt. */
export const ER_COLLEGE = /college|university/i;
