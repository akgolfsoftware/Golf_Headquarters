/**
 * Stasjon for alle slag — oversetter tak-tall til «hvor du står» + regel.
 *
 * Innspill: sirkel = tak-nærhet × (din carry / takets slag). Putting i fot,
 * ikke skalert. Chip/bunker: tour-tabell, merket. Ingen øvelsesnavn.
 */
import {
  TAK_BAND,
  bandMidtMeter,
  rundMeter,
  slaTakSirkelMeter,
  type TakBandKode,
  type TakLie,
} from "@/lib/datagolf/tak";

export type StasjonSlagId =
  | "tee"
  | "innspill50"
  | "innspill100"
  | "innspill150"
  | "innspill200"
  | "chip"
  | "pitch"
  | "lob"
  | "bunker"
  | "putt0_3"
  | "putt3_5"
  | "putt5_10"
  | "putt10_40"
  | "putt40plus";

export type StasjonKind = "sirkel" | "korridor" | "i_hull" | "lag_putt" | "opp_og_ned";
export type StasjonEnhet = "m" | "ft";
export type StasjonKilde = "datagolf" | "tour-arg" | "tour-putt" | "mangler";

export type StasjonSlagDef = {
  id: StasjonSlagId;
  omraade: string;
  gruppe: "tee" | "innspill" | "kortspill" | "putting";
  etikett: string;
  kind: StasjonKind;
  trengerCarry: boolean;
  innspillBand?: TakBandKode;
};

export const STASJON_SLAG: readonly StasjonSlagDef[] = [
  { id: "tee", omraade: "TEE", gruppe: "tee", etikett: "Tee", kind: "korridor", trengerCarry: true },
  { id: "innspill50", omraade: "INNSPILL_50", gruppe: "innspill", etikett: "~50 m", kind: "sirkel", trengerCarry: true, innspillBand: "innspill50" },
  { id: "innspill100", omraade: "INNSPILL_100", gruppe: "innspill", etikett: "~100 m", kind: "sirkel", trengerCarry: true, innspillBand: "innspill100" },
  { id: "innspill150", omraade: "INNSPILL_150", gruppe: "innspill", etikett: "~150 m", kind: "sirkel", trengerCarry: true, innspillBand: "innspill150" },
  { id: "innspill200", omraade: "INNSPILL_200", gruppe: "innspill", etikett: "~200 m", kind: "sirkel", trengerCarry: true, innspillBand: "innspill200" },
  { id: "chip", omraade: "CHIP", gruppe: "kortspill", etikett: "Chip", kind: "opp_og_ned", trengerCarry: false },
  { id: "pitch", omraade: "PITCH", gruppe: "kortspill", etikett: "Pitch", kind: "sirkel", trengerCarry: true, innspillBand: "innspill50" },
  { id: "lob", omraade: "LOB", gruppe: "kortspill", etikett: "Lob", kind: "opp_og_ned", trengerCarry: false },
  { id: "bunker", omraade: "BUNKER", gruppe: "kortspill", etikett: "Bunker", kind: "opp_og_ned", trengerCarry: false },
  { id: "putt0_3", omraade: "PUTT_0_3", gruppe: "putting", etikett: "Putt 0–3 ft", kind: "i_hull", trengerCarry: false },
  { id: "putt3_5", omraade: "PUTT_3_5", gruppe: "putting", etikett: "Putt 3–5 ft", kind: "i_hull", trengerCarry: false },
  { id: "putt5_10", omraade: "PUTT_5_10", gruppe: "putting", etikett: "Putt 5–10 ft", kind: "lag_putt", trengerCarry: false },
  { id: "putt10_40", omraade: "PUTT_10_40", gruppe: "putting", etikett: "Putt 10–40 ft", kind: "lag_putt", trengerCarry: false },
  { id: "putt40plus", omraade: "PUTT_40_PLUSS", gruppe: "putting", etikett: "Putt 40+ ft", kind: "lag_putt", trengerCarry: false },
];

/** Tour ARG fra 10 m — `BENCHMARK_ARG` i src/lib/domain/sg.ts. */
const TOUR_ARG_10M = 2.36;
/** Broadie putting «etter miss» (pga-sync): 3 m → 0,8 m ≈ 2,6 ft. */
const LAG_PUTT_10FT = 2.6;
const LAG_PUTT_20FT = 4.6;
const LAG_PUTT_40FT = 9.8;

export type TakBandSnapshot = {
  band: string;
  lie: string;
  proximityMeters: number | null;
  sgPerShot: number | null;
};

export type TakSnapshot = {
  dgPlayerId: number;
  name: string;
  asOf: Date;
  formLabel: string | null;
  drivingDistY: number | null;
  drivingAcc: number | null;
  bands: TakBandSnapshot[];
};

