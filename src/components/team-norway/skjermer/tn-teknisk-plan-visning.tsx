import Link from "next/link";

import type { TnTekniskPlanDetalj, TnTekniskPlanRad } from "@/lib/domain/tn-teknisk-plan";
import { P_POSITIONS } from "@/components/teknisk-plan/constants";
import { TN } from "@/lib/v2/team-norway";
import { TnShell, TnSeksjon, TnSpillerFaner } from "../tn-shell";
import { TnFlate } from "../tn-flate";
import { TnSkraKort, TnSkraTopp } from "../tn-skra-topp";
import { TnHeltTall, TnHeltTekst, TnHeltTellere } from "../tn-stall";
import { TnKort, TnPille, TnKnapp } from "../core";

/**
 * TN-23 Teknisk plan for én spiller, én plan, i retning «Skrå» (godkjent av Anders 20.10.2026,
 * canvaset «Team Norway nøkkelskjermer», tavle C2). Ren visning: siden henter data og eier
 * handlingene (full validering skjer i src/lib/domain/tn-teknisk-plan.ts). Den tredje rep-telleren
 * heter Automatikk (masteren), ikke «Full fart». Skjermprøve: tests/visual/team-norway/skjermer/TN-23.tsx.
 */

type Handling = (form: FormData) => void | Promise<void>;
export type TnTekniskPlanKontekst = { erSpiller: boolean; erTrener: boolean; kanAdministrere: boolean; gruppeId: string };

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
export const PYRAMIDER = ["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const;

export function TnTekniskPlanVisning({ brukerNavn, kontekst, spillerId, spillerNavn, plan, siste, feil, handlinger }: {
  brukerNavn: string;
  kontekst: TnTekniskPlanKontekst;
  spillerId: string;
  spillerNavn: string;
  plan: TnTekniskPlanDetalj;
  siste: { tid: string; hvem: string; hva: string }[];
  feil?: string;
  handlinger: { loggRep: Handling; opprettOppgave: Handling; oppdaterOppgave: Handling; slettOppgave: Handling };
}) {
  const oppgaver = plan.posisjoner.flatMap((pos) => pos.oppgaver);
  const ferdige = oppgaver.filter((t) => t.status === "DONE").length;
  const aktive = oppgaver.filter((t) => t.status === "ACTIVE").length;
  const repsGjort = oppgaver.reduce((sum, t) => sum + t.repsGjortDry + t.repsGjortLav + t.repsGjortFull, 0);
  const repsMaal = oppgaver.reduce((sum, t) => sum + t.repsMaalDry + t.repsMaalLav + t.repsMaalFull, 0);
  return (
    <TnShell
      aktiv="spillere"
      brukerNavn={brukerNavn}
      rolle={kontekst.erSpiller ? "Spiller" : "Trener"}
      groupId={kontekst.gruppeId}
      visTrenerflater={kontekst.erTrener}
      kanAdministrere={kontekst.kanAdministrere}
      tilbake={{ href: `/team-norway/spiller/${spillerId}/teknisk-plan`, label: "Teknisk plan" }}
    >
      <TnSkraTopp
        bilde="spiller-ved-vannet"
        etikett={plan.navn}
        overlinje={`IUP · ${spillerNavn} · Teknisk plan`}
        tittel={plan.navn}
        ingress={`${plan.startDato.toISOString().slice(0, 10)}${plan.sluttDato ? ` – ${plan.sluttDato.toISOString().slice(0, 10)}` : ""}. Kvalitetssjekken vises bare; den sperrer aldri neste læringssteg.`}
        venstre={
          <>
            <TnHeltTall verdi={ferdige} enhet={`av ${oppgaver.length}`}>oppgaver ferdig</TnHeltTall>
            <TnHeltTekst>{oppgaver.length ? `${aktive} ${aktive === 1 ? "oppgave er" : "oppgaver er"} i arbeid.` : "Ingen oppgaver lagt inn ennå."}</TnHeltTekst>
          </>
        }
        hoyre={<TnHeltTellere tall={[{ verdi: plan.posisjoner.length, tekst: plan.posisjoner.length === 1 ? "P-posisjon" : "P-posisjoner" }, { verdi: repsGjort, tekst: "reps logget" }, { verdi: repsMaal, tekst: "reps i målet" }]} />}
      />
      <TnSkraKort>
      <TnFlate>
        <TnSpillerFaner spillerId={spillerId} spillerNavn={spillerNavn} aktiv="teknisk-plan" kanAdministrere={!kontekst.erSpiller} kompakt />
      </TnFlate>
      <Link href={`/team-norway/spiller/${spillerId}/teknisk-plan`} style={{ color: TN.navy600, fontSize: 14, fontWeight: 700, minHeight: 44, display: "inline-flex", alignItems: "center", textDecoration: "underline", textUnderlineOffset: 4 }}>Alle planer</Link>

      {feil && (
        <p role="alert" style={{ margin: 0, padding: 12, borderRadius: TN.radius.sm, background: TN.status.redBg, color: TN.status.redText, fontSize: TN.text.sm }}>{feil}</p>
      )}

      {plan.posisjoner.length === 0 ? (
        <TnKort><p style={{ margin: 0, color: TN.ink700 }}>Ingen P-posisjoner lagt til i denne planen ennå.</p></TnKort>
      ) : (
        plan.posisjoner.map((pos) => (
          <TnSeksjon key={pos.id} tittel={`${pos.pNummer} · ${pos.navn}`}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {pos.oppgaver.length === 0 ? (
                <TnKort><p style={{ margin: 0, color: TN.ink700, fontSize: TN.text.sm }}>Ingen oppgaver under denne posisjonen.</p></TnKort>
              ) : pos.oppgaver.map((t) => (
                <TnKort key={t.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{t.tittel}</p>
                        <span style={{ fontFamily: TN.font.mono, fontWeight: 500, fontSize: 13, letterSpacing: "0.06em", color: (TN.akse as Record<string, { fyll: string }>)[t.pyramide]?.fyll ?? TN.ink700 }}>{pos.pNummer}</span>
                        <TnPille tone={STATUS_TONE[t.status] ?? "nøytral"}>{TASK_STATUS_LABEL[t.status] ?? t.status}</TnPille>
                        <TnPille tone="nøytral">{TRACK_STATUS_LABEL[t.trackStatus] ?? t.trackStatus}</TnPille>
                      </div>
                      <p style={{ margin: "4px 0 0", color: TN.ink700, fontSize: TN.text.sm }}>{t.pyramide} · {t.omraade}</p>
                      {t.beskrivelse && <p style={{ margin: "6px 0 0", fontSize: TN.text.sm }}>{t.beskrivelse}</p>}
                      <div aria-hidden="true" style={{ height: 10, background: TN.ink100, marginTop: 10 }}><span style={{ display: "block", height: "100%", width: `${Math.min(100, ((t.repsGjortDry + t.repsGjortLav + t.repsGjortFull) / Math.max(1, t.repsMaalDry + t.repsMaalLav + t.repsMaalFull)) * 100)}%`, background: (TN.akse as Record<string, { fyll: string }>)[t.pyramide]?.fyll ?? TN.navy900 }} /></div>
                      <p style={{ margin: "8px 0 0", fontFamily: TN.font.mono, fontSize: 12.5, color: TN.ink500 }}>
                        Uten ball {t.repsGjortDry}/{t.repsMaalDry} · Lav hastighet {t.repsGjortLav}/{t.repsMaalLav} · Automatikk {t.repsGjortFull}/{t.repsMaalFull}
                        {t.lastRepLoggedAt ? ` · sist logget ${t.lastRepLoggedAt.toISOString().slice(0, 10)}` : ""}
                      </p>
                    </div>
                    {kontekst.kanAdministrere && (
                      <form action={handlinger.loggRep} style={{ display: "flex", gap: 6, alignItems: "flex-end", flexWrap: "wrap" }}>
                        <input type="hidden" name="taskId" value={t.id} />
                        <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: TN.text.xs, color: TN.ink700 }}>
                          Motorikk
                          <select name="felt" style={{ minHeight: 44, borderRadius: TN.radius.sm, border: `1px solid ${TN.ink500}`, background: TN.white, padding: "0 8px" }}>
                            <option value="dry">Uten ball</option>
                            <option value="lav">Lav hastighet</option>
                            <option value="full">Automatikk</option>
                          </select>
                        </label>
                        <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: TN.text.xs, color: TN.ink700 }}>
                          Reps
                          <input type="number" name="antall" min={1} defaultValue={10} style={{ width: 76, minHeight: 44, borderRadius: TN.radius.sm, border: `1px solid ${TN.ink500}`, padding: "0 8px", fontFamily: TN.font.mono }} />
                        </label>
                        <TnKnapp type="submit" variant="sekundaer" size="sm">Logg</TnKnapp>
                      </form>
                    )}
                  </div>

                  {kontekst.kanAdministrere && (
                    <details style={{ marginTop: 12 }}>
                      <summary style={{ cursor: "pointer", fontSize: 14, color: TN.navy600, fontWeight: 700, minHeight: 44, display: "flex", alignItems: "center" }}>Rediger oppgave</summary>
                      <form action={handlinger.oppdaterOppgave} style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
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
                          <label style={feltLabelStil}>Mål automatikk<input type="number" name="repsMaalFull" min={0} defaultValue={t.repsMaalFull} style={feltInputStil} /></label>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}><TnKnapp type="submit" variant="sekundaer" size="sm">Lagre endringer</TnKnapp></div>
                      </form>
                      <form action={handlinger.slettOppgave} style={{ display: "flex", gap: 6, alignItems: "flex-end", marginTop: 10 }}>
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
            <form action={handlinger.opprettOppgave} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
                <label style={feltLabelStil}>Mål automatikk<input type="number" name="repsMaalFull" min={0} defaultValue={0} style={feltInputStil} /></label>
              </div>
              <div><TnKnapp type="submit" variant="primaer">Legg til oppgave</TnKnapp></div>
            </form>
          </TnKort>
        </TnSeksjon>
      )}

      {siste.length > 0 && (
        <TnSeksjon tittel="Siste hendelser">
          {siste.map((a, i) => (
            <p key={i} style={{ margin: 0, fontSize: TN.text.sm, color: TN.ink700 }}>
              {a.tid} · {a.hvem} · {a.hva}
            </p>
          ))}
        </TnSeksjon>
      )}
      </TnSkraKort>
    </TnShell>
  );
}


const feltLabelStil = { display: "flex", flexDirection: "column" as const, gap: 6, fontSize: 14, fontWeight: 700, color: TN.ink900 };
const feltInputStil = { minHeight: 48, padding: "10px 12px", border: `1px solid ${TN.ink500}`, borderRadius: TN.radius.sm, fontSize: 16, fontWeight: 400, background: TN.white, color: TN.ink900 };

const PLAN_STATUS_LABEL: Record<string, string> = { DRAFT: "Utkast", ACTIVE: "Aktiv", ARCHIVED: "Arkivert" };

/** TN-23 Teknisk plan, alle planer for én spiller (tavle C1). */
export function TnTekniskPlanerVisning({ brukerNavn, kontekst, spillerId, spillerNavn, planer }: { brukerNavn: string; kontekst: TnTekniskPlanKontekst; spillerId: string; spillerNavn: string; planer: TnTekniskPlanRad[] }) {
  const harTilgang = true;
  const aktiv = planer.find((p) => p.status === "ACTIVE") ?? null;

  return (
    <TnShell
      aktiv="spillere"
      brukerNavn={brukerNavn}
      rolle={kontekst.erSpiller ? "Spiller" : "Trener"}
      groupId={kontekst.gruppeId}
      visTrenerflater={kontekst.erTrener}
      kanAdministrere={kontekst.kanAdministrere}
      tilbake={{ href: "/team-norway/spillere", label: "Spillere" }}
    >
      <TnSkraTopp
        bilde="spiller-ved-vannet"
        etikett={`Teknisk plan for ${spillerNavn}`}
        overlinje={`IUP · ${spillerNavn}`}
        tittel="Teknisk plan"
        ingress="P-posisjoner, arbeidsoppgaver og rep-mål. Kvalitetssjekken vises bare; den sperrer aldri neste læringssteg."
        venstre={
          <>
            <TnHeltTall verdi={aktiv ? `${aktiv.antallFullfort}` : "—"} enhet={aktiv ? `av ${aktiv.antallOppgaver}` : undefined}>{aktiv ? "oppgaver ferdig i aktiv plan" : "ingen aktiv plan"}</TnHeltTall>
            <TnHeltTekst>{aktiv ? aktiv.navn : `Ingen teknisk plan er aktiv for ${spillerNavn}.`}</TnHeltTekst>
          </>
        }
        hoyre={<TnHeltTellere tall={[{ verdi: planer.length, tekst: planer.length === 1 ? "plan" : "planer" }, { verdi: planer.filter((p) => p.status === "ACTIVE").length, tekst: "aktive" }, { verdi: planer.filter((p) => p.status === "ARCHIVED").length, tekst: "arkivert" }]} />}
      />
      <TnSkraKort>
      <TnFlate>
        <TnSpillerFaner spillerId={spillerId} spillerNavn={spillerNavn} aktiv="teknisk-plan" kanAdministrere={!kontekst.erSpiller} kompakt />
      </TnFlate>

      {!harTilgang ? (
        <TnKort>
          <p style={{ margin: 0, color: TN.ink700 }}>
            Du er trener i Team Norway, men ikke {spillerNavn}s personlige coach — TN-rollen alene gir
            ikke tilgang til den individuelle tekniske planen.
          </p>
        </TnKort>
      ) : planer.length === 0 ? (
        <TnKort><p style={{ margin: 0, color: TN.ink700 }}>Ingen teknisk plan opprettet for {spillerNavn} ennå.</p></TnKort>
      ) : (
        <TnSeksjon tittel="Planer">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {planer.map((p) => (
              <Link key={p.id} href={`/team-norway/spiller/${spillerId}/teknisk-plan/${p.id}`} style={{ textDecoration: "none" }}>
                <TnKort>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ minWidth: 0, flex: "1 1 220px" }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: TN.ink900 }}>{p.navn}</p>
                      <div aria-hidden="true" style={{ height: 10, background: TN.ink100, marginTop: 8 }}><span style={{ display: "block", height: "100%", width: `${p.antallOppgaver ? (p.antallFullfort / p.antallOppgaver) * 100 : 0}%`, background: TN.akse.TEK.fyll }} /></div>
                      <p style={{ margin: "6px 0 0", color: TN.ink500, fontSize: 12.5, fontFamily: TN.font.mono }}>
                        {p.startDato.toISOString().slice(0, 10)}{p.sluttDato ? ` – ${p.sluttDato.toISOString().slice(0, 10)}` : ""} · {p.antallFullfort} av {p.antallOppgaver} oppgaver fullført
                      </p>
                    </div>
                    <TnPille tone={p.status === "ACTIVE" ? "green" : p.status === "ARCHIVED" ? "nøytral" : "amber"}>{PLAN_STATUS_LABEL[p.status] ?? p.status}</TnPille>
                  </div>
                </TnKort>
              </Link>
            ))}
          </div>
        </TnSeksjon>
      )}
      </TnSkraKort>
    </TnShell>
  );
}
