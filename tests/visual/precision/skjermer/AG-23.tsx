/** Prøvefil for AG-23 Oppsett (hode + ekte Train-lock-innhold i Akademi-fanen). Syntetiske data. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { AG23Hode } from "@/components/admin/precision/AG23Hode";
import { AdminOppsettHubTrainLock, type AdminOppsettHubData } from "@/components/admin/v2/oppsett/AdminOppsettHubTrainLock";
import { LasterTilstand, FeilTilstand } from "@/components/precision/pa";
import { Settings } from "lucide-react";
import "@/styles/precision-a5.css";

export const sti = "/admin/oppsett";

const alle = [
  ["akademi", "Akademi"], ["klubb", "Klubb"], ["kalender", "Kalender"], ["tilgang", "Tilgang"],
  ["sikkerhet", "Sikkerhet"], ["integrasjoner", "Integrasjoner"], ["api", "API"], ["perioder", "Perioder"],
].map(([id, label]) => ({ id: id!, label: label!, href: `/admin/oppsett?fane=${id}` }));
const coach = alle.filter((f) => ["kalender", "sikkerhet", "perioder"].includes(f.id));

const hub: AdminOppsettHubData = {
  akademi: { navn: "Test Akademi med et langt navn som må brytes pent", hjemmeklubb: "Testklubben", sesong: 2026, ukestart: "Mandag" },
  varslerBeskrivelse: "Varsler for booking, betaling og plan.",
  tilgang: { medlemmer: [{ id: "u1", navn: "Test Coach", epost: "test.coach@example.com", rolle: "ADMIN", grupper: 3, tidsvinduer: 12 }], totalCount: 1, adminCount: 1, coachCount: 0, totalSpillere: 8, snittSpillere: "8,0", inviterHref: "/admin/team/inviter", tilgangsmatriseHref: "/admin/oppsett?fane=tilgang" },
  klubb: { lokasjoner: [{ id: "k1", navn: "Testklubben", aktiv: true, fasiliteter: 4 }], innstillingerHref: "/admin/oppsett?fane=klubb", fasiliteterHref: "/admin/oppsett?fane=klubb" },
  konto: { navn: "Test Coach", epost: "test.coach@example.com", rolleLabel: "Administrator", href: "/admin/profile" },
};
const ekte = <AdminOppsettHubTrainLock data={hub} rad={null} somFane baseHref="/admin/oppsett" />;

const Side = (erAdmin: boolean, faner: typeof alle, innhold: React.ReactNode = ekte) => (
  <AdminRolleProvider erAdmin={erAdmin}>
    <AgencyOSSkall navn="Test Coach">
      <div className="pa-side">
        <AG23Hode sted="oppsett" kicker="Mer · Oppsett" tittel="Oppsett" sub="Profil, team, tilgang, kalender, sikkerhet og integrasjoner." innstillinger={faner} aktivInnstilling={faner[0]!.id} />
        <div style={{ minWidth: 0 }}>{innhold}</div>
      </div>
    </AgencyOSSkall>
  </AdminRolleProvider>
);
const laster = Side(true, alle, <LasterTilstand text="Henter oppsett …" />);
const feil = Side(true, alle, <FeilTilstand icon={Settings} title="Oppsett kunne ikke hentes" text="Ingen innstillinger er endret." code="FEIL 503 · OPPSETT" />);

export const natt = ["natt", "natt-tom", "natt-laster", "natt-feil"];
export const tilstander = {
  data: Side(true, alle),
  tom: Side(false, coach),
  laster,
  feil,
  natt: Side(true, alle),
  "natt-tom": Side(false, coach),
  "natt-laster": laster,
  "natt-feil": feil,
};