export type Stasjon = {
  slag: StasjonSlagDef;
  takNavn: string;
  kind: StasjonKind;
  stasjonVerdi: number | null;
  stasjonEnhet: StasjonEnhet;
  maalVerdi: number | null;
  maalEnhet: StasjonEnhet | null;
  regel: string;
  kilde: StasjonKilde;
  kildeTekst: string;
  manglerCarry: boolean;
  lekkasje: boolean;
  baller: 10;
};

export function finnSlag(id: string | null | undefined): StasjonSlagDef {
  return STASJON_SLAG.find((s) => s.id === id) ?? STASJON_SLAG[2];
}

export function fairwayBand(
  tak: TakSnapshot,
  kode: TakBandKode,
  lie: TakLie = "fairway",
): TakBandSnapshot | null {
  return tak.bands.find((b) => b.band === kode && b.lie === lie) ?? null;
}

export function byggStasjon(input: {
  slag: StasjonSlagDef;
  tak: TakSnapshot;
  carryMeter: number | null;
  lie?: TakLie;
}): Stasjon {
  const lie = input.lie ?? "fairway";
  const base = {
    slag: input.slag,
    takNavn: input.tak.name,
    baller: 10 as const,
    lekkasje: false,
    manglerCarry: false,
  };

  if (input.slag.innspillBand) {
    const band = fairwayBand(input.tak, input.slag.innspillBand, lie);
    const prox = band?.proximityMeters ?? null;
    const manglerCarry = input.carryMeter == null || !(input.carryMeter > 0);
    const def = TAK_BAND.find((b) => b.kode === input.slag.innspillBand && b.lie === "fairway");
    const takSlag = def ? bandMidtMeter(def.minYards, def.maxYards) : 0;
    const sirkel =
      prox != null && !manglerCarry
        ? slaTakSirkelMeter({
            takNaerhetMeter: prox,
            elevCarryMeter: input.carryMeter!,
            takSlagMeter: takSlag,
          })
        : null;
    const lekkasje = (band?.sgPerShot ?? 0) < 0;
    return {
      ...base,
      kind: "sirkel",
      stasjonVerdi: manglerCarry ? null : input.carryMeter,
      stasjonEnhet: "m",
      maalVerdi: sirkel,
      maalEnhet: "m",
      manglerCarry,
      lekkasje,
      kilde: prox != null ? "datagolf" : "mangler",
      kildeTekst:
        prox != null
          ? `Data powered by DataGolf · ${datoKort(input.tak.asOf)}`
          : "Innspill-nærhet mangler for dette taket.",
      regel: manglerCarry
        ? "Mål carry først. Stasjonen er din lengde med denne køllerollen."
        : `10 baller. Inne i sirkelen (${fmtLengde(sirkel, "m")}) slår ${input.tak.name}.`,
    };
  }

  if (input.slag.id === "tee") {
    const manglerCarry = input.carryMeter == null || !(input.carryMeter > 0);
    const dist = input.tak.drivingDistY;
    const acc = input.tak.drivingAcc;
    const distTekst = dist == null ? "mangler" : `${dist > 0 ? "+" : ""}${rundMeter(dist, 1)} yards mot feltet`;
    const accTekst = acc == null ? "mangler" : acc >= 0 ? "treff pluss" : "treff minus";
    return {
      ...base,
      kind: "korridor",
      stasjonVerdi: manglerCarry ? null : input.carryMeter,
      stasjonEnhet: "m",
      maalVerdi: null,
      maalEnhet: null,
      manglerCarry,
      kilde: dist != null || acc != null ? "datagolf" : "mangler",
      kildeTekst: `Data powered by DataGolf · ${datoKort(input.tak.asOf)}`,
      regel: manglerCarry
        ? "Mål driver-carry først. Ikke jakte takets meter."
        : `Treff stripen. ${input.tak.name}: ${distTekst}, ${accTekst}.`,
    };
  }

  if (input.slag.id === "chip") {
    return {
      ...base,
      kind: "opp_og_ned",
      stasjonVerdi: 10,
      stasjonEnhet: "m",
      maalVerdi: null,
      maalEnhet: null,
      kilde: "tour-arg",
      kildeTekst: `Tour-tabell, ikke ${input.tak.name}. Forventet ${TOUR_ARG_10M.toString().replace(".", ",")} slag igjen fra 10 m.`,
      regel: "10 baller fra 10 m. På green og ferdig i 2 slag = inne.",
    };
  }

  if (input.slag.id === "lob") {
    return {
      ...base,
      kind: "opp_og_ned",
      stasjonVerdi: 20,
      stasjonEnhet: "m",
      maalVerdi: null,
      maalEnhet: null,
      kilde: "tour-arg",
      kildeTekst: `Tour-tabell, ikke ${input.tak.name}. DataGolf splitter ikke lob.`,
      regel: "10 baller fra 20 m. På green = inne.",
    };
  }

  if (input.slag.id === "bunker") {
    return {
      ...base,
      kind: "opp_og_ned",
      stasjonVerdi: 15,
      stasjonEnhet: "m",
      maalVerdi: null,
      maalEnhet: null,
      kilde: "tour-arg",
      kildeTekst: `Tour-tabell, ikke ${input.tak.name}. DataGolf splitter ikke bunker.`,
      regel: "10 baller fra 15 m i sand. På green = inne.",
    };
  }

  if (input.slag.gruppe === "putting") {
    return byggPutt(input.slag, input.tak.name);
  }

  return {
    ...base,
    kind: "sirkel",
    stasjonVerdi: null,
    stasjonEnhet: "m",
    maalVerdi: null,
    maalEnhet: null,
    manglerCarry: true,
    kilde: "mangler",
    kildeTekst: "Kilde mangler.",
    regel: "Dette slaget har ikke stasjon ennå.",
  };
}

