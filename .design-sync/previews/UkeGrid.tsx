import { UkeGrid } from "akgolf-hq-komponenter";

const boks = { maxWidth: 760 };

/** Uke 38: gjennomført (grønn prikk), hoppet over (rød), planlagt (dempet). Onsdag 16. er i dag. Titler holdes under ~74 px (kolonnen klipper med ellipse). */
export function DenneUka() {
  return (
    <div style={boks}>
      <UkeGrid
        week={[
          { date: 14, sessions: [{ time: "07:00", title: "Styrke", axis: "FYS", compliance: "on" }] },
          { date: 15, sessions: [{ time: "15:30", title: "Driver", axis: "TEK", compliance: "off" }] },
          { date: 16, today: true, sessions: [{ time: "09:00", title: "Innspill 100", axis: "SLAG", compliance: "planned" }, { time: "17:00", title: "Putt 5–10 fot", axis: "SLAG", compliance: "planned" }] },
          { date: 17, sessions: [{ time: "16:00", title: "Nærspill", axis: "SLAG", compliance: "planned" }] },
          { date: 18, sessions: [] },
          { date: 19, sessions: [{ time: "09:00", title: "Bane 18 hull", axis: "SPILL", compliance: "planned" }] },
          { date: 20, sessions: [{ title: "Turnering", axis: "TURN", compliance: "planned" }] },
        ]}
        onSessionClick={() => {}}
      />
    </div>
  );
}

/** Forrige uke, alt vurdert: gjennomført, hoppet over og ikke registrert (grå). */
export function ForrigeUke() {
  return (
    <div style={boks}>
      <UkeGrid
        week={[
          { date: 7, sessions: [{ time: "07:00", title: "Styrke", axis: "FYS", compliance: "on" }] },
          { date: 8, sessions: [{ time: "15:30", title: "Driver", axis: "TEK", compliance: "on" }] },
          { date: 9, sessions: [{ time: "09:00", title: "Innspill 150", axis: "SLAG", compliance: "none" }] },
          { date: 10, sessions: [{ time: "16:00", title: "Bunker", axis: "SLAG", compliance: "off" }, { time: "17:00", title: "Putt 3–5 fot", axis: "SLAG", compliance: "on" }] },
          { date: 11, sessions: [] },
          { date: 12, sessions: [{ time: "09:00", title: "Bane 9 hull", axis: "SPILL", compliance: "on" }] },
          { date: 13, sessions: [{ time: "08:00", title: "Norgescup", axis: "TURN", compliance: "on" }] },
        ]}
      />
    </div>
  );
}

/** Tom uke: bare daghoder og hårlinjer — det coachen møter før «Kopier forrige uke». */
export function TomUke() {
  return (
    <div style={boks}>
      <UkeGrid
        week={[
          { date: 21, sessions: [] },
          { date: 22, sessions: [] },
          { date: 23, sessions: [] },
          { date: 24, sessions: [] },
          { date: 25, sessions: [] },
          { date: 26, sessions: [] },
          { date: 27, sessions: [] },
        ]}
      />
    </div>
  );
}
