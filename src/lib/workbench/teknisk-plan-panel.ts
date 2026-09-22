import "server-only";

/**
 * Teknisk utvikling i Workbench — henter spillerens tekniske plan som dragbare
 * oppgavekort (Anders 22.09: «planlegge en teknisk økt med spillerens tekniske
 * oppgaver … enkelt dra og slippe inn i økta»).
 *
 * Read-only. Selve innleggingen skjer i Ny økt-arket, som får oppgaven
 * forhåndsutfylt med slag, kølle, lengde, læringssteg og restmål — og koblet
 * til oppgaven via `positionTaskId`, slik at reps logges tilbake automatisk.
 *
 * Typer og filtre ligger i teknisk-plan-panel-typer.ts (klientvennlig).
 */

import { prisma } from "@/lib/prisma";
import { omraadeDef, erOmraadeKode, type OmraadeKode } from "@/lib/domain/ak-formel-v2";
import {
  omraadeVisning,
  omraadeTilKode,
  pNavn,
  hovedP,
  sammenlignPNummer,
} from "@/components/teknisk-plan/constants";
import {
  byggUndertekst,
  type TekniskPanelData,
  type TekniskPanelOppgave,
} from "./teknisk-plan-panel-typer";

/**
 * Spillerens aktive tekniske plan som panel-data. Null når spilleren ikke har
 * en aktiv plan — panelet viser da en ærlig tom tilstand, ikke tomme kort.
 *
 * Tilgang håndheves av kalleren (Workbench-siden eier allerede coach-porten).
 */
export async function hentTekniskPanel(userId: string): Promise<TekniskPanelData | null> {
  const plan = await prisma.technicalPlan.findFirst({
    where: { userId, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      navn: true,
      positions: {
        select: {
          pNummer: true,
          sortOrder: true,
          hovedfokus: true,
          tasks: {
            where: { status: { not: "ARCHIVED" } },
            orderBy: { sortOrder: "asc" },
            select: {
              id: true,
              tittel: true,
              slagNavn: true,
              omraade: true,
              omraadeKode: true,
              koller: true,
              motorikk: true,
              dimensjon: true,
              maaleutstyr: true,
              pyramide: true,
              repsMaalDry: true,
              repsMaalLav: true,
              repsMaalFull: true,
              repsGjortDry: true,
              repsGjortLav: true,
              repsGjortFull: true,
            },
          },
        },
      },
    },
  });
  if (!plan) return null;

  const oppgaver: TekniskPanelOppgave[] = [];
  for (const pos of plan.positions) {
    for (const t of pos.tasks) {
      const kode = t.omraadeKode ?? omraadeTilKode(t.omraade);
      const omraadeLabel = kode ? omraadeVisning(kode) : t.omraade;
      const rest = (maal: number, gjort: number) => Math.max(0, maal - gjort);
      const restUtenBall = rest(t.repsMaalDry, t.repsGjortDry);
      const restLavFart = rest(t.repsMaalLav, t.repsGjortLav);
      const restAuto = rest(t.repsMaalFull, t.repsGjortFull);
      oppgaver.push({
        id: t.id,
        planId: plan.id,
        tittel: t.tittel,
        pNummer: pos.pNummer,
        pNavn: pNavn(pos.pNummer),
        pHoved: hovedP(pos.pNummer),
        hovedfokus: pos.hovedfokus,
        slagNavn: t.slagNavn,
        omraadeKode: kode,
        omraadeLabel,
        koller: t.koller,
        motorikk: t.motorikk,
        dimensjon: t.dimensjon,
        maaleutstyr: t.maaleutstyr,
        pyramide: t.pyramide,
        restUtenBall,
        restLavFart,
        restAuto,
        restTotalt: restUtenBall + restLavFart + restAuto,
        repsEnhet: kode && erOmraadeKode(kode) ? omraadeDef(kode).repsEnhet : null,
        undertekst: byggUndertekst({
          slagNavn: t.slagNavn,
          koller: t.koller,
          omraadeLabel,
          motorikk: t.motorikk,
        }),
      });
    }
  }

  // Hovedfokus først, deretter P-rekkefølge (mellomposisjoner under sin hoved-P),
  // og innen samme P: størst gjenstående arbeid øverst — det coachen bør ta først.
  const posOrder = new Map(plan.positions.map((p) => [p.pNummer, p.sortOrder]));
  oppgaver.sort((a, b) => {
    if (a.hovedfokus !== b.hovedfokus) return a.hovedfokus ? -1 : 1;
    const sa = posOrder.get(a.pHoved) ?? posOrder.get(a.pNummer) ?? 0;
    const sb = posOrder.get(b.pHoved) ?? posOrder.get(b.pNummer) ?? 0;
    if (sa !== sb) return sa - sb;
    const p = sammenlignPNummer(a.pNummer, b.pNummer);
    if (p !== 0) return p;
    return b.restTotalt - a.restTotalt;
  });

  const slag = [...new Set(oppgaver.map((o) => o.slagNavn).filter((s): s is string => !!s))].sort(
    (a, b) => a.localeCompare(b, "nb"),
  );
  const koller = [...new Set(oppgaver.flatMap((o) => o.koller))].sort((a, b) => a.localeCompare(b, "nb"));
  const omraadeKart = new Map<OmraadeKode, string>();
  for (const o of oppgaver) if (o.omraadeKode) omraadeKart.set(o.omraadeKode, o.omraadeLabel);

  return {
    planId: plan.id,
    planNavn: plan.navn,
    oppgaver,
    filtre: {
      slag,
      koller,
      omraader: [...omraadeKart].map(([kode, label]) => ({ kode, label })),
    },
  };
}

