# Flyt & kvalitet — AK Golf HQ

Metode- og kvalitetslaget i designskillen. `README.md` sier hvordan det skal **se ut**;
denne fila sier hvordan det skal **fungere** og hvordan vi holder kvaliteten oppe.
Like bindende som designsystem-reglene.

---

## 1. Flyt-effektivitet (gjelder HVER skjerm)

Mål: fra «vil gjøre» til «gjort» på færrest trykk. En daglig handling skal være **≤ 2 trykk** unna.

**Åtte regler:**
1. **ÉN primærhandling per skjerm** — stor, lime, øverst. Resten dempet. Åpenbar på 200 ms.
2. **Handling i KONTEKST** — gjør det inline der brukeren står (logg treff på live-skjermen, godkjenn i innboks-raden). Ikke navigér bort for én handling.
3. **Systemet FORESLÅR neste steg** — brukeren bekrefter, bestemmer ikke fra blankt (AI-forslag, «neste økt», foreslått drill).
4. **UMIDDELBAR respons** — autolagre i bakgrunnen. Ingen unødig spinner, ingen «Lagre»-knapp der det er trygt.
5. **HUSK tilstand + DYPLENKER** — kom tilbake der du var; varsler tar deg rett på handlingen.
6. **MINIMER steg** — slå sammen wizard-steg som ikke krever en ekte beslutning.
7. **PROGRESSIVE DISCLOSURE** — enkelt først, avansert på forespørsel.
8. **SMARTE DEFAULTS** — forhåndsutfyll alt systemet kan vite (dato = i dag, bane = sist, deltakere = alle påmeldte).

**Unngå:** dype menyer (maks 3 nivåer m/ breadcrumb) · «er du sikker?» på reverserbart · tomme skjemaer · navigere bort for én handling · duplikate innganger · steg uten beslutning.

**Per skjerm, svar på:** Hva er den ENE viktigste handlingen? Kan den gjøres inline? Er defaults forhåndsutfylt? Husker den tilstand? Kan et steg fjernes? Er hovedhandlingen ≤ 2 trykk?

**Konkrete mål:**
- *PlayerHQ:* «logg dagens økt» = Hjem → Start (1 trykk) → tap/si treff → lagre. «logg runde» = forhåndsutfylt, 2 trykk.
- *AgencyOS:* AI-forslag UTFØRER handlingen på cockpit (Book/Svar/Ring inline) · innboks behandles i raden · bulk-tildel til gruppe · ⌘K + hurtigtaster.

**Lime-disiplin:** lime kun på den ENE primærhandlingen + NÅ-markører. Er alt lime, er ingenting det.

---

## 2. Strukturelle mønstre (sjekkliste — let etter disse FØRST)

Feil som dukker opp så ofte at det lønner seg å lete etter dem før noen pixel-fix. Diagnose før polish: pek ut den ene strukturelle feilen før du retter detaljer.

1. **Falske kontroller.** Pills/tabs med `.is-active` men ingen logikk. Fjern eller gjør ekte.
2. **Flat-grønne bakgrunner.** Erstatt med editorial-kort + lime venstrekant (AK-signaturen).
3. **Manglende `prefers-reduced-motion`.** Alle infinite-loop-animasjoner trenger gate.
4. **Hardkodede tall der UI lover beregning.** Regn ut fra faktisk state.
5. **Spec som motsier seg selv** (lede sier én ting, eksempler viser noe annet).
6. **Drill-down-lag som ikke deler datakilde.** Samme spiller/datapunkt skal fortelle samme historie på dashboard, tabell og panel.
7. **Falsk fil-uavhengighet.** Tre «komponenter» som egentlig er fane-views av samme verktøy.
8. **Lying summary-tall.** Header/footer-aggregater som ikke matcher tabellen brukeren kan telle selv.
9. **Strukturelt umulige states.** To radio-tabs aktive samtidig.
10. **Semantiske farge-aliaser der mode-invariant kreves.** `--primary`/`--warning` flipper i dark mode; bruk rå hex for pyramide-akser (`--pyr-*`).

**Diagnose-spørsmålene (bruk dem på hver skjerm):** Koder formen faktisk dataen, eller er den blitt dekorativ? Henger relaterte elementer sammen som ett objekt, eller er de frakoblede lister? Matcher det specen, eller er det «nesten»?

---

## 3. Kvalitetsbar (ekstern smak, AK-tilpasset)

Lånt fra moderne smaks-disiplin (impeccable, high-end-visual). Hev kvaliteten — men der disse generelle reglene kolliderer med AK sine LÅSTE signaturer, vinner AK-kanon.

**AK sine bevisste signaturer (IKKE slop — det er merkevarestemmen):**
- Mono-eyebrow (CAPS, 0.12em tracking) — instrumentpanel-typografi.
- Lime venstrekant (3px) på event-/timeline-kort — den ene aksent-detaljen.
- Cream-bg (#FAFAF7) + hvite kort — lift-kontrasten er essensiell.
- Editorial Inter Tight-italic i display — det som skiller AK fra hver annen «sport tech»-side.

Disse er en *forpliktet, navngitt* brand-stemme. Generelle «unngå»-lister som forbyr dem på tvers gjelder ikke her.

**Det vi LÅNER fra den eksterne baren:**
- **AI-slop-testen som tankesett:** hvis grensesnittet kunne gjettes fra kategorien alene, er det den første treningsdata-refleksen. AK unngår dette gjennom den committede forest/lime/cream-stemmen — hold deg til den, ikke til en generisk SaaS-default.
- **Kontrast er ikke valgfritt:** brødtekst ≥ 4,5:1, stor tekst ≥ 3:1. Lysegrå tekst på tonet near-white er den vanligste feilen — bump mot blekk-enden.
- **Bevegelse med intensjon:** ease-out (eksponentielle kurver), 150–250 ms, ingen bounce/elastic. Hver animasjon trenger et `prefers-reduced-motion`-alternativ (crossfade eller instant).
- **Ikke late kort-rutenett:** identiske ikon+tittel+tekst-kort i det uendelige er en tell. Varier rytmen; kort kun når det faktisk er beste affordance.
- **Lever produksjonsklart, ikke prototype.** Battle-test i nettleser (screenshot) før «ferdig». Én løsning, committet.

---

## 4. Token-metoden (lagdelt — robust mot tema-bytte)

`colors_and_type.css` er allerede bygget i tre lag (samme prinsipp som modne systemer):

- **Primitiver** (`--forest-500`, `--lime-500`, `--cream-50`) — rå skala, aldri direkte i komponenter.
- **Semantikk** (`--primary`, `--accent`, `--background`) — definert for lyst OG `.dark`. Komponenter bygger mot disse.
- **Bruk** — Tailwind (`bg-primary`) eller `var(--primary)`.

Derfor re-temaes alt riktig når `.dark` settes på AgencyOS: lime forfremmes til primary, forest fordypes til bakgrunn. Aldri bygg mot primitiver eller hardkodet hex — da brytes tema-byttet.
