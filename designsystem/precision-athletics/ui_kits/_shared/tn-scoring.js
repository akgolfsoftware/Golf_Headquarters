/* Team Norway-tester — poengskala fra TN-scorekortarket (Anders 28.09.2026). Brukes i PH-14, PH-15 og AG-15.
   8-ball: avstand til mål <0,1 m = 4 · 0,1–0,99 = 3 · 1–1,99 = 2 · 2–2,99 = 1 · 3 m+ = 0.
   9 hull lengde (restavstand i fot): senket = 6 · til 1 fot = 3 · til 2 = 1 · til 4 = 0,5 · over = 0.
   Nærspill Gate (Lav/Middels/Høy × 2/3/4 m) og VISA Express (speedsone 2/3/4 m × 3): 9 slag, poeng i fritt tallfelt per slag, appen summerer.
   Kilde: «Team Norway Tester Treningsprotokoll Spiller.xlsx», fanen Scorekort TeknikTester. Wedge Gate: 9 slag (3 launch-vinduer × 3 carry-soner), hvert Treff eller Bom, resultat X / 9 treff (TeknikTester A26:F38). */
window.TN_SCORE = {
  src: "TEAM NORWAY TESTER TRENINGSPROTOKOLL SPILLER.XLSX · SCOREKORT TEKNIKTESTER",
  tests: [
    { id: "8ball", name: "8-ball", n: 8, unit: "m", mode: "auto", max: 32, rule: "<0,1 m = 4 · 0,1–0,99 = 3 · 1–1,99 = 2 · 2–2,99 = 1 · 3 m+ = 0",
      scale: [["Under 0,1 m", 4], ["0,1–0,99 m", 3], ["1–1,99 m", 2], ["2–2,99 m", 1], ["3 m eller mer", 0]],
      pts: (m) => m == null ? null : m < 0.1 ? 4 : m < 1 ? 3 : m < 2 ? 2 : m < 3 ? 1 : 0 },
    { id: "9hull", name: "9 hull lengde", n: 9, unit: "fot", mode: "auto", holed: true, max: 54, rule: "Senket = 6 · til 1 fot = 3 · til 2 = 1 · til 4 = 0,5 · over = 0",
      scale: [["Senket", 6], ["Til 1 fot", 3], ["Til 2 fot", 1], ["Til 4 fot", 0.5], ["Over 4 fot", 0]],
      pts: (ft) => ft == null ? null : ft === 0 ? 6 : ft <= 1 ? 3 : ft <= 2 ? 1 : ft <= 4 ? 0.5 : 0 },
    { id: "gate", name: "Nærspill Gate", n: 9, mode: "manual", max: null, rule: "9 slag · Lav/Middels/Høy × 2/3/4 m · poeng føres per slag · appen summerer", labels: ["Lav 2 m", "Lav 3 m", "Lav 4 m", "Middels 2 m", "Middels 3 m", "Middels 4 m", "Høy 2 m", "Høy 3 m", "Høy 4 m"] },
    { id: "visa", name: "VISA Express", n: 9, mode: "manual", max: null, rule: "9 slag · speedsone 2/3/4 m × 3 · poeng føres per slag · appen summerer", labels: ["2 m · 1", "2 m · 2", "2 m · 3", "3 m · 1", "3 m · 2", "3 m · 3", "4 m · 1", "4 m · 2", "4 m · 3"] },
    { id: "wedge", name: "Wedge Gate", n: 9, mode: "hit", max: 9, rule: "9 slag · launch <26° lav · 28–30° medium · >32° høy × carry 40 / 50 / 60 m ±3 · Treff eller Bom · resultat X / 9 treff",
      slots: ["Lav · 40 m", "Lav · 50 m", "Lav · 60 m", "Medium · 40 m", "Medium · 50 m", "Medium · 60 m", "Høy · 40 m", "Høy · 50 m", "Høy · 60 m"],
      scale: [["Launch lav", "<26°"], ["Launch medium", "28–30°"], ["Launch høy", ">32°"], ["Carry-soner", "40 · 50 · 60 m ±3"]] },
  ],
  fmt: (v) => v == null ? "—" : String(v).replace(".", ","),
};
