# Inngang & drop-off — AK Golf HQ

Sist kjørt: 5. juni 2026. Følgedokument til `MASTER-SKJERMPLAN.md`.

Dette svarer på «hvilken knapp leder til hver skjerm» — den manglende **Inngang**-kolonnen.
Lista er **utledet maskinelt fra koden**, ikke skrevet for hånd: hver interne lenke i
`src/` (`href=`, `to=`, `router.push/replace`, `redirect`, og nav-config `href:/path:/route:/url:`)
ble samlet og krysset mot hver `page.tsx`-rute. En rute uten et eneste treff = ingen knapp leder dit.

Derfor kan den re-kjøres når som helst og holdes sann (se seksjon 5).

---

## 1. Tallene

- **382 produksjonsruter** (ekskl. `*-preview`, `*-demo`, `/intern`, `design-system`).
- **34 ruter uten inngående lenke.** Etter manuell sjekk faller de i to grupper:
  - **~8 faktiske app-skjermer** som en bruker burde nå, men ingen knapp gjør det → seksjon 2.
  - **~26 detaljsider / SEO-sider / token-innganger** som nås via dynamiske lister eller bevisst via e-post → seksjon 3 (lav prioritet).
- **Drop-off fra designet** (tegnet, mangler rute): uendret fra MASTER — Elite-pakken + ubrukte komponenter → seksjon 4.

---

## 2. Trenger en knapp — faktiske skjermer ingen kommer til

Dette er de virkelige hullene. Prioriter disse.

| Skjerm | Adresse | Burde nås fra | Diagnose |
|---|---|---|---|
| Caddie (gammel) | `/admin/caddie` | — | **Dublett** av `/admin/agencyos/caddie` (den ligger i tab-nav). Kun selv-referanser. Behold AgencyOS-versjonen, la denne redirecte eller slett. |
| Compliance (coach) | `/admin/analysere/compliance` | Analysere-fanen i AgencyOS | Nevnt i kun 1 fil. Mangler inngang fra Analysere. Legg fane/knapp. |
| Coach live: brief | `/admin/live/[sessionId]/brief` | Live-økt-start (coach) | Ingen knapp. Avklar: skal coach ha egen live, eller er `/portal/(fullscreen)/live` master? Hvis master → fjern disse tre. |
| Coach live: aktiv | `/admin/live/[sessionId]/active` | ↑ | ↑ |
| Coach live: oppsummering | `/admin/live/[sessionId]/summary` | ↑ | ↑ |
| Onboarding coach | `/onboard/coach` | Invitasjon / e-post | **0 referanser** i koden. Enten bevisst token-inngang (da: OK, dokumentér) eller mangler knapp fra invitasjonsflyt. |
| Onboarding klubb | `/onboard/klubb` | Invitasjon / e-post | **0 referanser.** Samme avklaring. |
| Meg (topp-nivå) | `/meg` | — | Trolig alias. Verifiser at den redirecter til `/portal/meg`, ellers fjern. |

---

## 3. Sannsynlig OK — detaljsider, SEO og token (lav prioritet)

Disse har ingen statisk lenke, men nås normalt via en liste med beregnet `href={x.url}`
(som regexen ikke fanger) eller er bevisst e-post-/token-innganger. Verifiser ved tvil, ikke hast.

- **Detalj-via-liste:** `/anlegg/[slug]`, `/blogg/[slug]`, `/coacher/[slug]`,
  `/admin/godkjenninger/[id]`, `/admin/godkjenn-portal/koblinger/[id]`,
  `/booking/[slug]/bekreft`, `/booking/kvittering/[bookingId]`.
- **Token/e-post-inngang (ingen knapp forventet):** `/inviter/forelder/[token]`.
- **Stats-flaten (17):** `/stats/2026`, `/stats/uka`, `/stats/quiz`, `/stats/min-progresjon`,
  `/stats/aargang/[aar]`, `/stats/baner/[slug]`, `/stats/blogg/[slug]`, `/stats/klubber/[slug]`,
  `/stats/spillere/[slug]`, `/stats/tour/[slug]`, `/stats/turneringer/[slug]` (+ `/statistikk`),
  `/stats/wrapped/[slug]`, `/stats/pga/putt-explorer`, `/stats/pga/spillere/[dg_id]`,
  `/stats/verktoy/avstand`, `/stats/verktoy/score-til-hcp`, `/stats/verktoy/whs-kalkulator`.
  Egen offentlig/SEO-flate — nås via crawl og dynamiske lister. Behandle samlet, ikke per skjerm.

---

## 4. Drop-off — design tegnet, mangler rute

Bekrefter MASTER-SKJERMPLAN seksjon A–C. Ingen nye funn i zip-en 5. juni.

**Skjermer (Elite Fase 2 — bevisst parkert):**

- `Break-tabell.html` — putting break-/green-reading-tabell. Ingen rute.
- `Putte-verktoy.html` — putting-verktøy. Ingen rute.
- `DispersionTool.html` / `Utslag-spredning.html` — utslagspredning. Ingen rute.
  Hører hjemme i `/portal/statistikk/shot-map` eller talent-radar når Elite Fase 2 starter.

**Komponenter tegnet, ikke synlig i bruk** (bygges inn der de hører hjemme — se MASTER «Veien til 100%» Bolk 3):

- `components-co-agent` (Caddie), `components-multi-compare` (talent/sammenligning),
  `components-coach-mobile`, `components-foreldre`, `components-cmdk` (hurtigsøk),
  `components-gap-to-drill` (svakhet→drill-bro), `components-voice-input` (stemme-logging),
  `components-credit-indicator`, `components-season-timeline`,
  `components-sg-training-scatter`, `components-trackman-{trend,stability,dispersion}`.

---

## 5. Slik holder du Inngang-kolonnen sann (metoden)

Ikke vedlikehold dette for hånd. Kjør sjekken på nytt før hver lansering:

1. **Re-kjør orphan-sjekken** (Claude Code-jobb): ett lite skript samler alle interne lenker
   i `src/` og lister hver `page.tsx`-rute uten treff. Output = oppdatert seksjon 2–3.
2. **Fasiten for HVOR hver knapp skal lede** ligger allerede i `skjerm-knapp-spesifikasjon.md` —
   den er kilden når du fyller inn en manglende inngang.
3. **Koble til MASTER:** for hver produksjonsrad i `MASTER-SKJERMPLAN.md`, legg én **Inngang**-celle
   = «hvilken knapp/side leder hit». Tomme celler = nøyaktig denne lista. Når seksjon 2 er tom,
   er ingen skjerm foreldreløs.

> Neste konkrete steg (Claude Code): legg `Inngang`-kolonnen inn i MASTER for produksjonsradene,
> og rydd de 8 i seksjon 2 (start med caddie-dubletten og coach-live-avklaringen).
