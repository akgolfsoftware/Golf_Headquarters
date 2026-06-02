# Design-porting-gate (LÅST regel)

Når en skjerm portes fra v10-designet (`public/design-handover/v10/`) til kode, MÅ denne gaten følges. En skjerm er IKKE «ferdig» og vises IKKE til Anders før gaten er bestått. Dette finnes fordi porting «fra minne/eksisterende kode» gir «nesten»-resultater som avviker fra fasit.

## Gaten — 5 steg per skjerm

1. **Bygg FRA v10, ikke fra eksisterende kode.**
   Les v10-kilden: `playerhq-app/`/`agencyos-app/` screen-JSX + matchende `screenshots/*.png`.
   Lag en **element-liste** (hero-topp, hero-bunn, hver seksjon, hvert tall/tekst, rekkefølge).
   Bygg implementeringen fra lista — ikke ved å modifisere det som allerede finnes.

2. **Screenshot implementeringen.**
   Playwright mot riktig bredde (PlayerHQ 430px, AgencyOS ~1280px), full-page.

3. **ADVERSARIAL diff — egen agent, ikke meg selv.**
   Spawn en subagent med: v10-screenshot + min screenshot + element-lista.
   Oppgaven er å **FINNE avvik** — den er kritiker, ikke heiagjeng. Den lister hvert avvik
   (topp, rekkefølge, farge, tekst, manglende/ekstra element, layout). Default: anta avvik
   finnes til den har lett grundig.

4. **Fiks til 0 avvik.**
   Rett hvert avvik, re-screenshot, kjør diff på nytt. Loop til agenten finner **0 avvik**.

5. **FØRST DA** vises skjermen til Anders / merkes ferdig.

## Bevisste unntak (Anders-beslutninger som overstyrer v10)

Dokumenteres her så diff-agenten måler mot riktig fasit:

- **PlayerHQ-hjem hero:** beholder **profilbilde + tier-pill** øverst (Anders' valg 2026-06-02),
  selv om v10 har dato-eyebrow + vær der. Resten av hero (greeting + samlet headline) følger v10.

## Hvorfor dette (ikke bare «vær nøye»)

Jeg har bias mot å bekrefte mitt eget arbeid. En uavhengig diff-agent hvis *jobb* er å finne feil,
fanger det jeg overser (f.eks. hero-topp avatar≠vær, headline rendret som eyebrow). Gaten flytter
godkjenningen bort fra meg selv.
