/** Prøvefil for R10: Samlinger og Data Golf-stasjonen. Syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { SkraFlyt, SkraTopp } from "@/components/precision/skra/Skra";
import { SamlingsinvitasjonListe } from "@/app/portal/samlinger/samlingsinvitasjon-liste";
import { PH17DgStasjon } from "@/components/portal/precision/PH17DgStasjon";
import { STANDARD_PH17_DATA } from "@/lib/portal-analyse/ph17-trackman-data";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-lister-skra.css";

const inv = [{
  id: "i1",
  konflikter: [{ sourceSessionId: "s1", tittel: "Styrke med laget" }],
  program: {
    samling: { kind: "SAMLING", tittel: "Samling Bossum", fra: "2026-11-07T08:00:00Z", til: "2026-11-08T15:00:00Z", sted: "Gamle Fredrikstad GK", beskrivelse: "To dager med fokus på nærspill og spillplan." },
    okter: [
      { sourceSessionId: "s1", title: "Nærspill, tre lengder", date: "2026-11-07", startMinute: 540, durationMinutes: 90, maalsetning: "Kontroll på landing", location: "Range", skillArea: "SLAG", pressureLevel: "OBSERVERT", pPosisjoner: ["P7.0"], pyramid: "SLAG", drills: [{ id: "d1", title: "Landingssone", description: "Ti baller per lengde" }] },
      { sourceSessionId: "s2", title: "Spillplan 9 hull", date: "2026-11-08", startMinute: 600, durationMinutes: 120, maalsetning: null, location: null, skillArea: "SPILL", pressureLevel: null, pPosisjoner: [], pyramid: "SPILL", drills: [] },
    ],
  },
}];
const skall = (n: React.ReactNode) => <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>{n}</PlayerHQSkall>;
const sam = (liste: unknown[]) => skall(
  <div className="phn phn-skra">
    <SkraTopp lav etikett="Samlinger" bilde="/images/playerhq/slag-putting.jpg" overlinje="Plan · Workbench" tittel="Invitasjoner til samlinger" ingress="Se hele programmet og sjekk kalenderkollisjoner før du svarer." />
    <SkraFlyt lav><SamlingsinvitasjonListe invitasjoner={liste as never} /></SkraFlyt>
  </div>,
);
export const tilstander = {
  samlinger: sam(inv),
  "samlinger-tom": sam([]),
  stasjon: skall(<PH17DgStasjon station={STANDARD_PH17_DATA.station} />),
};
