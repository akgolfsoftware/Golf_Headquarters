/** Prøvefil for AG-24 Drift (Logger, Feillogg, GDPR, Hjelp). Syntetiske data, ingen ekte personer. */
import { TriangleAlert } from "lucide-react";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { FeilTilstand, Knapp, LasterTilstand } from "@/components/precision/pa";
import { AG24Feillogg, AG24Gdpr, AG24Hjelp, AG24Logger, type AuditData, type FeilData, type GdprData } from "@/components/admin/precision/AG24Drift";
import { Natt } from "./_natt";

export const sti = "/admin/audit-log";

const audit: AuditData = {
  total: 1284, mistenkelige: 2,
  events: [
    { id: "a1", time: "30. sep., 08:12", kind: "auth", actor: "Test Coach", action: "auth.login", status: "ok" },
    { id: "a2", time: "30. sep., 07:58", kind: "api", actor: "system", action: "stripe.webhook.invoice.paid med et veldig langt hendelsesnavn som må brytes", status: "ok" },
    { id: "a3", time: "29. sep., 21:40", kind: "security", actor: "ukjent", action: "auth.login.failed", status: "danger" },
    { id: "a4", time: "29. sep., 18:03", kind: "data", actor: "Test Admin", action: "gdpr.request.rejected", status: "warn" },
  ],
};
const feil: FeilData = {
  total: 37, sisteDogn: 1, kontekster: 3,
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

const Skall = ({ children }: { children: React.ReactNode }) => <AdminRolleProvider erAdmin><AgencyOSSkall navn="Test Coach">{children}</AgencyOSSkall></AdminRolleProvider>;

export const tilstander = {
  logg: <Skall><AG24Logger data={audit} /></Skall>,
  "logg-tom": <Skall><AG24Logger data={{ events: [], total: 0, mistenkelige: 0 }} /></Skall>,
  feillogg: <Skall><AG24Feillogg data={feil} /></Skall>,
  "feillogg-tom": <Skall><AG24Feillogg data={{ feil: [], total: 0, sisteDogn: 0, kontekster: 0 }} /></Skall>,
  gdpr: <Skall><AG24Gdpr data={gdpr} utforSletteforesporsel={ingen} avvisForesporsel={ingen} /></Skall>,
  "gdpr-bekreft": <Skall><AG24Gdpr data={gdpr} startBekreftId="g1" utforSletteforesporsel={ingen} avvisForesporsel={ingen} /></Skall>,
  "gdpr-tom": <Skall><AG24Gdpr data={{ rader: [] }} utforSletteforesporsel={ingen} avvisForesporsel={ingen} /></Skall>,
  hjelp: <Skall><AG24Hjelp /></Skall>,
  "hjelp-tom": <Skall><AG24Hjelp artikler={[]} /></Skall>,
  laster: <Skall><div className="pa-side"><LasterTilstand text="Henter logger …" /></div></Skall>,
  feil: <Skall><div className="pa-side"><FeilTilstand icon={TriangleAlert} title="Loggen kunne ikke hentes" text="Ingenting er endret. Prøv igjen om litt." retry={<Knapp variant="secondary">Prøv igjen</Knapp>} /></div></Skall>,
  "logg-natt": <Natt><Skall><AG24Logger data={audit} /></Skall></Natt>,
  "feillogg-natt": <Natt><Skall><AG24Feillogg data={feil} /></Skall></Natt>,
  "gdpr-bekreft-natt": <Natt><Skall><AG24Gdpr data={gdpr} startBekreftId="g1" utforSletteforesporsel={ingen} avvisForesporsel={ingen} /></Skall></Natt>,
  "gdpr-natt": <Natt><Skall><AG24Gdpr data={gdpr} utforSletteforesporsel={ingen} avvisForesporsel={ingen} /></Skall></Natt>,
  "hjelp-natt": <Natt><Skall><AG24Hjelp /></Skall></Natt>,
};
export const natt = ["logg-natt", "feillogg-natt", "gdpr-natt", "hjelp-natt", "gdpr-bekreft-natt"];
