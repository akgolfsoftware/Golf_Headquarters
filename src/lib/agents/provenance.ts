/**
 * Datagrunnlag ("provenance") for agent-forslag og -signaler.
 *
 * Hensikt: en coach som ser et forslag i AgencyOS skal kunne se HVORFOR det
 * kom — hvilke rader agenten leste, hvilken regel som slo ut, og hvilken
 * terskel som ble brutt. I dag ligger dette som fritekst inne i `suggestion`,
 * ulikt formatert per agent. Denne modulen gir én form alle agenter fyller.
 *
 * Lagres i `PlanAction.provenance` / `Signal.provenance` (begge Json?).
 * Feltet er nullbart: alle rader skrevet før 29. juli 2026 mangler det, og
 * drifts-agenter (booking, betaling, purring) fyller det bevisst ikke —
 * der er datagrunnlaget selve hendelsen, ikke en beregning.
 */

import type { Prisma } from "@/generated/prisma/client";
import { z } from "zod";

/** Hvilken datatype agenten leste for å komme fram til forslaget. */
export const KILDER = [
  "RUNDE",
  "TRACKMAN",
  "TEST",
  "OKT",
  "PLAN",
  "TURNERING",
  "ABONNEMENT",
  "AKTIVITET",
] as const;

export type Kilde = (typeof KILDER)[number];

/** Norske etiketter for visning i AgencyOS. */
export const KILDE_ETIKETT: Record<Kilde, string> = {
  RUNDE: "Runder",
  TRACKMAN: "TrackMan-økter",
  TEST: "Tester",
  OKT: "Treningsøkter",
  PLAN: "Treningsplan",
  TURNERING: "Turneringer",
  ABONNEMENT: "Abonnement",
  AKTIVITET: "Innlogginger",
};

/** Én konkret rad agenten leste — så coach kan gå tilbake til kilden. */
const datapunktSchema = z.object({
  id: z.string().min(1),
  /** ISO-dato for raden (rundedato, øktdato, testdato). */
  dato: z.string().optional(),
  /** Kort menneskelesbar merkelapp, f.eks. «Bossum 18 hull». */
  etikett: z.string().max(120).optional(),
});

export const provenanceSchema = z.object({
  /** Alltid 1 inntil formen endres — gjør gamle rader trygge å lese. */
  versjon: z.literal(1),
  kilde: z.enum(KILDER),
  /** Hvilke rader beregningen bygger på. Tom liste er lov (regel uten rader). */
  datapunkter: z.array(datapunktSchema).max(50),
  /** Regelen som slo ut, i klarspråk: «SG under terskel siste 30 dager». */
  regel: z.string().min(1).max(200),
  /** Terskelen regelen sammenlignet mot, hvis den er tallfestet. */
  terskel: z.number().optional(),
  /** Verdien som faktisk ble målt. */
  maaltVerdi: z.number().optional(),
  /** Enhet for terskel/målt verdi, f.eks. «SG», «m/s», «%». */
  enhet: z.string().max(20).optional(),
  /** Tidsvinduet agenten så på. */
  fraDato: z.string().optional(),
  tilDato: z.string().optional(),
  /** Når grunnlaget ble beregnet (ISO). */
  beregnetAt: z.string(),
});

export type Provenance = z.infer<typeof provenanceSchema>;

type ByggArgs = {
  kilde: Kilde;
  regel: string;
  datapunkter?: { id: string; dato?: Date | string | null; etikett?: string }[];
  terskel?: number;
  maaltVerdi?: number;
  enhet?: string;
  fraDato?: Date | string | null;
  tilDato?: Date | string | null;
  /** Injiserbar for testbarhet — default «nå». */
  beregnetAt?: Date;
};

function iso(v: Date | string | null | undefined): string | undefined {
  if (v == null) return undefined;
  const d = v instanceof Date ? v : new Date(v);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

/**
 * Bygger et provenance-objekt klart for Prisma-skriving.
 * Kaster hvis formen er ugyldig — en agent som ikke klarer å beskrive sitt
 * eget grunnlag skal feile høyt, ikke skrive et halvt spor.
 */
export function byggProvenance(args: ByggArgs): Prisma.InputJsonValue {
  const prov: Provenance = provenanceSchema.parse({
    versjon: 1,
    kilde: args.kilde,
    regel: args.regel,
    datapunkter: (args.datapunkter ?? []).slice(0, 50).map((d) => ({
      id: d.id,
      dato: iso(d.dato),
      etikett: d.etikett,
    })),
    terskel: args.terskel,
    maaltVerdi: args.maaltVerdi,
    enhet: args.enhet,
    fraDato: iso(args.fraDato),
    tilDato: iso(args.tilDato),
    beregnetAt: (args.beregnetAt ?? new Date()).toISOString(),
  });
  return { ...prov } satisfies Prisma.InputJsonValue;
}

/**
 * Leser provenance tilbake fra databasen. Returnerer null for rader uten
 * grunnlag og for rader med utdatert/ugyldig form — UI-et skal da bare la
 * være å vise seksjonen, aldri krasje.
 */
export function lesProvenance(verdi: unknown): Provenance | null {
  if (verdi == null) return null;
  const res = provenanceSchema.safeParse(verdi);
  return res.success ? res.data : null;
}

const NO_DATO = new Intl.DateTimeFormat("nb-NO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Europe/Oslo",
});

function formatterDato(isoStr: string | undefined): string | null {
  if (!isoStr) return null;
  const d = new Date(isoStr);
  return isNaN(d.getTime()) ? null : NO_DATO.format(d);
}

/**
 * Gjør provenance om til korte norske linjer for visning i AgencyOS.
 * Ingen JSON på skjerm — coach skal lese setninger.
 */
export function provenanceLinjer(prov: Provenance): string[] {
  const linjer: string[] = [prov.regel];

  if (prov.maaltVerdi != null) {
    const enhet = prov.enhet ? ` ${prov.enhet}` : "";
    const maalt = `Målt: ${prov.maaltVerdi.toFixed(2)}${enhet}`;
    linjer.push(
      prov.terskel != null
        ? `${maalt} (terskel ${prov.terskel.toFixed(2)}${enhet})`
        : maalt,
    );
  }

  const fra = formatterDato(prov.fraDato);
  const til = formatterDato(prov.tilDato);
  if (fra && til) linjer.push(`Periode: ${fra} til ${til}`);
  else if (fra) linjer.push(`Fra ${fra}`);

  if (prov.datapunkter.length > 0) {
    linjer.push(
      `${KILDE_ETIKETT[prov.kilde]}: ${prov.datapunkter.length} lest`,
    );
  }

  return linjer;
}
