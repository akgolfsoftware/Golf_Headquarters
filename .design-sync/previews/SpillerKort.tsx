import { SpillerKort } from "akgolf-hq-komponenter";

const kolonne = { display: "flex", flexDirection: "column" as const, gap: 12, maxWidth: 480 };

/** Kompakt stall-rad: avatar, HCP- og kategori-pill, SG med delta til høyre og status-chip. */
export function Kompakt() {
  return (
    <div style={kolonne}>
      <SpillerKort
        navn="Øyvind Rohjan"
        kategori="E · Regional U18"
        hcp="2,4"
        sg="+1,8"
        sgDir="up"
        sgDelta="+0,3"
        status="ok"
        sistAktiv="Trente i går"
        onClick={() => {}}
      />
    </div>
  );
}

/** Status-aksen i stallen: I rute, Spørsmål, Venter og Sterkt avvik. */
export function Statuser() {
  return (
    <div style={kolonne}>
      <SpillerKort navn="Mina Solheim" kategori="D · Regional Elite" hcp="0,8" sg="+2,1" sgDir="up" sgDelta="+0,2" status="ok" sistAktiv="Trente i dag" />
      <SpillerKort navn="Jonas Bergli" kategori="G · Klubbspiller junior" hcp="9,6" sg="−0,4" sgDir="down" sgDelta="−0,1" status="lav" sistAktiv="Spurte om ukeplanen" />
      <SpillerKort navn="Emil Haugen" kategori="G · Klubbspiller junior" hcp="11,2" sg="−0,9" sgDir="down" sgDelta="−0,5" status="medium" sistAktiv="Venter på godkjenning av uke 39" />
      <SpillerKort navn="Sander Lie" kategori="F · Klubbspiller senior" hcp="4,1" sg="−1,6" sgDir="down" sgDelta="−0,8" status="sterk" sistAktiv="Ikke åpnet appen på 12 dager" />
    </div>
  );
}

/** KPI-stripe under navnet: SG snitt, runder og adherence (coach-visning). */
export function MedKpiStripe() {
  return (
    <div style={kolonne}>
      <SpillerKort navn="Øyvind Rohjan" kategori="E · Regional U18" hcp="2,4" sg="+1,8" sgDir="up" sgDelta="+0,3" runder={6} adherence="83 %" />
    </div>
  );
}

/** Ny spiller uten data: tankestrek for SG, runder og adherence — aldri 0. */
export function UtenData() {
  return (
    <div style={kolonne}>
      <SpillerKort navn="Nora Vik" kategori="I · Rekrutt junior" hcp="22,5" sg="" runder="" adherence="" medKpiStripe />
    </div>
  );
}
