import { medTnSpillerData } from "@/lib/domain/tn-arbeidsflate";
import { notFound, redirect } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentTnWorkbenchKontekst } from "@/lib/domain/tn-workbench";
import {
  hentTnTekniskPlanDetalj,
  tnLoggRep,
  tnOpprettOppgave,
  tnOppdaterOppgave,
  tnSlettOppgave,
  TN_AUDIT_ACTION_LABEL,
  krevFullForEgenTekniskPlan,
} from "@/lib/domain/tn-teknisk-plan";
import { P_POSITIONS } from "@/components/teknisk-plan/constants";
import { PYRAMIDER, TnTekniskPlanVisning } from "@/components/team-norway/skjermer/tn-teknisk-plan-visning";

export const dynamic = "force-dynamic";

function href(spillerId: string, planId: string, feil?: string) {
  return `/team-norway/spiller/${spillerId}/teknisk-plan/${planId}${feil ? `?feil=${encodeURIComponent(feil)}` : ""}`;
}

function parseKoller(raw: string): string[] {
  return raw.split(",").map((k) => k.trim()).filter(Boolean);
}

/**
 * TN-23 Teknisk plan — plandetalj for én TN-spiller, i retning «Skrå» (godkjent av Anders 20.10.2026,
 * canvaset «Team Norway nøkkelskjermer», tavle C2): bildetopp med planen som tittel og oppgaver ferdig
 * som hovedtall. Den tredje rep-telleren heter Automatikk (masteren), ikke «Full fart».
 *
 * Alle mutasjoner (`tnLoggRep`/`tnOpprettOppgave`/`tnOppdaterOppgave`/
 * `tnSlettOppgave` i `src/lib/domain/tn-teknisk-plan.ts`) gjør FULL
 * validering inne i selve actionen — TN-rolle COACH, roster, personlig
 * coach-tilgang, OG at oppgaven/planen faktisk tilhører valgt spiller — ikke
 * bare en side-vakt før skjemaet vises. Se sikkerhetsmerknaden der.
 */
