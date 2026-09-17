import { OektKort } from "akgolf-hq-komponenter";

const kolonne = { display: "flex", flexDirection: "column" as const, gap: 12, maxWidth: 480 };

/** OektKort er Open Design-navnet på OktKort — samme kort. Planlagt turneringsdag med TURN-akse. */
export function Turneringsdag() {
  return (
    <div style={kolonne}>
      <OektKort
        title="Turnering — Srixon Tour 5, runde 1"
        axis="TURN"
        time="09:10"
        duration="18 hull"
        location="Larvik GK"
        coach="Anders Kristiansen"
        state="planned"
        cta="Åpne scorekort"
        ctaGhost="Strategikort"
      />
    </div>
  );
}

/** Gjennomført økt med tall i bunnlinjen og «Se recap» som eneste handling. */
export function Gjennomfort() {
  return (
    <div style={kolonne}>
      <OektKort
        title="Golfslag — jern 150–170 m"
        axis="SLAG"
        time="16:30"
        duration="60 min"
        location="GFGK range"
        coach="Anders Kristiansen"
        state="done"
        footerTall={<span style={{ fontSize: 11.5 }}>84 slag · Carry-spredning 9,1 m</span>}
        ctaGhost="Se recap"
      />
    </div>
  );
}
