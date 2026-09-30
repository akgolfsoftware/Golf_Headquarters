/** Prøvefil for AG-23 Team: Inviter coach og Eksterne lesere. Syntetiske data. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { AG23Inviter, AG23Ekstern, AG23TeamOversikt, type TeamRad, type AG23TeamTilstand, type EksternLeserRad, type EkstraTilgang } from "@/components/admin/precision/AG23Team";

export const sti = "/admin/team/inviter";

const grupper = [{ id: "g1", name: "Testgruppe Mini" }, { id: "g2", name: "Testgruppe med et svært langt navn som må brytes pent" }];
const lesere: EksternLeserRad[] = [
  { id: "l1", navn: "Test Leser", epost: "test.leser@example.com", grupper: ["Testgruppe Mini"] },
  { id: "l2", navn: "Ekstern Ansvarlig med langt navn", epost: "veldig.lang.epostadresse.for.prove@example.com", grupper: ["Testgruppe Mini", "Testgruppe med et svært langt navn som må brytes pent"] },
];
const tilganger = [{ id: "view_finance", label: "Se økonomi" }, { id: "manage_users", label: "Administrere brukere med en lang beskrivelse som må brytes pent" }] as unknown as EkstraTilgang[];
const Skall = (c: React.ReactNode) => <AdminRolleProvider erAdmin><AgencyOSSkall navn="Test Coach">{c}</AgencyOSSkall></AdminRolleProvider>;
const Inv = (t: AG23TeamTilstand, admin = true) => Skall(<AG23Inviter tilstand={t} kanTildeleTilganger={admin} tilganger={tilganger} />);
const Eks = (t: AG23TeamTilstand, l = lesere) => Skall(<AG23Ekstern tilstand={t} grupper={grupper} lesere={l} />);
const team: TeamRad[] = [
  { id: "t1", navn: "Test Coach", rolle: "ADMIN", epost: "test.coach@example.com", aktiv: true },
  { id: "t2", navn: "Test Assistent med et langt navn som må brytes pent", rolle: "COACH", epost: "veldig.lang.epostadresse.for.prove@example.com", aktiv: false },
];
const Team = (t: AG23TeamTilstand, l = team, inv = true) => Skall(<AG23TeamOversikt tilstand={t} team={l} kanInvitere={inv} kanTildeleTilganger={inv} tilganger={tilganger} kanEksterne={inv} />);
export const natt = ["natt", "natt-tom", "natt-laster", "natt-feil", "team-natt"];
export const tilstander = {
  data: Inv("data"),
  tom: Inv("data", false),
  laster: Inv("laster"),
  feil: Inv("feil"),
  natt: Inv("data"),
  "team-data": Team("data"),
  "team-tom": Team("data", team.slice(0, 1), false),
  "team-laster": Team("laster"),
  "team-feil": Team("feil"),
  "team-natt": Team("data"),
  "natt-tom": Inv("data", false),
  "natt-laster": Inv("laster"),
  "natt-feil": Inv("feil"),
  "ekstern-data": Eks("data"),
  "ekstern-tom": Eks("data", []),
  "ekstern-laster": Eks("laster"),
  "ekstern-feil": Eks("feil"),
};