export default async function TeamNorwaySpillerTekniskPlanDetaljPage({
  params,
  searchParams,
}: {
  params: Promise<{ spillerId: string; planId: string }>;
  searchParams: Promise<{ feil?: string }>;
}) {
  const { spillerId, planId } = await params;
  const { feil } = await searchParams;
  const bruker = await requirePortalUser({ tillatDemo: true, kreverTilgang: "INGEN" });
  const kontekst = await hentTnWorkbenchKontekst(bruker);
  if (!kontekst) notFound();
  if (bruker.role === "PLAYER" && bruker.id !== spillerId) notFound();

  // Roster-porten: samme sjekk som oversikten — en direkte URL skal ikke
  // kunne vise en ikke-TN-spillers plan selv med gyldig personlig coachtilgang.
  const spillerNavn = kontekst.spillere.find((s) => s.id === spillerId)?.navn ?? (bruker.id === spillerId ? bruker.name : null);
  if (!spillerNavn) notFound();
  krevFullForEgenTekniskPlan(bruker, spillerId);

  const plan = await medTnSpillerData(bruker, spillerId, (tx) => hentTnTekniskPlanDetalj(tx, spillerId, planId));
  if (!plan) notFound();

  async function loggRep(form: FormData) {
    "use server";
    const ferskBruker = await requirePortalUser({ tillatDemo: true, kreverTilgang: "INGEN" });
    const ferskKontekst = await hentTnWorkbenchKontekst(ferskBruker);
    if (!ferskKontekst) return;
    const taskId = String(form.get("taskId") ?? "");
    const felt = String(form.get("felt") ?? "");
    const antall = Number(form.get("antall") ?? 0);
    if (!taskId || !["dry", "lav", "full"].includes(felt)) return;
    const svar = await tnLoggRep(ferskBruker, ferskKontekst, spillerId, planId, taskId, felt as "dry" | "lav" | "full", antall);
    redirect(href(spillerId, planId, svar.ok ? undefined : svar.feil));
  }

  async function opprettOppgave(form: FormData) {
    "use server";
    const ferskBruker = await requirePortalUser({ tillatDemo: true, kreverTilgang: "INGEN" });
    const ferskKontekst = await hentTnWorkbenchKontekst(ferskBruker);
    if (!ferskKontekst) return;
    const pNummer = String(form.get("pNummer") ?? "");
    const posisjon = P_POSITIONS.find((p) => p.num === pNummer);
    if (!posisjon) { redirect(href(spillerId, planId, "Ukjent P-posisjon.")); return; }
    const svar = await tnOpprettOppgave(ferskBruker, ferskKontekst, spillerId, {
      planId,
      pNummer: posisjon.num,
      pName: posisjon.name,
      tittel: String(form.get("tittel") ?? ""),
      beskrivelse: String(form.get("beskrivelse") ?? "") || undefined,
      pyramide: String(form.get("pyramide") ?? "TEK") as (typeof PYRAMIDER)[number],
      omraade: String(form.get("omraade") ?? ""),
      koller: parseKoller(String(form.get("koller") ?? "")),
      repsMaalDry: Number(form.get("repsMaalDry") ?? 0),
      repsMaalLav: Number(form.get("repsMaalLav") ?? 0),
      repsMaalFull: Number(form.get("repsMaalFull") ?? 0),
    });
    redirect(href(spillerId, planId, svar.ok ? undefined : svar.feil));
  }

  async function oppdaterOppgave(form: FormData) {
    "use server";
    const ferskBruker = await requirePortalUser({ tillatDemo: true, kreverTilgang: "INGEN" });
    const ferskKontekst = await hentTnWorkbenchKontekst(ferskBruker);
    if (!ferskKontekst) return;
    const taskId = String(form.get("taskId") ?? "");
    if (!taskId) return;
    const svar = await tnOppdaterOppgave(ferskBruker, ferskKontekst, spillerId, planId, taskId, {
      tittel: String(form.get("tittel") ?? ""),
      beskrivelse: String(form.get("beskrivelse") ?? "") || undefined,
      pyramide: String(form.get("pyramide") ?? "TEK") as (typeof PYRAMIDER)[number],
      omraade: String(form.get("omraade") ?? ""),
      koller: parseKoller(String(form.get("koller") ?? "")),
      repsMaalDry: Number(form.get("repsMaalDry") ?? 0),
      repsMaalLav: Number(form.get("repsMaalLav") ?? 0),
      repsMaalFull: Number(form.get("repsMaalFull") ?? 0),
    });
    redirect(href(spillerId, planId, svar.ok ? undefined : svar.feil));
  }

  async function slettOppgave(form: FormData) {
    "use server";
    const ferskBruker = await requirePortalUser({ tillatDemo: true, kreverTilgang: "INGEN" });
    const ferskKontekst = await hentTnWorkbenchKontekst(ferskBruker);
    if (!ferskKontekst) return;
    const taskId = String(form.get("taskId") ?? "");
    const bekreft = String(form.get("bekreft") ?? "");
    if (!taskId) return;
    const svar = await tnSlettOppgave(ferskBruker, ferskKontekst, spillerId, planId, taskId, bekreft);
    redirect(href(spillerId, planId, svar.ok ? undefined : svar.feil));
  }

  const siste = plan.siste.map((a) => ({ tid: a.createdAt.toISOString().slice(0, 16).replace("T", " "), hvem: a.actorNavn, hva: TN_AUDIT_ACTION_LABEL[a.action] ?? a.action }));
  return (
    <TnTekniskPlanVisning
      brukerNavn={bruker.name ?? "Ukjent"}
      kontekst={{ erSpiller: kontekst.erSpiller, erTrener: kontekst.erTrener, kanAdministrere: kontekst.kanAdministrere, gruppeId: kontekst.gruppeId }}
      spillerId={spillerId}
      spillerNavn={spillerNavn}
      plan={plan}
      siste={siste}
      feil={feil}
      handlinger={{ loggRep, opprettOppgave, oppdaterOppgave, slettOppgave }}
    />
  );
}