function byggPutt(slag: StasjonSlagDef, takNavn: string): Stasjon {
  const tabell: Record<
    string,
    { stasjon: number; kind: StasjonKind; lag: number | null; regel: string }
  > = {
    putt0_3: { stasjon: 3, kind: "i_hull", lag: null, regel: "10 putter fra 3 ft. I hull = inne." },
    putt3_5: { stasjon: 5, kind: "i_hull", lag: null, regel: "10 putter fra 5 ft. I hull = inne." },
    putt5_10: {
      stasjon: 8,
      kind: "lag_putt",
      lag: LAG_PUTT_10FT,
      regel: `10 putter fra 8 ft. Miss: neste innen ${fmtLengde(LAG_PUTT_10FT, "ft")}.`,
    },
    putt10_40: {
      stasjon: 20,
      kind: "lag_putt",
      lag: LAG_PUTT_20FT,
      regel: `10 putter fra 20 ft. Miss: neste innen ${fmtLengde(LAG_PUTT_20FT, "ft")}.`,
    },
    putt40plus: {
      stasjon: 40,
      kind: "lag_putt",
      lag: LAG_PUTT_40FT,
      regel: `10 putter fra 40 ft. Miss: neste innen ${fmtLengde(LAG_PUTT_40FT, "ft")}.`,
    },
  };
  const rad = tabell[slag.id] ?? tabell.putt5_10;
  return {
    slag,
    takNavn,
    kind: rad.kind,
    stasjonVerdi: rad.stasjon,
    stasjonEnhet: "ft",
    maalVerdi: rad.lag,
    maalEnhet: rad.lag != null ? "ft" : null,
    manglerCarry: false,
    lekkasje: false,
    baller: 10,
    kilde: "tour-putt",
    kildeTekst: `Tour-tabell (Broadie/IUP), ikke ${takNavn}. DataGolf har ikke putting per fot.`,
    regel: rad.regel,
  };
}

export function sirkelAndreTak(input: {
  slag: StasjonSlagDef;
  carryMeter: number | null;
  lie?: TakLie;
  andre: TakSnapshot[];
}): { name: string; sirkelMeter: number | null }[] {
  if (!input.slag.innspillBand || input.carryMeter == null || !(input.carryMeter > 0)) {
    return [];
  }
  const lie = input.lie ?? "fairway";
  return input.andre.map((tak) => {
    const st = byggStasjon({ slag: input.slag, tak, carryMeter: input.carryMeter, lie });
    return { name: tak.name, sirkelMeter: st.maalEnhet === "m" ? st.maalVerdi : null };
  });
}

export function fmtLengde(n: number | null, enhet: StasjonEnhet | null): string {
  if (n == null || enhet == null || !Number.isFinite(n)) return "mangler";
  const avrundet = rundMeter(n, 1);
  const tekst = Number.isInteger(avrundet)
    ? String(avrundet)
    : avrundet.toFixed(1).replace(".", ",");
  return `${tekst} ${enhet}`;
}

export function ferdigSetning(inne: number, totalt: number, takNavn: string): string {
  if (inne <= 0) return `Ingen inne — sirkelen mot ${takNavn} står.`;
  if (inne >= totalt) return `Du slo ${takNavn} på alle ${totalt}.`;
  return `Du slo ${takNavn} på ${inne} av ${totalt}.`;
}

function datoKort(d: Date): string {
  return new Intl.DateTimeFormat("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Oslo",
  }).format(d);
}
