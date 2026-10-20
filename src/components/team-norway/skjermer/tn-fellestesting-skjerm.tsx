import { notFound } from "next/navigation";

import { innloggetKanSeDataGolf } from "@/lib/auth/datagolf-tilgang";
import { hentTnFellesTestdagGrupper, hentTnGruppeanalyseResultat, hentTnProtokollbibliotek, hentTnSpillere, hentTnTestdag, hentTnTestdager, type TnGruppeanalyseRad } from "@/lib/domain/tn-arbeidsflate";
import { TESTBATTERI } from "@/lib/portal-tester/testbatteri";
import { TN_CATALOG } from "@/lib/portal-tester/tn-catalog";
import { trenerKanFore } from "@/lib/portal-tester/testbatteri";
import { hentSkjermbruker } from "./felles";
import { TnFellestestingVisning, TnTestdagVisning } from "./tn-fellestesting-visning";
import type { TnTestoversiktRad } from "./tn-testoversikt";

/** TN-03 Fellestesting og én testdag. Visningen ligger i tn-fellestesting-visning.tsx. */
export async function TnFellestestingSkjerm({ dagId }: { dagId?: string }) {
  const bruker = await hentSkjermbruker();
  const spillerside = await hentTnSpillere(bruker);
  if (!spillerside || spillerside.kontekst.erSpiller) notFound();
  const visDataGolf = await innloggetKanSeDataGolf();

  if (dagId) {
    const valgt = await hentTnTestdag(bruker, dagId);
    if (!valgt) notFound();
    return <TnTestdagVisning brukerNavn={bruker.name} visDataGolf={visDataGolf} valgt={valgt} />;
  }

  const testoversikt = await hentTestoversikt(bruker, spillerside);
  const [testdager, fellesgrupper] = await Promise.all([hentTnTestdager(bruker), hentTnFellesTestdagGrupper(bruker)]);
  // Testdag gjelder bare tester treneren fører: Teknikk og PEI (Anders 20.10.2026). Resten fører spilleren selv i PlayerHQ.
  const protokoller = TN_CATALOG.filter((p) => !p.blocked && !p.variableCount && trenerKanFore({ protokollId: p.id })).map((p) => ({ id: p.id, navn: p.name }));
  return (
    <TnFellestestingVisning
      brukerNavn={bruker.name}
      visDataGolf={visDataGolf}
      spillerside={spillerside}
      testdager={testdager}
      fellesgrupper={fellesgrupper}
      protokoller={protokoller}
      protokollbibliotek={hentTnProtokollbibliotek()}
      testoversikt={testoversikt}
    />
  );
}

type Bruker = Awaited<ReturnType<typeof hentSkjermbruker>>;
type Spillerside = NonNullable<Awaited<ReturnType<typeof hentTnSpillere>>>;

/**
 * T1 Testoversikt: per test i batteriet, beste gyldige resultat per spiller (samme regel som Analyse,
 * hentTnGruppeanalyseResultat) slått sammen over variantene. Skoler med færre enn tre spillere
 * samles i «Andre skoler», så ingen mindreårig kan pekes ut av skolen alene.
 */
async function hentTestoversikt(bruker: Bruker, spillerside: Spillerside) {
  const skoleFor = new Map(spillerside.rader.map((r) => [r.id, r.skole?.trim() || "Skole ikke registrert"]));
  const perSkoleAntall = new Map<string, number>();
  for (const skole of skoleFor.values()) perSkoleAntall.set(skole, (perSkoleAntall.get(skole) ?? 0) + 1);
  const visningsskole = (skole: string) => ((perSkoleAntall.get(skole) ?? 0) >= 3 ? skole : "Andre skoler");
  const skoler = [...new Set([...skoleFor.values()].map(visningsskole))].sort((a, b) => (a === "Andre skoler" ? 1 : b === "Andre skoler" ? -1 : a.localeCompare(b, "nb")));
  const spillerePerSkole = new Map<string, number>();
  for (const skole of skoleFor.values()) spillerePerSkole.set(visningsskole(skole), (spillerePerSkole.get(visningsskole(skole)) ?? 0) + 1);

  const rader: TnTestoversiktRad[] = await Promise.all(TESTBATTERI.map(async (test) => {
    const resultater = await Promise.all(test.protokoller.map((protokollId) => hentTnGruppeanalyseResultat(bruker, { protokollId })));
    const lavereErBedre = resultater.find((r) => r)?.lowerIsBetter ?? true;
    const beste = new Map<string, TnGruppeanalyseRad & { score: number }>();
    for (const rad of resultater.flatMap((r) => r?.rader ?? [])) {
      if (rad.score === null) continue;
      const forrige = beste.get(rad.spillerId);
      if (!forrige || (lavereErBedre ? rad.score < forrige.score : rad.score > forrige.score)) beste.set(rad.spillerId, rad as TnGruppeanalyseRad & { score: number });
    }
    const sortert = [...beste.values()].sort((a, b) => (lavereErBedre ? a.score - b.score : b.score - a.score));
    const medPerSkole = new Map<string, number>();
    for (const id of beste.keys()) {
      const skole = visningsskole(skoleFor.get(id) ?? "Skole ikke registrert");
      medPerSkole.set(skole, (medPerSkole.get(skole) ?? 0) + 1);
    }
    const perSkole = Object.fromEntries(skoler.map((skole) => {
      const med = medPerSkole.get(skole) ?? 0;
      const alle = spillerePerSkole.get(skole) ?? 0;
      return [skole, med === 0 ? "ingen" : med >= alle ? "alle" : "noen"] as const;
    }));
    return { test, protokollId: test.protokoller[0] ?? null, medResultat: beste.size, median: sortert.length ? sortert[Math.floor((sortert.length - 1) / 2)]!.formatert : null, perSkole };
  }));
  return { rader, skoler, spillere: spillerside.rader.length };
}
