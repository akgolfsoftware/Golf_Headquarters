import { notFound, redirect } from "next/navigation";
import Link from "next/link";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentTnWorkbenchKontekst } from "@/lib/domain/tn-workbench";
import {
  harTnTekniskPlanLesetilgang,
  hentTnTekniskPlanDetalj,
  tnLoggRep,
  tnOpprettOppgave,
  tnOppdaterOppgave,
  tnSlettOppgave,
  TN_AUDIT_ACTION_LABEL,
  krevFullForEgenTekniskPlan,
} from "@/lib/domain/tn-teknisk-plan";
import { P_POSITIONS } from "@/components/teknisk-plan/constants";
import { TN } from "@/lib/v2/team-norway";
import { TnShell, TnSidehode, TnSeksjon, TnSpillerFaner } from "@/components/team-norway/tn-shell";
import { TnKort, TnPille, TnKnapp } from "@/components/team-norway/core";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, "green" | "amber" | "nøytral" | "navy"> = {
  DONE: "green",
  ACTIVE: "navy",
  PENDING: "nøytral",
  ARCHIVED: "nøytral",
};
const TASK_STATUS_LABEL: Record<string, string> = { PENDING: "Ikke startet", ACTIVE: "Aktiv", DONE: "Ferdig", ARCHIVED: "Arkivert" };
const TRACK_STATUS_LABEL: Record<string, string> = {
  PAA_VEI: "På vei",
  STAGNERER: "Stagnerer",
  FERDIG: "Ferdig",
  INAKTIV: "Inaktiv",
  AVSLAATT: "Avslått",
};
const PYRAMIDER = ["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const;

function href(spillerId: string, planId: string, feil?: string) {
  return `/team-norway/spiller/${spillerId}/teknisk-plan/${planId}${feil ? `?feil=${encodeURIComponent(feil)}` : ""}`;
}

function parseKoller(raw: string): string[] {
  return raw.split(",").map((k) => k.trim()).filter(Boolean);
}

/**
 * TN-23 Teknisk plan — plandetalj for én TN-spiller.
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
  const bruker = await requirePortalUser({ kreverTilgang: "INGEN" });
  const kontekst = await hentTnWorkbenchKontekst(bruker);
  if (!kontekst) notFound();
  if (bruker.role === "PLAYER" && bruker.id !== spillerId) notFound();

  // Roster-porten: samme sjekk som oversikten — en direkte URL skal ikke
  // kunne vise en ikke-TN-spillers plan selv med gyldig personlig coachtilgang.
  const spillerNavn = kontekst.spillere.find((s) => s.id === spillerId)?.navn ?? (bruker.id === spillerId ? bruker.name : null);
  if (!spillerNavn) notFound();
  krevFullForEgenTekniskPlan(bruker, spillerId);

  const harTilgang = await harTnTekniskPlanLesetilgang(bruker, kontekst, spillerId);
  if (!harTilgang) notFound();

  const plan = await hentTnTekniskPlanDetalj(spillerId, planId);
  if (!plan) notFound();

  async function loggRep(form: FormData) {
    "use server";
    const ferskBruker = await requirePortalUser({ kreverTilgang: "INGEN" });
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
    const ferskBruker = await requirePortalUser({ kreverTilgang: "INGEN" });
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
    const ferskBruker = await requirePortalUser({ kreverTilgang: "INGEN" });
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
    const ferskBruker = await requirePortalUser({ kreverTilgang: "INGEN" });
    const ferskKontekst = await hentTnWorkbenchKontekst(ferskBruker);
    if (!ferskKontekst) return;
    const taskId = String(form.get("taskId") ?? "");
    const bekreft = String(form.get("bekreft") ?? "");
    if (!taskId) return;
    const svar = await tnSlettOppgave(ferskBruker, ferskKontekst, spillerId, planId, taskId, bekreft);
    redirect(href(spillerId, planId, svar.ok ? undefined : svar.feil));
  }

  return (
    <TnShell
      aktiv="spillere"
      brukerNavn={bruker.name ?? "Ukjent"}
      rolle={kontekst.erSpiller ? "Spiller" : "Trener"}
      groupId={kontekst.gruppeId}
      visTrenerflater={kontekst.erTrener}
      kanAdministrere={kontekst.kanAdministrere}
    >
      <TnSpillerFaner spillerId={spillerId} spillerNavn={spillerNavn} aktiv="teknisk-plan" kanAdministrere={!kontekst.erSpiller} />
      <Link href={`/team-norway/spiller/${spillerId}/teknisk-plan`} style={{ color: TN.navy700, fontSize: TN.text.sm, fontWeight: TN.weight.semibold }}>← Alle planer</Link>
      <TnSidehode overlinje="TN-23 · Teknisk plan" tittel={plan.navn} ingress={`${plan.startDato.toISOString().slice(0, 10)}${plan.sluttDato ? ` – ${plan.sluttDato.toISOString().slice(0, 10)}` : ""}`} />

      {feil && (
        <p role="alert" style={{ margin: 0, padding: 12, borderRadius: TN.radius.sm, background: TN.status.redBg, color: TN.status.redText, fontSize: TN.text.sm }}>{feil}</p>
      )}

      {plan.posisjoner.length === 0 ? (
        <TnKort><p style={{ margin: 0, color: TN.textSecondary }}>Ingen P-posisjoner lagt til i denne planen ennå.</p></TnKort>
      ) : (
        plan.posisjoner.map((pos) => (
          <TnSeksjon key={pos.id} tittel={`${pos.pNummer} · ${pos.navn}`}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {pos.oppgaver.length === 0 ? (
                <TnKort><p style={{ margin: 0, color: TN.textSecondary, fontSize: TN.text.sm }}>Ingen oppgaver under denne posisjonen.</p></TnKort>
              ) : pos.oppgaver.map((t) => (
                <TnKort key={t.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <p style={{ margin: 0, fontWeight: TN.weight.semibold }}>{t.tittel}</p>
                        <TnPille tone={STATUS_TONE[t.status] ?? "nøytral"}>{TASK_STATUS_LABEL[t.status] ?? t.status}</TnPille>
                        <TnPille tone="nøytral">{TRACK_STATUS_LABEL[t.trackStatus] ?? t.trackStatus}</TnPille>
                      </div>
                      <p style={{ margin: "4px 0 0", color: TN.textSecondary, fontSize: TN.text.sm }}>{t.pyramide} · {t.omraade}</p>
                      {t.beskrivelse && <p style={{ margin: "6px 0 0", fontSize: TN.text.sm }}>{t.beskrivelse}</p>}
                      <p style={{ margin: "8px 0 0", fontFamily: TN.font.mono, fontSize: TN.text.xs, color: TN.textSecondary }}>
                        Uten ball {t.repsGjortDry}/{t.repsMaalDry} · Lav hastighet {t.repsGjortLav}/{t.repsMaalLav} · Full fart {t.repsGjortFull}/{t.repsMaalFull}
                        {t.lastRepLoggedAt ? ` · sist logget ${t.lastRepLoggedAt.toISOString().slice(0, 10)}` : ""}
                      </p>
                    </div>
                    {kontekst.kanAdministrere && (
                      <form action={loggRep} style={{ display: "flex", gap: 6, alignItems: "flex-end", flexWrap: "wrap" }}>
                        <input type="hidden" name="taskId" value={t.id} />
                        <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: TN.text.xs, color: TN.textSecondary }}>
                          Hastighet
                          <select name="felt" style={{ minHeight: 36, borderRadius: TN.radius.sm, border: `1px solid ${TN.borderDefault}` }}>
                            <option value="dry">Uten ball</option>
                            <option value="lav">Lav hastighet</option>
                            <option value="full">Full fart</option>
                          </select>
                        </label>
                        <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: TN.text.xs, color: TN.textSecondary }}>
                          Reps
                          <input type="number" name="antall" min={1} defaultValue={10} style={{ width: 70, minHeight: 36, borderRadius: TN.radius.sm, border: `1px solid ${TN.borderDefault}`, padding: "0 8px" }} />
                        </label>
                        <TnKnapp type="submit" variant="sekundaer" size="sm">Logg</TnKnapp>
                      </form>
                    )}
                  </div>

                  {kontekst.kanAdministrere && (
                    <details style={{ marginTop: 12 }}>
                      <summary style={{ cursor: "pointer", fontSize: TN.text.xs, color: TN.textSecondary, fontWeight: TN.weight.semibold }}>Rediger oppgave</summary>
                      <form action={oppdaterOppgave} style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                        <input type="hidden" name="taskId" value={t.id} />
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 8 }}>
                          <label style={feltLabelStil}>Pyramide
                            <select name="pyramide" defaultValue={t.pyramide} style={feltInputStil}>
                              {PYRAMIDER.map((p) => <option key={p} value={p}>{p}</option>)}
                            </select>
                          </label>
                          <label style={feltLabelStil}>Område<input type="text" name="omraade" defaultValue={t.omraade} required style={feltInputStil} /></label>
                          <label style={feltLabelStil}>Køller (kommaseparert)<input type="text" name="koller" defaultValue={t.koller.join(", ")} style={feltInputStil} /></label>
                        </div>
                        <label style={feltLabelStil}>Tittel<input type="text" name="tittel" defaultValue={t.tittel} required style={feltInputStil} /></label>
                        <label style={feltLabelStil}>Beskrivelse<textarea name="beskrivelse" defaultValue={t.beskrivelse ?? ""} style={{ ...feltInputStil, minHeight: 60 }} /></label>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                          <label style={feltLabelStil}>Mål uten ball<input type="number" name="repsMaalDry" min={0} defaultValue={t.repsMaalDry} style={feltInputStil} /></label>
                          <label style={feltLabelStil}>Mål lav hastighet<input type="number" name="repsMaalLav" min={0} defaultValue={t.repsMaalLav} style={feltInputStil} /></label>
                          <label style={feltLabelStil}>Mål full fart<input type="number" name="repsMaalFull" min={0} defaultValue={t.repsMaalFull} style={feltInputStil} /></label>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}><TnKnapp type="submit" variant="sekundaer" size="sm">Lagre endringer</TnKnapp></div>
                      </form>
                      <form action={slettOppgave} style={{ display: "flex", gap: 6, alignItems: "flex-end", marginTop: 10 }}>
                        <input type="hidden" name="taskId" value={t.id} />
                        <label style={feltLabelStil}>Skriv SLETT for å bekrefte<input type="text" name="bekreft" style={feltInputStil} /></label>
                        <TnKnapp type="submit" variant="tekst" size="sm">Slett oppgave</TnKnapp>
                      </form>
                    </details>
                  )}
                </TnKort>
              ))}
            </div>
          </TnSeksjon>
        ))
      )}

      {kontekst.kanAdministrere && (
        <TnSeksjon tittel="Ny oppgave">
          <TnKort>
            <form action={opprettOppgave} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10 }}>
                <label style={feltLabelStil}>P-posisjon
                  <select name="pNummer" required style={feltInputStil}>
                    {P_POSITIONS.map((p) => <option key={p.num} value={p.num}>{p.num} · {p.name}</option>)}
                  </select>
                </label>
                <label style={feltLabelStil}>Pyramide
                  <select name="pyramide" style={feltInputStil}>
                    {PYRAMIDER.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </label>
                <label style={feltLabelStil}>Område<input type="text" name="omraade" required style={feltInputStil} /></label>
                <label style={feltLabelStil}>Køller (kommaseparert)<input type="text" name="koller" placeholder="7-jern, Driver" style={feltInputStil} /></label>
              </div>
              <label style={feltLabelStil}>Tittel<input type="text" name="tittel" required style={feltInputStil} /></label>
              <label style={feltLabelStil}>Beskrivelse<textarea name="beskrivelse" style={{ ...feltInputStil, minHeight: 60 }} /></label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                <label style={feltLabelStil}>Mål uten ball<input type="number" name="repsMaalDry" min={0} defaultValue={0} style={feltInputStil} /></label>
                <label style={feltLabelStil}>Mål lav hastighet<input type="number" name="repsMaalLav" min={0} defaultValue={0} style={feltInputStil} /></label>
                <label style={feltLabelStil}>Mål full fart<input type="number" name="repsMaalFull" min={0} defaultValue={0} style={feltInputStil} /></label>
              </div>
              <div><TnKnapp type="submit" variant="primaer">Legg til oppgave</TnKnapp></div>
            </form>
          </TnKort>
        </TnSeksjon>
      )}

      {plan.siste.length > 0 && (
        <TnSeksjon tittel="Siste hendelser">
          {plan.siste.map((a, i) => (
            <p key={i} style={{ margin: 0, fontSize: TN.text.sm, color: TN.textSecondary }}>
              {a.createdAt.toISOString().slice(0, 16).replace("T", " ")} · {a.actorNavn} · {TN_AUDIT_ACTION_LABEL[a.action] ?? a.action}
            </p>
          ))}
        </TnSeksjon>
      )}
    </TnShell>
  );
}

const feltLabelStil = { display: "flex", flexDirection: "column" as const, gap: 4, fontSize: TN.text.xs, color: TN.textSecondary };
const feltInputStil = { minHeight: 40, padding: "6px 10px", border: `1px solid ${TN.borderDefault}`, borderRadius: TN.radius.sm, fontSize: TN.text.sm, background: TN.white, color: TN.navy900 };
