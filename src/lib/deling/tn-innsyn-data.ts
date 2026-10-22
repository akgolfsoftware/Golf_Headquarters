import "server-only";

import {
  hentTnSpillerAktivePlaner,
  hentTnSpillerIup,
  hentTnSpillerProfil,
  hentTnSpillerTester,
  hentTnSpillerTrening,
  medTnSpillerData,
  type TnBruker,
} from "@/lib/domain/tn-arbeidsflate";
import { hentTnIupDelt, hentTnIupRanking } from "@/lib/domain/tn-iup-oversikt";
import { hentTnEvalueringGrunnlag } from "@/lib/domain/tn-evaluering";
import { hentTnTekniskPlaner } from "@/lib/domain/tn-teknisk-plan";
import { hentSpillerpostTidslinje } from "@/lib/domain/tn-post";
import { byggPlanvisning } from "@/lib/turneringsplan/data";
import type { TnInnsynFane } from "./tn-innsyn-faner";

const osloAar = (d: Date) => Number(new Intl.DateTimeFormat("en-GB", { year: "numeric", timeZone: "Europe/Oslo" }).format(d));

/**
 * «Se hva Team Norway ser»: spillerens egen IUP lest med de samme leserne som trenerflaten
 * (src/app/team-norway/spiller/[spillerId]), så tallene er de samme. Spiller-id-en er ALLTID den
 * innloggede brukeren; siden tar ingen id fra adressen. Leserne slipper spilleren inn bare på sin
 * egen IUP (eiergrenen i `medTnSpillerData`). Null når brukeren ikke er spiller i en Team Norway-gruppe.
 */
export async function hentTnInnsyn(bruker: TnBruker, fane: TnInnsynFane, naa = new Date()) {
  const id = bruker.id;
  const aar = osloAar(naa);
  switch (fane) {
    case "oversikt": {
      const [profil, delt, tester, poster] = await Promise.all([
        hentTnSpillerProfil(bruker, id, aar),
        hentTnIupDelt(bruker, id, naa),
        hentTnSpillerTester(bruker, id),
        hentSpillerpostTidslinje(id, id),
      ]);
      if (!profil) return null;
      return { fane, aar, profil, delt, tester: tester?.rader ?? [], poster: poster ?? [] } as const;
    }
    case "turneringsplan": {
      const plan = await medTnSpillerData(bruker, id, (tx) => byggPlanvisning(tx, id, naa));
      return plan === null ? null : ({ fane, plan } as const);
    }
    case "ranking": {
      const ranking = await hentTnIupRanking(bruker, id);
      return ranking ? ({ fane, ranking } as const) : null;
    }
    case "turneringer": {
      const [iAar, iFjor] = await Promise.all([hentTnSpillerProfil(bruker, id, aar), hentTnSpillerProfil(bruker, id, aar - 1)]);
      return iAar ? ({ fane, aar, iAar, iFjor } as const) : null;
    }
    case "trening": {
      const [data, planer] = await Promise.all([hentTnSpillerTrening(bruker, id, naa), hentTnSpillerAktivePlaner(bruker, id)]);
      return data ? ({ fane, data, planer: planer ?? [], naa } as const) : null;
    }
    case "tester": {
      const tester = await hentTnSpillerTester(bruker, id);
      return tester ? ({ fane, rader: tester.rader } as const) : null;
    }
    case "teknisk-plan": {
      const planer = await medTnSpillerData(bruker, id, (tx) => hentTnTekniskPlaner(tx, id));
      return planer ? ({ fane, planer } as const) : null;
    }
    case "fireukerssjekk": {
      const [grunnlag, iup] = await Promise.all([
        medTnSpillerData(bruker, id, (tx) => hentTnEvalueringGrunnlag(tx, id)),
        hentTnSpillerIup(bruker, id),
      ]);
      return grunnlag ? ({ fane, grunnlag, iup: iup ?? [] } as const) : null;
    }
  }
}

export type TnInnsyn = NonNullable<Awaited<ReturnType<typeof hentTnInnsyn>>>;
