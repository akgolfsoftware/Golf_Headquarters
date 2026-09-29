(() => {
const periods = [
  { id: "g1", type: "grunn", name: "Grunnperiode", from: 1, to: 16, budget: 416, focus: ["fys", "tek"] },
  { id: "s1", type: "spesial", name: "Spesialperiode vår", from: 17, to: 22, budget: 144, focus: ["slag", "tek"] },
  { id: "t1", type: "turnering", name: "Turneringsperiode", from: 23, to: 35, budget: 260, focus: ["turn", "spill"] },
  { id: "s2", type: "spesial", name: "Spesialperiode høst", from: 36, to: 44, budget: 216, focus: ["slag", "spill"] },
  { id: "e1", type: "evaluering", name: "Evaluering", from: 45, to: 48, budget: 48, focus: ["fys"] },
  { id: "g2", type: "grunn", name: "Grunnperiode", from: 49, to: 52, budget: 116, focus: ["fys", "tek"] },
];
const wobble = [0.96, 1.04, 1.0, 0.92, 1.08, 1.0, 0.97, 1.03];
const weeks = [];
periods.forEach((p) => {
  const n = p.to - p.from + 1, base = p.budget / n;
  for (let w = p.from; w <= p.to; w++) {
    const planned = Math.round(base * wobble[w % 8] * 2) / 2;
    weeks.push({ w, period: p.id, type: p.type, planned, done: w < 40 ? Math.round(planned * (0.86 + (w % 5) * 0.03) * 2) / 2 : 0 });
  }
});
const months = [["Jan", 1], ["Feb", 5], ["Mar", 9], ["Apr", 14], ["Mai", 18], ["Jun", 23], ["Jul", 27], ["Aug", 31], ["Sep", 36], ["Okt", 40], ["Nov", 45], ["Des", 49]];
const D = (axis, title, meta, min) => ({ id: Math.random().toString(36).slice(2, 8), axis, title, meta, min });
const sessions = [
  { id: "a", name: "Styrke underkropp", day: 0, t: "07:30", drills: [D("fys", "Oppvarming · mobilitet", "Bevegelighet", 10), D("fys", "Knebøy 4 × 6 @ 90 kg", "RIR 2", 40), D("fys", "Utfall og hoftehengsel", "3 × 8 · RIR 3", 10)] },
  { id: "b", name: "Innspill ca. 150 m", day: 0, t: "15:00", drills: [D("slag", "Innspill ca. 150 m · Automatikk", "Lengdekontroll · 40 slag · ±6 m · Treningsområde · Alene", 50), D("tek", "Innspill ca. 150 m · P6–P7 · Lav hastighet", "Kurve · 30 slag · Treningsområde · Alene", 40)] },
  { id: "c", name: "Teknikk · P-posisjoner", day: 1, t: "09:00", drills: [D("tek", "Utslag · P2–P4 · Uten ball", "Sikte og oppstilling · Innendørs · Alene", 30), D("tek", "Utslag · P6–P7 · Automatikk", "Startretning · 40 slag · Innendørs · Observert", 45)] },
  { id: "d", name: "9 hull · strategi", day: 1, t: "14:00", drills: [D("spill", "Banespill · 9 hull", "Spilleformat · 9 hull · Bane · Observert", 150)] },
  { id: "e", name: "Innspill og nærspill", day: 2, t: "14:30", drills: [D("fys", "Oppvarming", "Bevegelighet", 20), D("slag", "Innspill ca. 100 m · Automatikk", "Lengdekontroll · 30 slag · ±4 m · Treningsområde · Konkurranse", 40), D("slag", "Pitch", "Landingspunkt · 30 slag · ±2 m · Treningsområde · Alene", 30), D("spill", "Banespill · Tiger 5 analyse", "Spilleformat · siste runde", 30)] },
  { id: "f", name: "Kondisjon · intervall", day: 2, t: "18:00", drills: [D("fys", "Kondisjon · 6 × 4 min · S2", "Intervall · pulssone S2", 45)] },
  { id: "g", name: "Putting og bevegelighet", day: 3, t: "16:00", drills: [D("slag", "Putting 5–10 fot", "Lengdekontroll · 60 putter · Treningsområde · Observert", 60), D("fys", "Bevegelighet", "Hofte og thorax", 30)] },
  { id: "h", name: "Gameplan Srixon Tour", day: 4, t: "13:00", drills: [D("spill", "Banespill · Strategioppgave", "Gameplan Srixon Tour · 18 hull", 90)] },
  { id: "i", name: "Treningsturnering", day: 5, t: "08:40", drills: [D("turn", "Treningsturnering", "18 hull · brutto score", 270)] },
  { id: "j", name: "Utslag og innspill", day: 6, t: "10:00", drills: [D("slag", "Utslag · Automatikk", "Startretning · 30 slag · ±15 m · Treningsområde · Alene", 45), D("slag", "Innspill ca. 50 m · Lav hastighet", "Høyde · 30 slag · ±3 m · Treningsområde · Alene", 45)] },
];
const days = ["Man 28", "Tir 29", "Ons 30", "Tor 01", "Fre 02", "Lør 03", "Søn 04"];
const fmtH = (min) => (Math.round(min / 6) / 10).toFixed(1).replace(".", ",");
const fmtHM = (min) => Math.floor(min / 60) + ":" + String(min % 60).padStart(2, "0");
const fmtN = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
const sessionMin = (s) => s.drills.reduce((a, d) => a + d.min, 0);
const sessionAxis = (s) => { const m = {}; s.drills.forEach((d) => { m[d.axis] = (m[d.axis] || 0) + d.min; }); return Object.keys(m).sort((a, b) => m[b] - m[a])[0] || null; };
const sessionTitle = (s) => s.name || (s.drills[0] ? s.drills[0].title.split(" · ")[0] : "Ny økt");
const MIX = { grunn: { fys: 35, tek: 30, slag: 20, spill: 10, turn: 5 }, spesial: { fys: 20, tek: 20, slag: 35, spill: 20, turn: 5 }, turnering: { fys: 15, tek: 10, slag: 25, spill: 20, turn: 30 }, evaluering: { fys: 40, tek: 20, slag: 20, spill: 20, turn: 0 } };
const axisMix = (s) => { const m = {}; s.drills.forEach((d) => { m[d.axis] = (m[d.axis] || 0) + d.min; }); return ["fys", "tek", "slag", "spill", "turn"].filter((a) => m[a]).map((a) => [a, m[a]]); };
const stripe = (mix) => { const tot = mix.reduce((a, x) => a + x[1], 0); if (!tot) return "var(--border-strong)"; let acc = 0; return "linear-gradient(to bottom," + mix.map(([a, m]) => { const f = acc / tot * 100; acc += m; return "var(--axis-" + a + ") " + f + "% " + (acc / tot * 100) + "%"; }).join(",") + ")"; };
window.PM = { MIX, axisMix, stripe, periods, weeks, months, sessions, days, fmtH, fmtHM, fmtN, sessionMin, sessionAxis, sessionTitle, YEAR_TARGET: 1200, CURRENT_WEEK: 40, AXES: ["fys", "tek", "slag", "spill", "turn"] };
})();
