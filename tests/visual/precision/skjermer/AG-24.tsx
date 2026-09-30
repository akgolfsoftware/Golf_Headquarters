/** Prøvefil for AG-24 Drift (Logger, Feillogg, GDPR, Hjelp). Syntetiske data, ingen ekte personer. */
import type { ReactNode } from "react";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { AG24Feillogg, AG24Gdpr, AG24Hjelp, AG24Logger, type AuditData, type FeilData, type GdprData } from "@/components/admin/precision/AG24Drift";
import { AG24Feil, AG24Laster } from "@/components/admin/precision/AG24Tilstander";
import { Natt } from "./_natt";

export const sti = "/admin/audit-log";

const audit: AuditData = {
  total: 1284,
  events: [
    { id: "a1", time: "30. sep., 08:12", kind: "auth", actor: "Test Coach", action: "auth.login", status: "ok" },
    { id: "a2", time: "30. sep., 07:58", kind: "api", actor: "system", action: "stripe.webhook.invoice.paid med et veldig langt hendelsesnavn som må brytes", status: "ok" },
    { id: "a3", time: "29. sep., 21:40", kind: "security", actor: "ukjent", action: "auth.login.failed", status: "danger" },
    { id: "a4", time: "29. sep., 18:03", kind: "data", actor: "Test Admin", action: "gdpr.request.rejected", status: "warn" },
  ],
};
const feil: FeilData = {
  total: 37,
  feil: [
    { id: "f1", tid: "30. sep., 06:45", kontekst: "api/cron/sync-golfbox", melding: "Timeout etter 30 s mot ekstern tjeneste (syntetisk prøvemelding som er lang nok til å brytes over flere linjer).", stack: "Error: Timeout\n    at fetchMedTimeout (src/lib/eksempel/hent.ts:41:11)\n    at synk (src/lib/eksempel/synk.ts:12:5)", severity: "error" },
    { id: "f2", tid: "29. sep., 22:10", kontekst: "portal/booking", melding: "Ugyldig tidspunkt", stack: null, severity: "warn" },
    { id: "f3", tid: "29. sep., 09:02", kontekst: "stripe/webhook", melding: "Signatur mangler", stack: null, severity: "fatal" },
  ],
};
const gdpr: GdprData = {
  rader: [
    { id: "g1", type: "DELETE", alder: 27, forsinket: true, bedtAv: "Test Forelder (forelder@example.test)", gjelder: "Test Barn (barn@example.test)" },
    { id: "g2", type: "EXPORT", alder: 3, forsinket: false, bedtAv: "Test Spiller (spiller@example.test)", gjelder: "Test Spiller (spiller@example.test)" },
  ],
};
const ingen = async () => {};

const Skall = ({ children, erAdmin = true }: { children: ReactNode; erAdmin?: boolean }) => <AdminRolleProvider erAdmin={erAdmin}><AgencyOSSkall navn="Test Coach">{children}</AgencyOSSkall></AdminRolleProvider>;

/** AG24Feil logger feilen med console.error («[v2/error]»); prøven skal ikke telle akkurat den som konsollfeil. */
const opprinneligFeillogg = console.error;
console.error = (...args: unknown[]) => { if (args[0] !== "[v2/error]") opprinneligFeillogg(...args); };

export const tilstander = {
  logg: <Skall><AG24Logger data={audit} /></Skall>,
  "logg-tom": <Skall><AG24Logger data={{ events: [], total: 0 }} /></Skall>,
  feillogg: <Skall><AG24Feillogg data={feil} /></Skall>,
  "feillogg-tom": <Skall><AG24Feillogg data={{ feil: [], total: 0 }} /></Skall>,
  gdpr: <Skall><AG24Gdpr data={gdpr} utforSletteforesporsel={ingen} avvisForesporsel={ingen} /></Skall>,
  "gdpr-tom": <Skall><AG24Gdpr data={{ rader: [] }} utforSletteforesporsel={ingen} avvisForesporsel={ingen} /></Skall>,
  hjelp: <Skall><AG24Hjelp /></Skall>,
  "hjelp-coach": <Skall erAdmin={false}><AG24Hjelp /></Skall>,
  laster: <AdminRolleProvider erAdmin><AG24Laster text="Henter logger …" /></AdminRolleProvider>,
  feil: <AdminRolleProvider erAdmin><AG24Feil title="Loggen kunne ikke hentes" error={Object.assign(new Error("syntetisk"), { digest: "prøve-0930" })} reset={() => {}} /></AdminRolleProvider>,
  "logg-natt": <Natt><Skall><AG24Logger data={audit} /></Skall></Natt>,
  "feillogg-natt": <Natt><Skall><AG24Feillogg data={feil} /></Skall></Natt>,
  "gdpr-natt": <Natt><Skall><AG24Gdpr data={gdpr} utforSletteforesporsel={ingen} avvisForesporsel={ingen} /></Skall></Natt>,
  "hjelp-natt": <Natt><Skall><AG24Hjelp /></Skall></Natt>,
};
export const natt = ["logg-natt", "feillogg-natt", "gdpr-natt", "hjelp-natt"];
