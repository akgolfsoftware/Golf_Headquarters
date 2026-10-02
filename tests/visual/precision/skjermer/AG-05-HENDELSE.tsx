/** Prøvefil for /admin/kalender/hendelse/ny og /[id] i Precision. Syntetiske data. */
import { CalendarX } from "lucide-react";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { FeilTilstand, KnappLenke, LasterTilstand } from "@/components/precision/pa";
import { Side, SideHode } from "@/components/precision/pa-a4";
import { HendelseDetalj, HendelseSkjema } from "@/components/admin/precision/AG05Hendelse";

export const sti = "/admin/kalender/hendelse/ny";

const verdier = { tittel: "Stengt anlegg", startDato: "2026-10-05", startTid: "08:00", sluttDato: "2026-10-05", sluttTid: "12:00", notat: "Service på simulatorene." };

const Ramme = ({ tittel, children }: { tittel: string; children: React.ReactNode }) => (
  <AgencyOSSkall navn="Test Coach">
    <Side max={760}>
      <SideHode kicker="Kalender · hendelse" title={tittel} actions={<KnappLenke href="/admin/kalender" variant="ghost">Til kalenderen</KnappLenke>} />
      {children}
    </Side>
  </AgencyOSSkall>
);

export const tilstander = {
  ny: <Ramme tittel="Ny hendelse"><HendelseSkjema start={{ ...verdier, tittel: "", notat: "" }} /></Ramme>,
  data: <Ramme tittel="Stengt anlegg"><HendelseDetalj id="h1" tid="mandag 5. oktober 08:00 – mandag 5. oktober 12:00" notat={verdier.notat} kanEndre verdier={verdier} /></Ramme>,
  lese: <Ramme tittel="Stengt anlegg"><HendelseDetalj id="h1" tid="mandag 5. oktober 08:00 – mandag 5. oktober 12:00" notat={null} kanEndre={false} verdier={verdier} /></Ramme>,
  endre: <Ramme tittel="Stengt anlegg"><HendelseSkjema id="h1" start={verdier} /></Ramme>,
  laster: <Ramme tittel="Hendelse"><LasterTilstand text="Henter kalenderen …" /></Ramme>,
  feil: <Ramme tittel="Hendelse"><FeilTilstand icon={CalendarX} title="Kalenderen kunne ikke hentes" text="Ingen hendelser er endret." /></Ramme>,
  tom: <Ramme tittel="Hendelse"><HendelseDetalj id="h1" tid="—" notat={null} kanEndre={false} verdier={verdier} /></Ramme>,
};
