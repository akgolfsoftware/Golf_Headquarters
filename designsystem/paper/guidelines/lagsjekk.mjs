/* Lagmedlemskaps-sjekk — kompileringssjekk, ikke sjekklistepunkt.
 *
 * Bakgrunn (28.07.2026): Avatar, StatusBadge og SectionLabel ble meldt
 * kodeferdig uten @layer i det hele tatt, og Button hadde lagdeklarasjonen
 * men alle regler utenfor blokken. Forfatterens feiing målte feil egenskap:
 * «filen inneholder @layer» i stedet for «reglene ligger inne i blokken».
 * Samme feilklasse som riggen som meldte grønt uten å måle.
 *
 * Kjøres av verifikatør og av forfatter når som helst:
 *   node guidelines/lagsjekk.mjs        — rapport
 *   node guidelines/lagsjekk.mjs --json — maskinlesbar
 * Nettleser: åpne guidelines/lagsjekk.html
 */
export function analyserFil(kildetekst) {
  const lagBlokker = [];
  const re = /@layer\s+(akhq-[a-z]+)\s*\{/g;
  let m;
  while ((m = re.exec(kildetekst))) {
    /* Finn matchende } ved å telle klammer — @layer-blokker inneholder nestede regler. */
    let dybde = 1, i = re.lastIndex;
    while (i < kildetekst.length && dybde > 0) {
      if (kildetekst[i] === "{") dybde++;
      else if (kildetekst[i] === "}") dybde--;
      i++;
    }
    lagBlokker.push({ lag: m[1], innhold: kildetekst.slice(re.lastIndex, i - 1), fra: m.index, til: i });
  }
  const iLag = new Set();
  const perLag = {};
  for (const b of lagBlokker) {
    perLag[b.lag] = perLag[b.lag] || new Set();
    for (const k of b.innhold.matchAll(/\.(akhq-[a-z0-9-]+)/g)) { iLag.add(k[1]); perLag[b.lag].add(k[1]); }
  }
  /* Alt utenfor lagblokkene. */
  let utenfor = kildetekst;
  for (const b of [...lagBlokker].reverse()) utenfor = utenfor.slice(0, b.fra) + utenfor.slice(b.til);
  const utenforKlasser = new Set();
  for (const k of utenfor.matchAll(/\.(akhq-[a-z0-9-]+)\s*(?=[.,:[>+~){\s])/g)) utenforKlasser.add(k[1]);
  /* JSX-referanser (className) er ikke CSS-deklarasjoner — fjern dem. */
  for (const k of utenfor.matchAll(/["'`]\s*akhq-[a-z0-9-]+/g)) { /* ignorert */ }
  const deklarert = new Set();
  for (const linje of utenfor.split("\n")) {
    const t = linje.trim();
    if (!t.startsWith(".akhq-")) continue;
    if (!/\{/.test(t)) continue;
    for (const k of t.slice(0, t.indexOf("{")).matchAll(/\.(akhq-[a-z0-9-]+)/g)) deklarert.add(k[1]);
  }
  return {
    harLag: lagBlokker.length > 0,
    lag: Object.fromEntries(Object.entries(perLag).map(([k, v]) => [k, [...v]])),
    iLag: [...iLag],
    utenforLag: [...deklarert].filter((k) => !iLag.has(k) || true).filter((k) => deklarert.has(k))
  };
}
/* Duplikate egenskaper i samme regel. Lagsjekken måler MEDLEMSKAP og fanget
 * ikke at migreringen prependerte «--var:…;prop:var(--var)» uten å fjerne den
 * originale hardkodede egenskapen — som ligger senere i regelen og derfor
 * vinner. Fem regler i gruppe 2 fikk døde variabler slik: railen sluttet å
 * smalne, tre berøringsgulv ble uvirksomme. «0 klasser utenfor lag» var grønt
 * mens variabelplumbingen var død.
 *
 * Kjente legitime dupliseringer: progressive fallbacks der andre deklarasjon
 * er en nyere enhet nettleseren enten forstår eller ignorerer. */
const FALLBACK_OK = [["height", "100vh", "100dvh"], ["height", "100vh", "100svh"], ["min-height", "100vh", "100dvh"], ["width", "100vw", "100dvw"]];
export function finnDuplikater(kildetekst) {
  const treff = [];
  for (const m of kildetekst.matchAll(/^(\.akhq-[a-z0-9-]+(?:[^\n{]*)?)\{([^}\n]*)\}/gm)) {
    const dekl = m[2].split(";").map((x) => x.trim()).filter(Boolean);
    const sett = {};
    for (const d of dekl) {
      const i = d.indexOf(":");
      if (i < 0) continue;
      const p = d.slice(0, i).trim(), v = d.slice(i + 1).trim();
      if (p.startsWith("--")) continue;
      if (sett[p]) {
        const legit = FALLBACK_OK.some(([pp, a, b]) => pp === p && ((sett[p] === a && v === b) || (sett[p] === b && v === a)));
        if (!legit) treff.push({ selektor: m[1].trim(), egenskap: p, verdier: [sett[p], v] });
      }
      sett[p] = v;
    }
  }
  return treff;
}
/* Gyldighetssjekk. finnDuplikater() lukker bare halve klassen: den fanger to
 * deklarasjoner der én skulle stå. Den andre halvparten er ugyldig CSS som
 * kastes STILLE — nøyaktig hva `min-height: max(auto, 44px)` gjorde i Toggle,
 * den eneste ekte WCAG-regresjonen i gruppe 2. En deklarasjon som ikke parser
 * forsvinner uten spor: ingen duplikat, ingen feilmelding, bare en egenskap
 * som aldri fantes.
 *
 * Krever CSS.supports, altså nettlesermiljø. Vendorprefikser hvitlistes —
 * de er legitimt ustøttet i den nettleseren som kjører sjekken.
 *
 * MÅLT BEGRENSNING (28.07.2026): CSS.supports fanger max(auto,44px) → false
 * og width:44 → false, men returnerer TRUE for uavsluttet `var(--s3` —
 * nettleseren regner alt med var() som gyldig ved supports-sjekk. Den delen
 * dekkes av parentesbalansen under, ikke av supports. */
const PREFIKS_OK = /^-(webkit|moz|ms|o)-/;
export function finnUgyldige(kildetekst) {
  const treff = [];
  const kanSupports = typeof CSS !== "undefined" && CSS.supports;
  for (const m of kildetekst.matchAll(/^(\.akhq-[a-z0-9-]+(?:[^\n{]*)?)\{([^}\n]*)\}/gm)) {
    for (const d of m[2].split(";")) {
      const i = d.indexOf(":");
      if (i < 0) continue;
      const p = d.slice(0, i).trim(), v = d.slice(i + 1).trim();
      if (!p || !v || p.startsWith("--") || PREFIKS_OK.test(p)) continue;
      /* Parentesbalanse — fanger uavsluttet var(/max(/calc( som supports godtar. */
      let balanse = 0;
      for (const c of v) { if (c === "(") balanse++; else if (c === ")") balanse--; }
      if (balanse !== 0) { treff.push({ selektor: m[1].trim(), egenskap: p, verdi: v, grunn: "ubalanserte parenteser" }); continue; }
      if (kanSupports && !CSS.supports(p, v)) treff.push({ selektor: m[1].trim(), egenskap: p, verdi: v, grunn: "CSS.supports = false — deklarasjonen kastes stille" });
    }
  }
  return treff;
}
export function vurder(filsti, kildetekst) {
  const a = analyserFil(kildetekst);
  const problemer = [];
  const harCss = /\.akhq-[a-z0-9-]+\s*\{/.test(kildetekst);
  if (!harCss) return { filsti, ok: true, hopp: "ingen CSS", ...a };
  if (!a.harLag) problemer.push({ nivå: "feil", tekst: "ingen @layer-deklarasjon — hele filens CSS er ulagret og vinner over alle lagrede regler" });
  else if (a.utenforLag.length) problemer.push({ nivå: "feil", tekst: "@layer finnes, men " + a.utenforLag.length + " klasse(r) er deklarert UTENFOR blokken: " + a.utenforLag.join(" ") });
  if (a.harLag && !a.lag["akhq-base"]) problemer.push({ nivå: "advarsel", tekst: "ingen akhq-base — grunnstiler mangler lag" });
  for (const d of finnDuplikater(kildetekst))
    problemer.push({ nivå: "feil", tekst: d.selektor + ": «" + d.egenskap + "» deklarert to ganger (" + d.verdier.join(" → ") + "). Den siste vinner, så en variabel foran den er død." });
  for (const u of finnUgyldige(kildetekst))
    problemer.push({ nivå: "feil", tekst: u.selektor + ": «" + u.egenskap + ": " + u.verdi + "» — " + u.grunn });
  return { filsti, ok: problemer.length === 0, problemer, ...a };
}

/* ── Tredje stille død: var(--x) der --x aldri er deklarert ──────────────
 * Den parser, CSS.supports sier true, parentesene balanserer — og
 * deklarasjonen kastes likevel ved computed-value time, uten spor. Det er
 * nøyaktig failure-moden en lagmigrering kan innføre: variabelen deklareres
 * i ett lag, konsumenten leser den fra et sted den ikke er synlig.
 *
 * Sammen med finnDuplikater() og finnUgyldige() dekker dette alle tre måtene
 * en migrert regel kan dø stille: OVERSKREVET av en gjenglemt original,
 * UPARSEBAR og forkastet, UDEKLARERT og kastet ved computed value.
 *
 * FORUTSETNING, målt 28.07.2026: deklarasjonsmengden MÅ bygges fra hele
 * @import-closuren til styles.css. Første kjøring leste bare styles.css —
 * som er 111 tegn og inneholder ingen tokens, bare to @import — og flagget
 * dermed 45 gyldige tokens som udeklarerte. En sjekk med feil nevner gir
 * 45 falske positiver, og den slags larm får ekte funn til å bli oversett.
 *
 * Referanser med fallback (var(--x, 8px)) hvitlistes: de er ved konstruksjon
 * trygge, og mønsteret brukes bevisst i base-laget der modifikatorer setter
 * variabelen (--pad-x, --flow, --cols). */
export function samleDeklarasjoner(kilder) {
  const dekl = new Set();
  for (const t of kilder) for (const m of t.matchAll(/(--[a-z0-9-]+)\s*:/gi)) dekl.add(m[1].toLowerCase());
  return dekl;
}
export function finnUdeklarerte(komponentKilder, deklarerte) {
  const treff = [];
  for (const [fil, t] of Object.entries(komponentKilder))
    for (const m of t.matchAll(/var\(\s*(--[a-z0-9-]+)\s*(,)?/gi)) {
      const navn = m[1].toLowerCase();
      if (m[2]) continue;
      if (!deklarerte.has(navn)) treff.push({ fil, navn });
    }
  return treff;
}

/* ── PLANLAGT FORENKLING: én nevnerløs sjekk erstatter to ─────────────────
 * (Skrevet 28.07.2026. Tas når sveipene wires inn i check_design_system —
 * ikke nå, det som står er selvtestet og grønt.)
 *
 * finnUgyldige() og finnUdeklarerte() har hver sin NEVNER som kan bli feil,
 * og den har blitt feil tre ganger: tokenmengden lest fra styles.css alene,
 * et råtall et delvis lastet dokument kunne oppfylle, og en readiness-gate
 * som bestod fordi den ikke rakk å se problemet.
 *
 * Stille-død-klassen kan fanges UTEN nevner: for hver regel, sammenlign
 * deklarasjonene i kilden mot rule.style.getPropertyValue(prop) på det
 * tilsvarende CSSStyleRule-objektet. Er den tom, forkastet nettleseren
 * deklarasjonen. Det er nettleseren som forteller hva den droppet, i stedet
 * for at sjekken gjetter hva den ville droppe.
 *
 *   for (const regel of ark.cssRules) {
 *     for (const [prop, kildeverdi] of kildeDeklarasjoner(regel)) {
 *       if (regel.style.getPropertyValue(prop) === "") → FORKASTET
 *     }
 *   }
 *
 * Den ene diffen dekker hele klassen — max(auto, …), udeklarert var(),
 * uavsluttet parentes, manglende enhet — uten CSS.supports, uten
 * parentesbalanse, uten tokenmengde, uten kanarier.
 *
 * finnDuplikater() må fortsatt lese kilden: et duplikat er per definisjon
 * ikke synlig i resolvert tilstand, siden den siste vinner og de andre
 * forsvinner sporløst. Den beholdes som egen kildesjekk.
 *
 * Netto: tre sjekker → to, og den nevnerløse kan ikke gi falske positiver
 * av samme klasse som de tre rettede feilene. */
