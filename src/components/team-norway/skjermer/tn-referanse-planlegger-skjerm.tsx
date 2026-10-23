import Link from "next/link";
import { notFound } from "next/navigation";

import { innloggetKanSeDataGolf } from "@/lib/auth/datagolf-tilgang";
import { hentTnArbeidskontekst } from "@/lib/domain/tn-arbeidsflate";
import { prisma } from "@/lib/prisma";
import { SESONG, byggReferansePlanvisning } from "@/lib/turneringsplan/data";
import { referanseEventIder } from "@/lib/turneringsplan/referanse-regler";
import { Turneringsplanlegger } from "@/components/turneringsplan/Turneringsplanlegger";
import { TN } from "@/lib/v2/team-norway";
import { TnFlate, TnFlatehode, TnFotnote, TnListerad, TnMangler } from "../tn-flate";
import { TnReferanseFaner } from "../tn-referanse-faner";
import { TnShell, tnRolleNavn } from "../tn-shell";
import { TnSkraKort, TnSkraTopp } from "../tn-skra-topp";
import { hentSkjermbruker } from "./felles";

/**
 * Referanse › Planlegger: turneringsplan 2027 for de norske herrene i WAGR-referansen, delt mellom trenerne.
 * Spillerne har ikke HQ-konto (planen for spillere med konto ligger i IUP › Turneringsplan). Trenerne endrer
 * direkte, og raden er den samme som teamnorwayref leser (`wagr_reference_plans`).
 */

async function trenerkontekst() {
  const bruker = await hentSkjermbruker();
  const kontekst = await hentTnArbeidskontekst(bruker);
  if (!kontekst || kontekst.erSpiller) notFound();
  return { bruker, kontekst, visDataGolf: await innloggetKanSeDataGolf() };
}

const heltall = new Intl.NumberFormat("nb-NO");
const KILDE = "World Amateur Golf Ranking (WAGR), The R&A";

export async function TnReferansePlanleggerListeSkjerm() {
  const { bruker, kontekst, visDataGolf } = await trenerkontekst();
  const [medlemmer, planer] = await Promise.all([
    prisma.wagrRefGroupMember.findMany({
      where: { groupId: "norge" }, orderBy: { sortOrder: "asc" },
      select: { player: { select: { wagrPlayerId: true, name: true, rank: true, wagrDate: true } } },
    }),
    prisma.wagrReferencePlan.findMany({ where: { season: SESONG }, select: { wagrPlayerId: true, events: true } }),
  ]);
  const antall = new Map(planer.map((p) => [p.wagrPlayerId, referanseEventIder(p.events).length]));
  const spillere = medlemmer.map((m) => m.player).sort((a, b) => (a.rank ?? 1e9) - (b.rank ?? 1e9));
  const dato = spillere.reduce<Date | null>((d, s) => (!d || s.wagrDate > d ? s.wagrDate : d), null);
  return (
    <TnShell aktiv="referanse-planlegger" brukerNavn={bruker.name ?? "Ukjent"} rolle={tnRolleNavn(kontekst.rolle)} groupId={kontekst.gruppe.id} visTrenerflater kanAdministrere={kontekst.kanAdministrere} visDataGolf={visDataGolf}>
      <TnSkraTopp
        bilde="putting-green" etikett="Planlegger" overlinje={`Referanse · turneringsplan ${SESONG}`} tittel="Planlegger"
        ingress="Velg en spiller og planlegg sesongen. Planen er delt mellom trenerne i Team Norway."
      />
      <TnSkraKort>
        <TnFlate><TnReferanseFaner aktiv="planlegger" /></TnFlate>
        <TnFlate>
          <TnFlatehode tittel="Norske herrer" merknad={`${spillere.length} spillere`} />
          {spillere.length === 0 ? <TnMangler>Ingen spillere i referansen ennå.</TnMangler> : null}
          {spillere.map((s) => (
            <TnListerad
              key={s.wagrPlayerId}
              tittel={<Link href={`/team-norway/referanse/planlegger/${s.wagrPlayerId}`} style={{ color: TN.navy900, minHeight: 44, display: "inline-flex", alignItems: "center" }}>{s.name}</Link>}
              tekst={s.rank != null ? `WAGR-plass ${heltall.format(s.rank)}` : "Uten WAGR-plass"}
              hoyre={<span style={{ fontFamily: TN.font.mono, fontSize: 14, color: TN.navy900 }}>{antall.get(s.wagrPlayerId) ?? 0} turneringer</span>}
            />
          ))}
          <TnFotnote>Kilde: {KILDE}{dato ? `, rankinguke ${new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Oslo" }).format(dato)}` : ""}.</TnFotnote>
        </TnFlate>
      </TnSkraKort>
    </TnShell>
  );
}

export async function TnReferansePlanleggerSkjerm({ wagrPlayerId }: { wagrPlayerId: string }) {
  const id = /^\d{1,9}$/.test(wagrPlayerId) ? Number(wagrPlayerId) : null;
  if (id === null) notFound();
  const { bruker, kontekst, visDataGolf } = await trenerkontekst();
  const visning = await prisma.$transaction((tx) => byggReferansePlanvisning(tx, id), { timeout: 30_000 });
  if (!visning) notFound();
  return (
    <TnShell aktiv="referanse-planlegger" brukerNavn={bruker.name ?? "Ukjent"} rolle={tnRolleNavn(kontekst.rolle)} groupId={kontekst.gruppe.id} visTrenerflater kanAdministrere={kontekst.kanAdministrere} visDataGolf={visDataGolf} tilbake={{ href: "/team-norway/referanse/planlegger", label: "Planlegger" }}>
      <Turneringsplanlegger visning={visning} rolle="referanse" bilde="/team-norway/bilder/putting-green.jpg" />
    </TnShell>
  );
}
