// Beskrivende treningsobservasjon for ansvarlig trener i en uttrykkelig delt AK-gruppe.
import { z } from "zod";
import { hentAkGruppeoppdrag, medAkGruppeoppdrag } from "@/lib/deling/ak-gruppeoppdrag";
import { AK_PROFIL_SCOPE, AK_PROFIL_VERSJON } from "@/lib/deling/ak-profil-regler";
import { SG_ANALYSE_SELECT } from "@/lib/ai-plan/analyse-grunnlag";
import { hentTreningsVolum } from "@/lib/training/volum";
import { runAgent, type AgentResult } from "./agent-runner";
import { byggProvenance } from "./provenance";
import { vurderTreningsgap, TRENINGS_GAP_TERSKEL } from "@/lib/ai-plan/treningsgap-grunnlag";

export const AGENT_NAME = "training-gap";
const gammelObservasjon = z.object({ svakestOmraade: z.string(), analyseVersjon: z.string() });

export async function runTrainingGap(): Promise<AgentResult> {
  return runAgent(AGENT_NAME, null, async () => {
    let varsler = 0, feilet = 0;
    // Ruting inneholder kun gruppe-/trener-ID. Profiler leses først under fersk deling.
    const oppdrag = await hentAkGruppeoppdrag();
    for (const jobb of oppdrag) {
      try {
        const skrevet = await medAkGruppeoppdrag(jobb, async (tx, scope) => {
          const naa = new Date();
          const fra = new Date(naa.getTime() - 8*7*86_400_000);
          const spillere = await tx.user.findMany({ where: scope, select: { id: true } });
          let antall = 0;
          for (const spiller of spillere) {
            const runder = await tx.round.findMany({ where: { userId: spiller.id,
              playedAt: { gte: fra, lte: naa }, playStatus: "COMPLETED", partialSave: false,
            }, select: SG_ANALYSE_SELECT, orderBy: [{ playedAt: "desc" }, { id: "desc" }] });
            const volum = await hentTreningsVolum(spiller.id, 4, naa, tx);
            const observasjon = vurderTreningsgap(runder, volum);
            if (!observasjon) continue;
            const eksisterende = await tx.planAction.findMany({ where: {
              userId: spiller.id, coachId: jobb.coachId, agentName: AGENT_NAME,
              actionType: "COACH_REVIEW", status: "PENDING",
              suggestion: { path: ["deling", "gruppeId"], equals: jobb.gruppeId },
            }, select: { id: true, suggestion: true } });
            if (eksisterende.some(rad => {
              const lest = gammelObservasjon.safeParse(rad.suggestion);
              return lest.success && lest.data.svakestOmraade === observasjon.svakestOmraade &&
                lest.data.analyseVersjon === observasjon.analyseVersjon;
            })) continue;
            // Kun denne mottakerens nye observasjoner. Gamle, udokumenterte forslag oppgraderes ikke.
            if (eksisterende.length) await tx.planAction.updateMany({ where: {
              id: { in: eksisterende.map(r => r.id) }, status: "PENDING",
            }, data: { status: "SUPERSEDED" } });
            const { rader, ...suggestion } = observasjon;
            await tx.planAction.create({ data: { userId: spiller.id, coachId: jobb.coachId,
              actionType: "COACH_REVIEW", agentName: AGENT_NAME,
              suggestion: { ...suggestion, deling: { gruppeId: jobb.gruppeId,
                scope: AK_PROFIL_SCOPE, tekstVersjon: AK_PROFIL_VERSJON } },
              provenance: byggProvenance({ kilde: "RUNDER", rader,
                regel: "Beskrivende gjennomgang av SG-merkede logger, ikke anbefalt treningsfordeling",
                terskel: TRENINGS_GAP_TERSKEL, maaltVerdi: observasjon.andelTrening,
                tidsvindu: { fra, til: naa } }),
            } });
            antall++;
          }
          return antall;
        });
        varsler += skrevet ?? 0;
      } catch {
        // En gruppefeil ruller tilbake gruppens forslag. Ingen rå persondata i AgentRun.
        feilet++;
      }
    }
    return { planActionsWritten: varsler, output: { planActionsWritten: varsler, feiledeGrupper: feilet } };
  });
}
