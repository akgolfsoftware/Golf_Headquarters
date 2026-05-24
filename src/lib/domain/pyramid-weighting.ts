/**
 * Pyramide-fordeling: faktisk vs ideell.
 *
 * AK Golf Academy bruker 5-trinns trenings-pyramide:
 *   FYS (fysisk), TEK (teknisk), SLAG (slagøvelser), SPILL (spill-trening), TURN (turnering)
 *
 * En plan setter en idealfordeling (summerer til 1.0). Vi sammenligner med
 * den faktiske fordelingen av økter og returnerer avvik per kategori + en
 * tekstlig anbefaling.
 */

// ---------------------------------------------------------------------------
// Typer
// ---------------------------------------------------------------------------

export type PyramidKategori = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";

export type PyramidFordeling = {
  fys: number;
  tek: number;
  slag: number;
  spill: number;
  turn: number;
};

export type PyramidOkt = {
  pyramid: PyramidKategori;
};

export type PyramidVurdering = {
  /** Ideell fordeling (0–1 per kategori, summerer til 1) */
  ideal: PyramidFordeling;
  /** Faktisk fordeling (0–1 per kategori, summerer til 1 hvis økter > 0) */
  faktisk: PyramidFordeling;
  /** Avvik = faktisk − ideal per kategori (positiv = for mye, negativ = for lite) */
  avvik: PyramidFordeling;
  /** Tekstlig anbefaling som peker på største avvik */
  anbefaling: string;
};

// ---------------------------------------------------------------------------
// Konstanter
// ---------------------------------------------------------------------------

const TOMT: PyramidFordeling = { fys: 0, tek: 0, slag: 0, spill: 0, turn: 0 };

const NAVN: Record<PyramidKategori, string> = {
  FYS: "fysisk trening",
  TEK: "teknisk trening",
  SLAG: "slagøvelser",
  SPILL: "spilltrening",
  TURN: "turneringsspill",
};

// ---------------------------------------------------------------------------
// Internfunksjoner
// ---------------------------------------------------------------------------

function tellKategorier(okter: ReadonlyArray<PyramidOkt>): PyramidFordeling {
  const teller: PyramidFordeling = { ...TOMT };
  for (const okt of okter) {
    switch (okt.pyramid) {
      case "FYS":
        teller.fys += 1;
        break;
      case "TEK":
        teller.tek += 1;
        break;
      case "SLAG":
        teller.slag += 1;
        break;
      case "SPILL":
        teller.spill += 1;
        break;
      case "TURN":
        teller.turn += 1;
        break;
    }
  }
  return teller;
}

function tilProsentFordeling(antall: PyramidFordeling): PyramidFordeling {
  const total = antall.fys + antall.tek + antall.slag + antall.spill + antall.turn;
  if (total === 0) return { ...TOMT };
  return {
    fys: antall.fys / total,
    tek: antall.tek / total,
    slag: antall.slag / total,
    spill: antall.spill / total,
    turn: antall.turn / total,
  };
}

function beregnAvvik(
  faktisk: PyramidFordeling,
  ideal: PyramidFordeling,
): PyramidFordeling {
  return {
    fys: faktisk.fys - ideal.fys,
    tek: faktisk.tek - ideal.tek,
    slag: faktisk.slag - ideal.slag,
    spill: faktisk.spill - ideal.spill,
    turn: faktisk.turn - ideal.turn,
  };
}

function storsteAvvik(
  avvik: PyramidFordeling,
): { kategori: PyramidKategori; verdi: number } {
  const liste: Array<{ kategori: PyramidKategori; verdi: number }> = [
    { kategori: "FYS", verdi: avvik.fys },
    { kategori: "TEK", verdi: avvik.tek },
    { kategori: "SLAG", verdi: avvik.slag },
    { kategori: "SPILL", verdi: avvik.spill },
    { kategori: "TURN", verdi: avvik.turn },
  ];

  let storst = liste[0];
  for (const item of liste) {
    if (Math.abs(item.verdi) > Math.abs(storst.verdi)) storst = item;
  }
  return storst;
}

// ---------------------------------------------------------------------------
// Eksporterte funksjoner
// ---------------------------------------------------------------------------

/**
 * Sammenligner faktiske økter mot ideell pyramide-fordeling.
 *
 * @param idealFordeling — verdier 0–1 som summerer til 1.0
 * @param faktiskOkter — array av økter med pyramid-kategori
 */
export function vurderPyramide(
  idealFordeling: PyramidFordeling,
  faktiskOkter: ReadonlyArray<PyramidOkt>,
): PyramidVurdering {
  const teller = tellKategorier(faktiskOkter);
  const faktisk = tilProsentFordeling(teller);
  const avvik = beregnAvvik(faktisk, idealFordeling);

  let anbefaling: string;
  if (faktiskOkter.length === 0) {
    anbefaling = "Ingen økter registrert. Start med å gjennomføre planlagte økter.";
  } else {
    const storst = storsteAvvik(avvik);
    const navn = NAVN[storst.kategori];
    const prosentpoeng = Math.round(Math.abs(storst.verdi) * 100);

    if (Math.abs(storst.verdi) < 0.05) {
      anbefaling = "Fordelingen følger planen godt — fortsett som nå.";
    } else if (storst.verdi > 0) {
      anbefaling = `Du har ${prosentpoeng} prosentpoeng for mye ${navn} — vurder å redusere og bytte til andre områder.`;
    } else {
      anbefaling = `Du har ${prosentpoeng} prosentpoeng for lite ${navn} — øk antallet økter i denne kategorien.`;
    }
  }

  return {
    ideal: { ...idealFordeling },
    faktisk,
    avvik,
    anbefaling,
  };
}
