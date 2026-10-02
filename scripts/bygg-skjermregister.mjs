#!/usr/bin/env node
/** D01 screen register. Reads the app tree and design lists. Does not run the app or claim a route is ported. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { inventory } from "../.claude/skills/ak-hq-design/scripts/kartlegg-skjermer.mjs";
import { PRECISION_TYPER, PRECISION_KILDE, PRECISION_VERSJON, PRECISION_PROSJEKT, MARKED_MONSTRE } from "./skjermregister-typer.mjs";

const EIER = "D01-skjermregister";
const OUTPUTS = {
  json: "docs/design-system/skjermregister.json",
  csv: "docs/design-system/skjermregister.csv",
  md: "docs/design-system/skjermregister.md",
};

export function patternScore(pattern, route) {
  if (!route || !pattern) return -1;
  if (pattern === "/") return route === "/" ? 5000 : -1;
  const star = pattern.endsWith("*");
  const raw = star ? pattern.slice(0, -1).replace(/\/$/, "") : pattern;
  const pSegs = raw.split("/").filter(Boolean);
  const rSegs = route.split("/").filter(Boolean);
  if (!pSegs.length) return -1;
  if (!star) {
    if (pSegs.length !== rSegs.length) return -1;
    let statics = 0;
    let dynamics = 0;
    for (let i = 0; i < pSegs.length; i++) {
      if (pSegs[i].startsWith("[")) {
        if (!rSegs[i].startsWith("[")) return -1;
        dynamics++;
        continue;
      }
      if (pSegs[i] !== rSegs[i]) return -1;
      statics++;
    }
    return (dynamics ? 2000 : 2500) + statics * 20 + pSegs.length;
  }
  if (route === raw || route.startsWith(raw + "/")) return 1000 + raw.length;
  return -1;
}

export function bestMatch(route, types) {
  let best = null;
  let bestScore = -1;
  let bestPattern = "";
  for (const type of types) {
    for (const pattern of type.monster) {
      const score = patternScore(pattern, route);
      if (score > bestScore || (score === bestScore && score >= 0 && pattern.length > bestPattern.length)) {
        best = type;
        bestScore = score;
        bestPattern = pattern;
      }
    }
  }
  return bestScore < 0 ? null : { type: best, monster: bestPattern, score: bestScore };
}

export function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:\\])\/\/.*$/gm, "$1");
}

/** A redirect import used as an auth gate is not a retired route. JSX means the file is a screen. */
export function navigationKind(source) {
  const code = stripComments(source);
  if (/(^|[^A-Za-z0-9_$.])<\/?[A-Za-z]/.test(code)) return null;
  const redirect = code.match(/\b(?:permanentRedirect|redirect)\s*\(\s*['"`]([^'"`]+)['"`]/);
  if (redirect) return { kind: "videresending", target: redirect[1].split("?")[0] };
  if (/\b(?:permanentRedirect|redirect)\s*\(/.test(code)) return { kind: "videresending", target: null };
  if (/\bnotFound\s*\(/.test(code)) return { kind: "notFound" };
  return null;
}

function firstId(source, re) {
  const head = source.split("\n").slice(0, 40).join("\n");
  const match = head.match(re);
  return match ? match[1] : null;
}

function rolleFor(route, area) {
  if (area === "playerhq") return "spiller";
  if (area === "agencyos" || area === "personlig-arbeidsflate") return "trener";
  if (area === "forelder") return "foresatt";
  if (area === "delt-innsyn") return "ekstern-leser";
  if (route.startsWith("/team-wang")) return "elev-eller-trener";
  if (route.startsWith("/team-norway")) return "team-norway";
  if (route.startsWith("/gfgk") || route === "/team-gfgk") return "åpen";
  if (area === "interne-eksempler" || route === "/skjermer") return "intern";
  return "åpen";
}

function markdownRows(md) {
  const rows = [];
  for (const line of md.split("\n")) {
    if (!/^\|/.test(line) || /^\|\s*-/.test(line)) continue;
    const cells = line.split("|").slice(1, -1).map((cell) => cell.trim().replaceAll("`", ""));
    if (cells.length < 5 || cells[0] === "ID") continue;
    rows.push(cells);
  }
  return rows;
}

function routePath(cell) {
  const token = cell.split(/\s+/)[0];
  if (!token.startsWith("/")) return null;
  return token.split("?")[0];
}

function loadNamedRoutes(md, idRe) {
  const byPath = new Map();
  const rows = [];
  for (const cells of markdownRows(md)) {
    if (!idRe.test(cells[0])) continue;
    const raw = cells[3];
    if (/\(over\)/i.test(raw)) continue;
    if (/alle ruter|\(layout\)/i.test(raw)) {
      rows.push({ id: cells[0], navn: cells[1], roller: cells[4], path: null, query: false, note: raw });
      continue;
    }
    const path = routePath(raw);
    if (!path) continue;
    const row = { id: cells[0], navn: cells[1], roller: cells[4], path, query: raw.includes("?"), note: raw };
    rows.push(row);
    const list = byPath.get(path) ?? [];
    list.push(row);
    byPath.set(path, list);
  }
  return { byPath, rows };
}

function nearestPrecision(route) {
  const rSegs = route.split("/").filter(Boolean);
  let best = null;
  let bestScore = 0;
  for (const type of PRECISION_TYPER) {
    for (const pattern of type.monster) {
      const pSegs = pattern.replace(/\*$/, "").split("/").filter(Boolean);
      let score = 0;
      let ok = true;
      const limit = Math.min(pSegs.length, rSegs.length);
      for (let i = 0; i < limit; i++) {
        if (pSegs[i].startsWith("[")) score += 1;
        else if (pSegs[i] === rSegs[i]) score += 10;
        else {
          ok = false;
          break;
        }
      }
      if (ok && score > bestScore) {
        best = type;
        bestScore = score;
      }
    }
  }
  if (bestScore <= 10) return null;
  return best;
}

const PRECISION_VISNING = [
  ["PH01IDag", "Siden monterer PH01IDag i PlayerHQSkall. Det er kodebevis for visningen, ikke kontroll i appen. ui_kits/playerhq/screens/PH-01.jsx ligger ikke i git."],
  ["PH10Plan", "Siden monterer PH10Plan i PlayerHQSkall. Uke, forslag, flytting og ny økt er beholdt. 390×844 og 1440×880 er ikke målt mot tegningen. ui_kits/playerhq/screens/PH-10.jsx ligger ikke i git."],
];

function merkVisning(row, source) {
  if (row.kobling !== "tegnet-skjermtype") return;
  const hit = PRECISION_VISNING.find(([marker]) => source.includes(marker));
  if (!hit) return;
  row.status.implementert = "precision-visning";
  row.kontrollbevis = hit[1];
  row.avvik.push("Ikke kontrollert i appen på 390×844 og 1440×880, og ikke sammenlignet med tegningsfilen. Den mangler i git.");
}

function emptyStatus(extra) {
  return {
    kartlagt: true,
    wireframe: false,
    uiUtkast: false,
    prototype: false,
    vurdert: false,
    valgtForBygging: false,
    implementert: "ikke-verifisert",
    kontrollertIApp: false,
    ...extra,
  };
}

function formater(natt) {
  return {
    mobil: "ikke-kontrollert",
    nettbrett: "ikke-kontrollert",
    desktop: "ikke-kontrollert",
    natt: natt ? "pavkrevd-ikke-kontrollert" : "ikke-relevant",
  };
}

function baseRow(page, route) {
  return {
    screenId: null,
    rute: route,
    kildefil: page.source,
    omrade: page.area,
    rolle: rolleFor(route ?? "", page.area),
    designkilde: null,
    designversjon: null,
    komponentmonster: null,
    handlinger: "ikke-avlest-i-D01",
    dataApi: "ikke-avlest-i-D01",
    tilstander: ["tom", "laster", "feil"],
    formater: formater(false),
    status: emptyStatus(),
    eier: EIER,
    kontrollbevis: null,
    avvik: [],
    kobling: null,
    forklaring: null,
    legacyGruppe: page.legacyGroup,
    naermesteSkjermtype: null,
    sammeSidefil: [],
    videresendingMal: null,
    kodekommentar: null,
  };
}

const OVERLEGG = [
  ["OV-DIALOG", "Dialog", "Bekreftelse og skjema som ligger over en side"],
  ["OV-ARK", "Ark", "Bunnark og sideark, inkludert øktdetalj der den ikke er egen rute"],
  ["OV-MENY", "Meny", "Navigasjon, overflow og kontekstmeny"],
  ["OV-TOAST", "Toast", "Kort bekreftelse etter lagring"],
  ["OV-KONFLIKT", "Konflikt", "Samtidig redigering og utdatert versjon"],
  ["OV-OFFLINE", "Offline", "Handling uten nett, i tillegg til siden /offline"],
  ["OV-TILGANG", "Tilgangsavslag", "Innlogget bruker uten rett, og utløpt eller avvist deling"],
  ["OV-OPPLASTING", "Opplasting", "Fil, video og lyd før og etter sending"],
  ["OV-BETALING", "Betaling", "Stripe/Vipps-steg som ikke er en page.tsx"],
  ["OV-BEKREFT", "Bekreftelse", "Siste steg før en destruktiv eller bindende handling"],
  ["OV-404", "Ikke funnet", "src/app/not-found.tsx, ikke en page.tsx. SY-01 tegner tilstanden."],
  ["OV-500", "Serverfeil", "src/app/global-error.tsx og src/app/error.tsx. SY-01 tegner tilstanden."],
];

export function buildRegister(root) {
  const data = inventory(root);
  const wang = loadNamedRoutes(readFileSync(resolve(root, "designsystem/wang/SKJERMREGISTER.md"), "utf8"), /^[ABCD]\d+$/);
  const tn = loadNamedRoutes(readFileSync(resolve(root, "designsystem/team-norway/handover/SKJERMREGISTER.md"), "utf8"), /^TN-\d+$/);
  const tnById = new Map(tn.rows.filter((row) => row.path).map((row) => [row.id, row]));
  const wangTypes = [...wang.byPath.entries()].map(([path, rows]) => ({
    id: path,
    navn: path,
    monster: [path.includes("[") ? path : path],
    rows,
  }));
  const tnTypes = [...tn.byPath.entries()].map(([path, rows]) => ({ id: path, navn: path, monster: [path], rows }));

  const pages = data.pages.filter((page) => page.route);
  const review = data.pages.filter((page) => !page.route);
  const sider = [];

  for (const page of pages) {
    const route = page.route;
    const source = readFileSync(resolve(root, page.source), "utf8");
    const row = baseRow(page, route);
    const nav = navigationKind(source);
    const precisionHit = bestMatch(route, PRECISION_TYPER);
    const commentPrecision = firstId(source, /\b((?:PH|AG|FO|AU|BK|ST|GJ|SY)-\d+)\b/);
    const commentTn = firstId(source, /\b(TN-\d{2})\b/);
    row.kodekommentar = commentPrecision ?? commentTn;

    if (nav?.kind === "videresending") {
      row.kobling = "videresending";
      row.screenId = "VIDERESENDING";
      row.designkilde = "kode";
      row.designversjon = "ikke-en-skjerm";
      row.videresendingMal = nav.target;
      row.handlinger = nav.target ? `Send videre til ${nav.target}` : "Send videre til et mål som ikke er en fast adresse i filen";
      row.tilstander = ["videresending", "manglende-mal"];
      row.forklaring = nav.target
        ? `Filen har ingen egen visning. Den sender til ${nav.target}. At målet finnes, og hva brukeren ser hvis lenken er ugyldig, er ikke prøvd i denne bolken.`
        : "Filen sender videre, men målet er ikke en fast adresse. Det er ikke prøvd.";
      if (page.redirectCandidate === false) row.avvik.push("Klassifisert som videresending fra kode, selv om inventarets redirectCandidate var false.");
    } else if (nav?.kind === "notFound") {
      row.kobling = "teknisk-forklaring";
      row.screenId = "AVSLATT";
      row.designkilde = "kode";
      row.designversjon = "ikke-tegnet";
      row.handlinger = "Vis ikke siden";
      row.tilstander = ["ikke-funnet"];
      row.forklaring = route === "/team-gfgk"
        ? "Siden er slått av med notFound() fordi den viste juniorresultater uten samtykke. Skjermlisten 26.09.2026 sier at den ikke tegnes."
        : "Filen kaller notFound() og har ingen egen visning. Årsaken må leses i kildefilen før ruten tas i bruk.";
    } else if (page.area === "interne-eksempler" || route === "/skjermer") {
      row.kobling = "intern-flate";
      row.screenId = route.startsWith("/demos") ? "INTERN-DEMO" : "INTERN-LAB";
      row.designkilde = "intern";
      row.designversjon = "ikke-brukerflate";
      row.rolle = "intern";
      row.forklaring = route.startsWith("/demos")
        ? "Intern demovisning. Den er ikke en Precision-skjerm og skal ikke porteres som brukerflate uten eget vedtak."
        : "Intern katalog eller designlab. Den er ikke en del av de 74 godkjente skjermtypene.";
    } else if (precisionHit && !route.startsWith("/team-norway") && !route.startsWith("/team-wang")) {
      const type = precisionHit.type;
      row.kobling = "tegnet-skjermtype";
      row.screenId = type.id;
      row.designkilde = `AK Golf Precision Athletics (${PRECISION_PROSJEKT})`;
      row.designversjon = PRECISION_VERSJON;
      row.komponentmonster = precisionHit.monster;
      row.handlinger = type.maVise;
      row.formater = formater(type.natt);
      row.status.uiUtkast = true;
      row.status.valgtForBygging = true;
      row.forklaring = `${type.id} ${type.navn} er valgt skjermtype i skjermlisten 26.09.2026. Anders har godkjent Precision-skjermene som design. Denne ruten er ikke kontrollert i appen i D01.`;
      if (commentPrecision && commentPrecision !== type.id) {
        row.avvik.push(`Kodekommentaren sier ${commentPrecision}. Skjermlisten sier ${type.id}. Kommentaren er opphav, ikke en ny godkjenning.`);
      }
    } else if (route.startsWith("/team-wang")) {
      const hit = bestMatch(route, wangTypes);
      const matches = hit ? wang.byPath.get(hit.type.id) ?? [] : [];
      const exact = matches.filter((item) => !item.query);
      const primary = exact.find((item) => item.id === "A2") ?? exact[0] ?? matches[0];
      if (primary) {
        row.kobling = "byggeunderlag";
        row.screenId = primary.id;
        row.rolle = primary.roller;
        row.designkilde = "designsystem/wang/SKJERMREGISTER.md";
        row.designversjon = "wang-lokalt-35-ikke-59-fasit";
        row.handlinger = primary.navn;
        row.sammeSidefil = matches.filter((item) => item.id !== primary.id).map((item) => `${item.id} ${item.navn}`);
        row.forklaring = `Lokal WANG-rad ${primary.id} ${primary.navn}. De 59 skjermene i Claude Design er fasit og ligger ikke i git. Lokal rad er byggeunderlag for rute og rolle, ikke visuell godkjenning, og appen er ikke kontrollert i denne bolken.`;
        if (row.sammeSidefil.length) row.forklaring += ` Samme sidefil dekker også: ${row.sammeSidefil.join("; ")}.`;
      } else {
        row.kobling = "teknisk-forklaring";
        row.screenId = "WANG-UTEN-RAD";
        row.designkilde = "designsystem/wang/SKJERMREGISTER.md";
        row.designversjon = "wang-lokalt-35-ikke-59-fasit";
        row.forklaring = "App-ruten finnes, men ingen av de 35 lokale WANG-radene peker på den. Den slettes ikke. Kobling til den 59-skjermers prototypen gjenstår i D03.";
      }
    } else if (route.startsWith("/team-norway")) {
      const hit = bestMatch(route, tnTypes);
      const matches = hit ? tn.byPath.get(hit.type.id) ?? [] : [];
      const primary = matches[0];
      row.designkilde = "designsystem/team-norway/handover/SKJERMREGISTER.md";
      row.designversjon = "tn-handover-00-21-ikke-visuell-fasit";
      if (primary) {
        row.kobling = "byggeunderlag";
        row.screenId = primary.id;
        row.rolle = primary.roller;
        row.handlinger = primary.navn;
        row.forklaring = `Handover-rad ${primary.id} ${primary.navn} treffer ruten. Claw er ikke lenger visuell fasit (22.09.2026). TN-22–TN-27 og de 34 dyp-lenkene ligger i Claude Design, ikke i dette registerets kildefil. Appen er ikke kontrollert i D01.`;
        if (commentTn && commentTn !== primary.id) {
          const other = tnById.get(commentTn);
          row.avvik.push(other
            ? `Kodekommentaren sier ${commentTn}, som i handover er «${other.navn}» på ${other.path}. Handover-ruten beholder ${primary.id}. Kommentaren er opphav, ikke godkjenning.`
            : `Kodekommentaren sier ${commentTn}. Handover-ruten beholder ${primary.id}. Kommentaren er opphav, ikke godkjenning.`);
        }
      } else if (commentTn) {
        const other = tnById.get(commentTn);
        row.kobling = "teknisk-forklaring";
        row.screenId = "TN-UTEN-RAD";
        row.handlinger = "ikke-avlest-i-D01";
        row.forklaring = `Ingen handover-rad har ruten ${route}. Kodekommentaren sier ${commentTn}. Det er opphav, ikke en godkjenning, og ID-en brukes ikke som register-ID fordi den kan bety en annen skjerm i handover.`;
        row.avvik.push(other
          ? `${commentTn} i kommentaren er allerede ${other.navn} på ${other.path}.`
          : `${commentTn} finnes ikke som rute i handover TN-00–TN-21. Den kan tilhøre TN-22–TN-27 i Claude Design.`);
      } else {
        row.kobling = "teknisk-forklaring";
        row.screenId = "TN-UTEN-RAD";
        row.forklaring = "App-ruten finnes uten rad i handover TN-00–TN-21 og uten TN-kommentar i filhodet. Den slettes ikke. D04 må koble den til TN-22–TN-27 eller en dyp-lenke.";
      }
    } else {
      const market = bestMatch(route, MARKED_MONSTRE);
      if (market) {
        row.kobling = "felles-monster";
        row.screenId = market.type.id;
        row.designkilde = "avventer";
        row.designversjon = "markedssidene-venter";
        row.komponentmonster = market.monster;
        row.handlinger = market.type.navn;
        row.forklaring = `${market.type.id} ${market.type.navn}. Designautoriteten sier at markedssidene venter. Mønsteret forklarer ruten; det er ikke en valgt Precision-versjon og ikke en appkontroll.`;
      } else {
        const near = nearestPrecision(route);
        row.kobling = "teknisk-forklaring";
        row.screenId = "UTEN-TEGNET-TYPE";
        row.designkilde = PRECISION_KILDE;
        row.designversjon = PRECISION_VERSJON;
        row.naermesteSkjermtype = near ? `${near.id} ${near.navn}` : null;
        row.forklaring = near
          ? `Ingen tegnet skjermtype treffer ruten eksakt. Nærmeste type er ${near.id} ${near.navn}, men det er et hint, ikke en tildeling. Ruten beholdes til D02 avgjør om den hører til typen, er et eget mønster eller er en videresending.`
          : "Ingen tegnet skjermtype ligger i nærheten av ruten. Ruten beholdes og må forklares før den porteres eller skjules.";
        if (commentPrecision) row.avvik.push(`Kodekommentaren sier ${commentPrecision}, men skjermlisten har ingen treff. Kommentaren er opphav, ikke godkjenning.`);
      }
    }

    merkVisning(row, source);

    if (!row.forklaring || !row.eier || !row.kobling || !row.screenId) {
      throw new Error(`Ufullstendig rad: ${page.source}`);
    }
    sider.push(row);
  }

  const dekningshull = (named) => named.rows.filter((row) => {
    if (!row.path) return true;
    return !sider.some((side) => patternScore(row.path, side.rute) >= 2000 && side.kobling !== "videresending");
  }).map((row) => ({ id: row.id, navn: row.navn, rute: row.note }));
  const register = {
    schemaVersion: 1,
    metode: "Én rad per sidefil fra kartlegg-skjermer.mjs. Precision-treff kommer fra den eksplisitte 74-listen. WANG og Team Norway treffer lokalt byggeunderlag, ikke Claude Design-fasiten. Ren redirect/notFound uten JSX er teknisk forklaring. redirectCandidate alene er ikke bevis. Ingen rad er kontrollert i appen.",
    kodeversjon: execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim(),
    inventar: data.totals,
    presisjon: { skjermtyper: PRECISION_TYPER.length, kilde: PRECISION_KILDE, versjon: PRECISION_VERSJON, prosjekt: PRECISION_PROSJEKT },
    ruterUtenMonster: review.map((page) => page.source),
    dekningshull: {
      wang: dekningshull(wang),
      teamNorway: dekningshull(tn),
    },
    overlegg: OVERLEGG.map(([id, navn, forklaring]) => ({
      screenId: id,
      navn,
      kobling: "overlegg",
      forklaring: `${forklaring.replace(/\.$/, "")}. Ikke funnet automatisk. Må kobles til inngangen som åpner det under rutevis portering.`,
      status: emptyStatus(),
      eier: EIER,
      kontrollbevis: null,
    })),
    sider: sider.sort((a, b) => a.kildefil.localeCompare(b.kildefil, "en")),
  };
  register.tellinger = tell(register);
  return register;
}

function tell(register) {
  const kobling = {};
  const screenId = {};
  for (const row of register.sider) {
    kobling[row.kobling] = (kobling[row.kobling] ?? 0) + 1;
    screenId[row.screenId] = (screenId[row.screenId] ?? 0) + 1;
  }
  return {
    sidefiler: register.sider.length,
    medAvvik: register.sider.filter((row) => row.avvik.length).length,
    valgtForBygging: register.sider.filter((row) => row.status.valgtForBygging).length,
    utenEksaktType: register.sider.filter((row) => row.screenId === "UTEN-TEGNET-TYPE").length,
    implementert: register.sider.filter((row) => row.status.implementert !== "ikke-verifisert").length,
    kontrollertIApp: register.sider.filter((row) => row.status.kontrollertIApp).length,
    kobling,
    screenId,
  };
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export function renderCsv(register) {
  const header = ["kildefil", "rute", "omrade", "kobling", "screenId", "designkilde", "designversjon", "rolle", "valgtForBygging", "implementert", "naermesteSkjermtype", "videresendingMal", "eier", "forklaring", "avvik"];
  const lines = [header.join(",")];
  for (const row of register.sider) {
    lines.push([
      row.kildefil, row.rute, row.omrade, row.kobling, row.screenId, row.designkilde, row.designversjon, row.rolle,
      row.status.valgtForBygging, row.status.implementert, row.naermesteSkjermtype, row.videresendingMal, row.eier,
      row.forklaring, row.avvik.join(" "),
    ].map(csvCell).join(","));
  }
  return lines.join("\n") + "\n";
}

function countTable(map) {
  return Object.entries(map).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "en"))
    .map(([key, value]) => `| ${key} | ${value} |`).join("\n");
}

export function renderMarkdown(register) {
  const gap = register.sider.filter((row) => row.screenId === "UTEN-TEGNET-TYPE" || row.screenId === "WANG-UTEN-RAD" || row.screenId === "TN-UTEN-RAD");
  const collisions = register.sider.filter((row) => row.avvik.some((item) => item.startsWith("Kodekommentaren")));
  const lines = [
    "# Skjermregister — D01",
    "",
    "Kodeversjonen registeret ble generert mot står i `kodeversjon` i [JSON](skjermregister.json). Feltet endres bare ved `--write` og er ikke et bevis på at en senere commit fortsatt har samme ruter.",
    "",
    "Dette er koblingen fra hver sidefil til en skjermtype, et mønster eller en undersøkt forklaring. Det er ikke bevis på at skjermen er portert, at dataene er ekte, eller at Anders har sett appen.",
    "",
    "Kilder: [skjermlisten](skjermliste-precision-athletics.md), [designautoriteten](design-autoritet.md), [WANG-byggeunderlaget](../../designsystem/wang/SKJERMREGISTER.md), [Team Norway-handover](../../designsystem/team-norway/handover/SKJERMREGISTER.md), [porteringsplanen](../planer/portering-alle-skjermer-2026-10-02.md).",
    "",
    "Rader: [JSON](skjermregister.json) og [CSV](skjermregister.csv). Regenerer med `node scripts/bygg-skjermregister.mjs --write`. `npm run prosjekt:sjekk` feiler hvis filene driver fra koden.",
    "",
    "## Inventar",
    "",
    `Sidefiler med rute: **${register.tellinger.sidefiler}**. Unike rutemønstre i skanningen: ${register.inventar.uniqueRoutePatterns}. Komponentfiler: ${register.inventar.componentFiles}. Ramme- og tilstandsfiler: ${register.inventar.surfaceFiles}.`,
    "",
    "Porteringsplanen talte 520 da den ble skrevet. Denne skanningen er tatt på kodeversjonen over og kan være høyere. Interne eksempler inngår. Ingen rute er slettet.",
    "",
    "| Område | Sidefiler |",
    "|---|---:|",
    ...Object.entries(register.inventar.byArea).sort((a, b) => a[0].localeCompare(b[0], "en")).map(([key, value]) => `| ${key} | ${value} |`),
    "",
    "## Kobling",
    "",
    "| Kobling | Rader |",
    "|---|---:|",
    countTable(register.tellinger.kobling),
    "",
    `${register.tellinger.valgtForBygging} rader treffer en av de ${register.presisjon.skjermtyper} Precision-typene og er derfor merket valgt for bygging som design. ${register.tellinger.utenEksaktType} rader har ingen eksakt type. ${register.tellinger.medAvvik} rader har et registrert avvik. ${register.tellinger.implementert} rader har en Precision-visning i koden. ${register.tellinger.kontrollertIApp} er kontrollert i appen.`,
    "",
    "## Uten eksakt type",
    "",
    "Tabellen er Precision-ruter uten treff i 74-listen, pluss WANG- og Team Norway-ruter uten rad i det lokale byggeunderlaget. Hintet er ikke en tildeling.",
    "",
    "| Rute | ID | Nærmeste |",
    "|---|---|---|",
    ...gap.map((row) => `| \`${row.rute}\` | ${row.screenId} | ${row.naermesteSkjermtype ?? "—"} |`),
    "",
    "## Kommentar mot liste",
    "",
    collisions.length ? "| Rute | Valgt ID | Avvik |\n|---|---|---|\n" + collisions.map((row) => `| \`${row.rute}\` | ${row.screenId} | ${row.avvik[0]} |`).join("\n") : "Ingen.",
    "",
    "## Byggeunderlag uten sidefil",
    "",
    "Disse lokale radene har ingen page.tsx. De kan være faner, layout eller fortsatt uteglemt.",
    "",
    "| Register | ID | Rute |",
    "|---|---|---|",
    ...register.dekningshull.wang.map((row) => `| WANG | ${row.id} | ${row.rute} |`),
    ...register.dekningshull.teamNorway.map((row) => `| Team Norway | ${row.id} | ${row.rute} |`),
    "",
    "## Overlegg",
    "",
    "Kartleggingen finner ikke dialoger. Radene under er krav, ikke funn.",
    "",
    "| ID | Forklaring |",
    "|---|---|",
    ...register.overlegg.map((row) => `| ${row.screenId} | ${row.forklaring} |`),
    "",
    "## Bevisgrense",
    "",
    "- En treff på PH-, AG-, FO-, AU-, BK-, ST-, GJ- eller SY- er en designkobling.",
    "- WANG- og Team Norway-ID-er fra repoet er byggeunderlag. 59 WANG-skjermer og TN-22–TN-27 ligger i Claude Design.",
    "- En grønn test, en åpen Precision-PR eller en gammel kodekommentar er ikke mergebevis og ikke visuell appkontroll.",
    "- Åpne Precision-PR-er skal vurderes én for én. Denne bolken merger ingen av dem.",
    "",
  ];
  return lines.join("\n");
}

export function outputs(register) {
  return {
    [OUTPUTS.json]: JSON.stringify(register, null, 2) + "\n",
    [OUTPUTS.csv]: renderCsv(register),
    [OUTPUTS.md]: renderMarkdown(register),
  };
}

function withoutRevision(register) {
  const copy = structuredClone(register);
  copy.kodeversjon = null;
  return JSON.stringify(copy);
}

function main() {
  const mode = process.argv.includes("--check") ? "check" : process.argv.includes("--write") ? "write" : null;
  if (!mode || process.argv.includes("--help")) {
    console.error("Bruk: node scripts/bygg-skjermregister.mjs --write|--check");
    process.exitCode = 1;
    return;
  }
  const root = process.cwd();
  const fresh = buildRegister(root);
  const rendered = outputs(fresh);
  if (mode === "write") {
    for (const [file, content] of Object.entries(rendered)) writeFileSync(resolve(root, file), content);
  } else {
    const drift = [];
    for (const [file, content] of Object.entries(rendered)) {
      const current = readFileSync(resolve(root, file), "utf8");
      const same = file.endsWith(".json")
        ? withoutRevision(JSON.parse(current)) === withoutRevision(JSON.parse(content))
        : current === content;
      if (!same) drift.push(file);
    }
    if (drift.length) {
      console.error(`Skjermregisteret er utdatert:\n${drift.join("\n")}\nKjør node scripts/bygg-skjermregister.mjs --write`);
      process.exitCode = 1;
      return;
    }
  }
  console.log(JSON.stringify({ mode, ...fresh.tellinger, inventar: fresh.inventar.byArea }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main();
