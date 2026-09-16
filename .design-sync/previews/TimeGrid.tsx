import { TimeGrid } from "akgolf-hq-komponenter";

const UKE_38 = [
  { id: "man", dow: "Man", date: "14" },
  { id: "tir", dow: "Tir", date: "15" },
  { id: "ons", dow: "Ons", date: "16", today: true },
  { id: "tor", dow: "Tor", date: "17" },
  { id: "fre", dow: "Fre", date: "18" },
  { id: "lor", dow: "Lør", date: "19" },
  { id: "son", dow: "Søn", date: "20" },
];

type Okt = { dag: number; fra: number; varighet: number; tittel: string; sub: string };

const OKTER: Okt[] = [
  { dag: 0, fra: 7 * 60, varighet: 90, tittel: "Styrke", sub: "Treningslokalet" },
  { dag: 1, fra: 15 * 60 + 30, varighet: 90, tittel: "Driver", sub: "Lav hastighet" },
  { dag: 2, fra: 9 * 60, varighet: 120, tittel: "Innspill 100 m", sub: "60 slag" },
  { dag: 2, fra: 14 * 60, varighet: 90, tittel: "Putt 5–10 fot", sub: "40 putter" },
  { dag: 5, fra: 9 * 60, varighet: 240, tittel: "Bane 18 hull", sub: "GFGK" },
];

const klokke = (min: number) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

/** Øktblokk plassert med samme regnestykke som timeGridBlockStyle, men relativt til gridets startHour. */
function Blokk({ okt, startHour, hourPx }: { okt: Okt; startHour: number; hourPx: number }) {
  return (
    <div
      style={{
        position: "absolute",
        left: 3,
        right: 3,
        top: ((okt.fra - startHour * 60) / 60) * hourPx,
        height: Math.max(20, (okt.varighet / 60) * hourPx - 2),
        zIndex: 1,
        borderRadius: 8,
        padding: "4px 8px",
        overflow: "hidden",
        background: "var(--tl-dock)",
        borderLeft: "2px solid var(--tl-hair)",
      }}
    >
      <span style={{ display: "block", fontFamily: "var(--tl-font-mono)", fontSize: 8, fontWeight: 600, color: "var(--tl-mute)" }}>
        {klokke(okt.fra)}–{klokke(okt.fra + okt.varighet)}
      </span>
      <span style={{ display: "block", fontFamily: "var(--tl-font-sans)", fontSize: 11, fontWeight: 600, color: "var(--tl-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{okt.tittel}</span>
      <span style={{ display: "block", fontFamily: "var(--tl-font-sans)", fontSize: 9.5, color: "var(--tl-mute)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{okt.sub}</span>
    </div>
  );
}

/** Uke 38 i tidsutsnittet 07–17: fem økter via renderDay (titler under 13 tegn — kolonnen klipper med ellipse), onsdag er i dag, nå-linjen står kl. 12. */
export function UkeMedOkter() {
  return (
    <div style={{ maxWidth: 780 }}>
      <TimeGrid
        days={UKE_38}
        startHour={7}
        endHour={17}
        renderDay={(i) => OKTER.filter((o) => o.dag === i).map((o, k) => <Blokk key={k} okt={o} startHour={7} hourPx={44} />)}
        onEmptyClick={() => {}}
      />
    </div>
  );
}

/** Tre dager med stablet daghode (PH-07 v3) og fasitens 48 px per time. */
export function DagStabletHode() {
  const dager = UKE_38.slice(1, 4);
  return (
    <div style={{ maxWidth: 520 }}>
      <TimeGrid
        days={dager}
        startHour={8}
        endHour={18}
        hourPx={48}
        stackedHeader
        renderDay={(i) => OKTER.filter((o) => o.dag === i + 1).map((o, k) => <Blokk key={k} okt={o} startHour={8} hourPx={48} />)}
      />
    </div>
  );
}

/** Tom uke uten ramme og uten nå-linje: bare tidsakse, daghoder og timelinjer. */
export function TomUke() {
  return (
    <div style={{ maxWidth: 780 }}>
      <TimeGrid
        days={[
          { id: "man", dow: "Man", date: "21" },
          { id: "tir", dow: "Tir", date: "22" },
          { id: "ons", dow: "Ons", date: "23" },
          { id: "tor", dow: "Tor", date: "24" },
          { id: "fre", dow: "Fre", date: "25" },
          { id: "lor", dow: "Lør", date: "26" },
          { id: "son", dow: "Søn", date: "27" },
        ]}
        startHour={7}
        endHour={15}
        bordered={false}
        showNowLine={false}
        renderDay={() => null}
      />
    </div>
  );
}
