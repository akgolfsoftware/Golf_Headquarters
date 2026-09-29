/* Fasiliteter (runde 23, Anders 28.09.2026). Delt av PH-24 Meg og AU-04 Oppstart.
   Så mange spilleren vil, endres når som helst. Ett spørsmål om gangen med ja/nei og oppfølging ved ja.
   Dekning regnes mot de 19 treningsområdene i ordmasteren (AK_VOCAB.AREAS). */
window.FAS = (() => {
  const V = () => window.AK_VOCAB.AREAS;
  const ALL = () => [...V().fullsving, ...V().naerspill, ...V().putting, ...V().fysisk, ...V().bane];
  /* [id, spørsmål, oppfølging ved ja: [[felt, label, enhet, type]]] */
  const Q = [
    ["range", "Har fasiliteten en range?", [["rangeLen", "Lengde på rangen", "m", "num"], ["driver", "Er driver lov?", "", "yn"]]],
    ["bunker", "Er det en øvingsbunker?", [["bMin", "Korteste bunkerslag", "m", "num"], ["bMax", "Lengste bunkerslag", "m", "num"]]],
    ["chip", "Er det et chippingområde?", [["chipMax", "Lengste chip", "m", "num"]]],
    ["pitch", "Kan du slå pitch og lob?", [["pitchMax", "Lengste pitch", "m", "num"], ["lob", "Kan du slå høyt over en hindring?", "", "yn"]]],
    ["green", "Er det en puttinggreen?", [["puttMax", "Lengste putt du kan øve", "fot", "num"]]],
    ["bane", "Kan du spille på banen?", [["holes", "Antall hull", "", "num"]]],
    ["styrke", "Er det styrkerom eller treningsstudio?", []],
    ["kond", "Kan du trene kondisjon her (løpebane, sykkel, tredemølle)?", []],
    ["bev", "Er det plass til bevegelighet (matte, gulv)?", []],
  ];
  function covers(f) {
    const a = V(), out = new Set();
    if (f.range) { const L = +f.rangeLen || 0; if (f.driver && L >= 200) out.add("Utslag"); [["Innspill ca. 200 m", 200], ["Innspill ca. 150 m", 150], ["Innspill ca. 100 m", 100], ["Innspill ca. 50 m", 50]].forEach(([n, m]) => { if (L >= m) out.add(n); }); }
    if (f.chip) out.add("Chip");
    if (f.pitch) { out.add("Pitch"); if (f.lob) out.add("Lob"); }
    if (f.bunker) out.add("Bunker");
    if (f.green) { const L = +f.puttMax || 0; [["Putting 0–3 fot", 0], ["Putting 3–5 fot", 3], ["Putting 5–10 fot", 5], ["Putting 10–25 fot", 10], ["Putting 25–40 fot", 25], ["Putting 40+ fot", 40]].forEach(([n, m]) => { if (L > m || (m === 0 && L > 0)) out.add(n); }); }
    if (f.bane && +f.holes > 0) out.add("Banespill");
    if (f.styrke) out.add("Styrke");
    if (f.kond) out.add("Kondisjon");
    if (f.bev) out.add("Bevegelighet");
    return ALL().filter((x) => out.has(x));
  }
  const union = (list) => { const s = new Set(); list.forEach((f) => covers(f).forEach((x) => s.add(x))); return ALL().filter((x) => s.has(x)); };
  const demo = [
    { id: "f1", name: "Fredrikstad GK", range: true, rangeLen: 240, driver: true, bunker: true, bMin: 5, bMax: 30, chip: true, chipMax: 25, pitch: true, pitchMax: 60, lob: true, green: true, puttMax: 45, bane: true, holes: 18, styrke: false, kond: false, bev: false, updated: "12.09.2026" },
    { id: "f2", name: "WANG Toppidrett · styrkerom", range: false, bunker: false, chip: false, pitch: false, green: false, bane: false, styrke: true, kond: true, bev: true, updated: "18.08.2026" },
    { id: "f3", name: "Hjemme", range: false, bunker: false, chip: false, pitch: false, green: true, puttMax: 8, bane: false, styrke: false, kond: false, bev: true, updated: "04.05.2026" },
  ];
  return { Q, ALL, covers, union, demo };
})();
