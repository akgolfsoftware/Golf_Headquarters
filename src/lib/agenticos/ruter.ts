// Ruteren i AgenticOS: klassifiserer en oppgave før noe koster penger.
//
// Bevisst deterministisk. Nøkkelord + rollen fra sesjonen dekker de vanlige
// spørsmålene; det som faller igjennom får intent "fritekst" med lav confidence,
// og kalleren velger da den generelle prompten framfor å gjette. Et LLM-kall for
// klassifisering (Haiku, strukturert JSON) kan legges oppå denne senere — men
// bare for de tilfellene regelen ikke traff, ikke for alle.
//
// Trygg for klient — ingen server-only imports.

import {
  TERSKEL_LAV_CONFIDENCE,
  type Domene,
  type Intent,
  type Klassifisering,
  type Rolle,
} from "./typer";

type Regel = { intent: Intent; domene: Domene; ord: readonly string[] };

// Rekkefølgen betyr noe: første regel med treff vinner. De mest spesifikke
// domenene står først, slik at «trackman» ikke drukner i «teknikk».
const REGLER: readonly Regel[] = [
  {
    intent: "tolk-tall",
    domene: "TRACKMAN",
    ord: ["trackman", "smash", "spinn", "carry", "launch", "face to path", "køllehode"],
  },
  {
    intent: "tolk-tall",
    domene: "SG",
    ord: ["strokes gained", "sg", "baseline", "benchmark", "statistikk", "tallene mine"],
  },
  {
    intent: "drill",
    domene: "TEKNIKK",
    ord: ["øvelse", "ovelse", "drill", "hva skal jeg trene", "trene på"],
  },
  {
    intent: "teknikk",
    domene: "TEKNIKK",
    ord: ["sving", "posisjon", "p1", "p4", "p7", "grep", "oppstilling", "treffpunkt", "morad"],
  },
  {
    intent: "plan",
    domene: "PLAN",
    ord: [
      "plan",
      "ukeplan",
      "treningsplan",
      "årsplan",
      "sesongplan",
      "uke",
      "periode",
      "periodisering",
      "økt",
      "okt",
      "sesong",
      "peaking",
      "turnering",
    ],
  },
  {
    intent: "drift",
    domene: "BOOKING",
    ord: ["booking", "book", "time", "kalender", "ledig", "avbestill"],
  },
  {
    intent: "drift",
    domene: "OKONOMI",
    ord: ["faktura", "betaling", "abonnement", "pris", "lønn", "lonn", "regnskap"],
  },
];

function normaliser(tekst: string): string {
  return tekst.toLowerCase().replace(/\s+/g, " ").trim();
}

// Norsk bøyning: ordet må starte på en ordgrense, men kan ha en kjent endelse.
// «turnering» treffer «turneringen», «økt» treffer «økter». Endelser utenfor
// lista slipper ikke gjennom, så «plan» treffer ikke «planke».
//
// Sammensetninger må stå eksplisitt i REGLER («ukeplan»), ikke løses med
// delstreng-matching — det ville gjort «sg» til et treff inni «designe».
const ENDELSER = ["", "en", "et", "er", "ene", "a", "ers", "s"] as const;

/** Treffer ordet (med norsk endelse) som eget ord — ikke som delstreng. */
function harOrd(tekst: string, ord: string): boolean {
  const escaped = ord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const alternativer = ENDELSER.map((e) => escaped + e).join("|");
  return new RegExp(
    `(^|[^\\p{L}\\p{N}])(${alternativer})([^\\p{L}\\p{N}]|$)`,
    "u",
  ).test(tekst);
}

/**
 * Klassifiser en oppgave. `mindreaarig` kommer fra kalleren (sesjonen), ikke fra
 * teksten — vi gjetter aldri på alder.
 */
export function klassifiser(input: {
  tekst: string;
  rolle: Rolle;
  mindreaarig?: boolean;
}): Klassifisering {
  const tekst = normaliser(input.tekst);
  const mindreaarig = input.mindreaarig ?? false;

  if (tekst.length === 0) {
    return {
      intent: "fritekst",
      domene: "GENERELT",
      rolle: input.rolle,
      mindreaarig,
      confidence: 0,
    };
  }

  for (const regel of REGLER) {
    const treff = regel.ord.filter((o) => harOrd(tekst, o));
    if (treff.length === 0) continue;

    // Flere treff i samme regel styrker klassifiseringen. Ett treff på et kort,
    // tvetydig ord er svakere enn to uavhengige signaler.
    const confidence = treff.length >= 2 ? 0.9 : 0.7;
    return { intent: regel.intent, domene: regel.domene, rolle: input.rolle, mindreaarig, confidence };
  }

  return {
    intent: "fritekst",
    domene: "GENERELT",
    rolle: input.rolle,
    mindreaarig,
    confidence: 0.3,
  };
}

/** Skal kalleren falle tilbake til den generelle prompten? */
export function erUsikker(k: Klassifisering): boolean {
  return k.confidence < TERSKEL_LAV_CONFIDENCE;
}
