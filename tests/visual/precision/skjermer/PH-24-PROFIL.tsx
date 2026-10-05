/** Prøvefil for PH-24 Profil. Syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH24Profil, type PH24ProfilData } from "@/components/portal/precision/PH24Profil";
import { Natt } from "./_natt";

export const sti = "/portal/meg/profil";

const demoData: PH24ProfilData = {
  navn: "Øyvind Rohjan",
  avatarUrl: null,
  epost: "oyvind.rohjan@eksempel.no",
  mobil: "+47 900 00 000",
  hcp: 3.4,
  homeClub: "Gamle Fredrikstad Golfklubb",
  fodselsdatoISO: "2009-03-14",
  ambition: "Spille Srixon Tour og kvalifisere meg til NM junior.",
  spillerSiden: "mars 2024",
  stallNavn: "Elite Junior",
  runderIAar: 42,
  ngfId: "123-4567",
  hcpMaalTekst: "HCP 2,0 innen 01.11.2026",
};

const tomData: PH24ProfilData = {
  navn: "Ny Spiller",
  avatarUrl: null,
  epost: "spiller@eksempel.no",
  mobil: null,
  hcp: null,
  homeClub: null,
  fodselsdatoISO: null,
  ambition: null,
  spillerSiden: "oktober 2026",
  stallNavn: null,
  runderIAar: 0,
  ngfId: null,
  hcpMaalTekst: null,
};

const lagre = async () => ({ ok: true as const });

const Vis = ({ data = demoData, nattModus = false }: { data?: PH24ProfilData; nattModus?: boolean }) => {
  const comp = (
    <PlayerHQSkall innboksHref="#" uleste={0}>
      <PH24Profil data={data} onLagre={lagre} />
    </PlayerHQSkall>
  );
  return nattModus ? <Natt>{comp}</Natt> : comp;
};

export const tilstander = {
  data: <Vis />,
  tom: <Vis data={tomData} />,
  natt: <Vis nattModus />,
};

export const natt = ["natt"];
