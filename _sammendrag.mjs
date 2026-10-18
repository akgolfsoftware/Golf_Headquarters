import fs from "node:fs";
const L = fs.readFileSync("rapport/maskin.jsonl", "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
for (const l of L) if (l.smaaTreffmal > 0 && /^Hopp/.test(l.smaaEks?.[0] ?? "")) { l.smaaTreffmal--; l.smaaEks = l.smaaEks.slice(1); }
const by = new Map();
for (const l of L) { const k = l.screenId + "|" + l.rute; if (!by.has(k)) by.set(k, { screenId: l.screenId, rute: l.rute, omrade: l.omrade, kobling: l.kobling, rolle: l.rolle, viaCoach: l.viaCoach, w: {} }); by.get(k).w[l.bredde] = l; }
const rows = [];
for (const r of by.values()) {
  const ws = Object.values(r.w); const rod = [], gul = [];
  let status;
  const ikke = ws.find((x) => x.ikkeTestet);
  const dyn = /\[/.test(r.rute);
  const fo = r.rute.startsWith("/forelder");
  const ids404 = ws.every((x) => x.is404) && dyn && r.rolle !== "anon";
  const wangSkole = /^\/(team-wang|team-norway)/.test(r.rute);
  if (ikke) { status = "IKKE TESTET"; rod.push(ikke.ikkeTestet); }
  else if (ws.every((x) => x.sluttUrl && /^\/(auth\/login|auth\?)/.test(x.sluttUrl)) && !/^\/auth/.test(r.rute)) { status = "IKKE TESTET"; rod.push("sendt til innlogging (rolle mangler)"); }
  else if (fo && ws.every((x) => /^\/admin/.test(x.sluttUrl ?? ""))) { status = "IKKE TESTET"; rod.push("krever forelder-innlogging (passord avvist); coach sendes til /admin"); }
  else if (ids404) { status = "IKKE TESTET"; rod.push(r.viaCoach ? "ID tilhører spillerkonto (spillerinnlogging feilet); 404 som coach" : "dynamisk rute ga 404 med funnet ID"); }
  else {
    for (const x of ws) {
      const b = x.bredde;
      if (x.feil) rod.push(`${b}: ${x.feil}`);
      if (x.krasj && !x.feil) rod.push(`${b}: feilside/krasj`);
      if (x.is404 && !x.krasj) rod.push(`${b}: 404`);
      if ((x.status ?? 200) >= 400 && !x.is404) rod.push(`${b}: HTTP ${x.status}`);
      if (x.sidelengs) rod.push(`${b}: sidelengs rulling (${x.scrollWidth}>${x.clientWidth})`);
      if (x.konsollfeil?.length) rod.push(`${b}: konsollfeil (${x.konsollfeil.length}) ${x.konsollfeil[0].replace(/\s+/g, " ").replace(/%c|%s|%o|background:[^;]*;/g, "").slice(0, 70).trim()}`);
      if (x.tom) rod.push(`${b}: tom side`);
      if (x.utenforElementer > 3) rod.push(`${b}: ${x.utenforElementer} noder utenfor`); else if (x.utenforElementer > 0) gul.push(`${b}: ${x.utenforElementer} node(r) utenfor`);
      if (x.smaaTreffmal > 5) rod.push(`${b}: ${x.smaaTreffmal} små treffmål (f.eks. ${x.smaaEks.slice(0,2).join(", ")})`); else if (x.smaaTreffmal > 0) gul.push(`${b}: ${x.smaaTreffmal} små treffmål (<${x.terskelPx}px)`);
      if (x.demo?.length) gul.push(`demotekst: ${x.demo.join("/")}`);
    }
    const d = ws.map((x) => x.design); const dd = [...new Set(d)];
    const ok = (x) => ["precision", "wang", "tn"].includes(x);
    if (!d.every(ok)) rod.push(`gammelt design (${dd.join("/")})`);
    if (r.rute.startsWith("/team-norway") && !d.every((x) => x === "tn" || x === "precision")) {}
    status = rod.length ? "RØD" : gul.length ? "GUL" : "GRØNN";
  }
  const sluttUrl = ws.find((x) => x.sluttUrl)?.sluttUrl;
  const vid = ws.some((x) => x.videresendt) ? ` → ${sluttUrl}` : "";
  const design = [...new Set(ws.map((x) => x.design).filter(Boolean))].join("/");
  rows.push({ ...r, status, funn: [...new Set([...rod, ...gul])], design, vid });
}
fs.writeFileSync("rapport/_status.json", JSON.stringify(rows.map(({ w, ...r }) => r)));
const omr = [...new Set(rows.map((r) => r.omrade))];
const S = ["GRØNN", "GUL", "RØD", "IKKE TESTET"];
let md = `# Maskinmåling av skjermer\n\nDato: 2026-10-05. Måling mot lokal dev-server (worktree maskinsjekk, origin/main 1afdd40e0), lyst tema, bredde 390 og 1440.\n\n## Metode og markører\n- Precision Athletics: elementet \`.pa-root[data-design="precision-athletics"]\` finnes (skallene PlayerHQSkall/AgencyOSSkall/ForelderSkall og markedslayout setter det).\n- WANG: \`.wang-app\` / \`.wang-tp\` på layouten i src/app/team-wang/layout.tsx. Team Norway: ruten er under /team-norway og CSS-variabelen \`--tn-navy-900\` er definert (team-norway-tokens.css). Alt annet regnes som «gammelt».\n- Treffmål: synlige a/button/input/select/textarea/[role=button|tab|checkbox|switch] med minste side under 44 px (390 og 1440 brukes 44 px opptil 1024 px bredde og 32 px over, som i tests/visual/precision/maal.mjs). Inline lenker i løpende tekst er ikke talt.\n- Sidelengs rulling: scrollWidth > clientWidth. Noder utenfor: synlige elementer med høyre kant utenfor viewport som ikke er klippet av en overflow-beholder.\n- GRØNN = laster, ingen konsollfeil, ingen sidelengs rulling, riktig designsystem, ingen avvik. GUL = 1-5 små treffmål, 1-3 noder utenfor eller demotekst. RØD = feil/feilside/404/sidelengs/konsollfeil/tom/gammelt design/mange avvik. IKKE TESTET = mangler ID eller innlogging.\n- Innlogging: coach (OK), spiller og forelder feilet (passordet i SCREENTEST_PASSWORD avvises for screentest@ og screentest-parent@). Spillerruter er derfor målt som coach (coach kan åpne /portal med egne data); ID-ruter som tilhører spillerkontoen er IKKE TESTET. /forelder sender coach til /admin: IKKE TESTET.\n- Konsollfeil kan komme fra manglende database-tabeller og dev-modus (f.eks. public.test_day_events), ikke bare fra siden.\n\n## Totalt\n\n| Område | ${S.join(" | ")} | Sum |\n|---|${S.map(() => "---").join("|")}|---|\n`;
for (const o of omr) { const rs = rows.filter((r) => r.omrade === o); md += `| ${o} | ${S.map((s) => rs.filter((r) => r.status === s).length).join(" | ")} | ${rs.length} |\n`; }
md += `| **Sum** | ${S.map((s) => rows.filter((r) => r.status === s).length).join(" | ")} | ${rows.length} |\n`;
for (const o of omr) {
  md += `\n## ${o}\n\n| screenId | rute | status | funn |\n|---|---|---|---|\n`;
  for (const r of rows.filter((r) => r.omrade === o)) md += `| ${r.screenId} | ${r.rute}${r.vid} | ${r.status} | ${[r.design && `design: ${r.design}`, ...r.funn].filter(Boolean).join("; ").replace(/\|/g, "/")} |\n`;
}
fs.writeFileSync("rapport/maskin.md", md);
console.log(md.split("## playerhq")[0].split("## Totalt")[1]);
