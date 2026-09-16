import { CTAPill, Kort, KpiFlis, Rad, Skjerm, StatusPill, Tittel } from "akgolf-hq-komponenter";

/** Mobil 390 px: statuslinje, innhold, bunn-nav. Vist i 0,8× så hele ramma (min. 800 px høy) får plass i kortet. */
export function Mobil() {
  return (
    <div style={{ zoom: 0.8 }}>
      <Skjerm mobile aktiv="hjem">
        <Tittel mobile>God morgen, Øyvind</Tittel>
        <div style={{ marginTop: 16 }}>
          <Kort eyebrow="Neste økt" action={<StatusPill>Nå</StatusPill>}>
            <Rad title="Wedge 60–100 m · 60 slag" sub="16:00 · Range, GFGK" trailing={null} last />
            <div style={{ marginTop: 12 }}>
              <CTAPill full enTing icon="play">Start økt · 45 min</CTAPill>
            </div>
          </Kort>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
          <KpiFlis label="Denne uka" value={4} instant sub="av 6 økter" />
          <KpiFlis label="SG totalt" value="+1,8" delta="+0,4" dir="up" instant />
        </div>
      </Skjerm>
    </div>
  );
}

/** Mac 1280 px: IkonRail + innhold (maks 1120). Vist i 0,66×. */
export function Desktop() {
  return (
    <div style={{ zoom: 0.66 }}>
      <Skjerm aktiv="analyse">
        <Tittel em="analyse.">Slag og</Tittel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>
          <KpiFlis label="SG totalt" value="+1,8" delta="+0,4" dir="up" instant />
          <KpiFlis label="Snittscore" value="74,3" delta="−1,2" dir="down" instant />
          <KpiFlis label="Putt per runde" value="31,2" delta="−0,6" dir="down" instant />
          <KpiFlis label="GIR" value="58 %" delta="+4" dir="up" />
        </div>
        <Kort eyebrow="Siste runder">
          <Rad title="Klubbmesterskap · runde 1" sub="Søndag 14.09 · GFGK · 18 hull" trailing={null} />
          <Rad title="Srixon Tour · runde 2" sub="Lørdag 06.09 · Borre GK · 18 hull" trailing={null} />
          <Rad title="Srixon Tour · runde 1" sub="Fredag 05.09 · Borre GK · 18 hull" trailing={null} last />
        </Kort>
      </Skjerm>
    </div>
  );
}
