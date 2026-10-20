import { notFound } from "next/navigation";

import { innloggetKanSeDataGolf } from "@/lib/auth/datagolf-tilgang";
import { hentTnFellesTestdagGrupper, hentTnProtokollbibliotek, hentTnSpillere, hentTnTestdag, hentTnTestdager } from "@/lib/domain/tn-arbeidsflate";
import { TN_CATALOG } from "@/lib/portal-tester/tn-catalog";
import { trenerKanFore } from "@/lib/portal-tester/testbatteri";
import { hentSkjermbruker } from "./felles";
import { TnFellestestingVisning, TnTestdagVisning } from "./tn-fellestesting-visning";

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
    />
  );
}
