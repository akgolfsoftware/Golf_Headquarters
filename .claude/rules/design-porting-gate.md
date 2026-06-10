# Design-porting-gate (LÅST regel)

Når en skjerm portes fra det ferske designet (`public/design-handover/AK Golf HQ Design System/`) til kode, MÅ denne gaten følges. En skjerm er IKKE «ferdig» og vises IKKE til Anders før gaten er bestått. Dette finnes fordi porting «fra minne/eksisterende kode» gir «nesten»-resultater som avviker fra fasit.

## Gaten — 5 steg per skjerm

1. **Bygg FRA design-kilden, ikke fra eksisterende kode.**
   Les kilden under `public/design-handover/AK Golf HQ Design System/`: `playerhq-app/`/`agencyos-app/` screen-JSX + matchende `screenshots/*.png`.
   Lag en **element-liste** (hero-topp, hero-bunn, hver seksjon, hvert tall/tekst, rekkefølge).
   Bygg implementeringen fra lista — ikke ved å modifisere det som allerede finnes.

2. **Screenshot implementeringen.**
   Playwright mot riktig bredde (PlayerHQ 430px, AgencyOS ~1280px), full-page.

3. **ADVERSARIAL diff — egen agent, ikke meg selv.**
   Spawn en subagent med: design-screenshot (fra handover) + min screenshot + element-lista.
   Oppgaven er å **FINNE avvik** — den er kritiker, ikke heiagjeng. Den lister hvert avvik
   (topp, rekkefølge, farge, tekst, manglende/ekstra element, layout). Default: anta avvik
   finnes til den har lett grundig.

4. **Fiks til 0 avvik.**
   Rett hvert avvik, re-screenshot, kjør diff på nytt. Loop til agenten finner **0 avvik**.

5. **FØRST DA** vises skjermen til Anders / merkes ferdig.

## Bevisste unntak (Anders-beslutninger som overstyrer designet)

Dokumenteres her så diff-agenten måler mot riktig fasit:

- **PlayerHQ-hjem hero:** beholder **profilbilde + tier-pill** øverst (Anders' valg 2026-06-02),
  selv om designet har dato-eyebrow + vær der. Resten av hero (greeting + samlet headline) følger designet.
- **Tier-pill-tekst (alle hero-pills, mobil + desktop):** viser **«PlayerHQ · {tier}»** (+ «· HCP {hcp}» på desktop),
  IKKE designets «Performance Pro». Performance/Performance Pro er **coaching-pakker, ikke app-nivåer** (CLAUDE.md låst beslutning) — skal aldri vises som app-nivå. Vær-linje i hero-topp utelates der appen ikke har vær-data.
- **Undersider mobil-topbar (2026-06-10):** appen bruker den globale PortalShell-topbaren (hamburger + PLAYERHQ) på
  undersider, IKKE fasitens sub-topbar med tilbake-pil + sidetittel. Delt shell-chrome-unntak (samme linje som
  hovedskjermene); tilbake-navigasjon skjer via nettleser/bunn-nav. Diff-agenter skal ikke flagge dette.

- **Knappestil (2026-06-10):** appens etablerte knapp-idiom er **rounded-full pill + mono 12px bold uppercase**
  (samme på alle portede skjermer), der fasit-CSS har radius-12 + display-font 14px sentence-case.
  Godkjent som app-bredt mønster — diff-agenter skal ikke flagge knapp-form/typografi som følger idiomet.
  (Farger/høyder/innhold skal fortsatt matche fasit.)

## Hvorfor dette (ikke bare «vær nøye»)

Jeg har bias mot å bekrefte mitt eget arbeid. En uavhengig diff-agent hvis *jobb* er å finne feil,
fanger det jeg overser (f.eks. hero-topp avatar≠vær, headline rendret som eyebrow). Gaten flytter
godkjenningen bort fra meg selv.
