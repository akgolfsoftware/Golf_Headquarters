# ProvenanceDisclosure

«Hvorfor?»-utfellingen under et køforslag. Tre celler: **agent · data · regel**, pluss en valgfri kjøringslinje i mono.

## Hvorfor komponenten finnes

Handoverens avsnitt 1: *«Ingenting når en spiller uten godkjenning. Hvert agentforslag i køen har en «Hvorfor?» som folder ut agent, data og regel. Et forslag uten proveniens er ikke ferdig designet.»* Komponenten er kravet uttrykt som kode — ikke en valgfri detalj du kan la stå tom.

## Bruk

```jsx
<ProvenanceDisclosure
  agent="Plan-vakten"
  data="Periode P3 SPES · testlogg 12.07 · ukevolum 6 t forrige uke"
  rule="Aldersregel 15 år: maks 8 t/uke. Invariant 7: TEK 30–45 %."
  run={{ at: "04:02", duration: "1,8 s", id: "kj-8841" }}
/>
```

Den er nesten alltid barn av `QueueCard`, men står fritt i AgenticOS-kjøringslister og i artefaktpanelet.

## Regler

- **Tre celler, aldri to.** Mangler du `rule`, er saken sannsynligvis ikke agentgenerert — la `agent`/`data`/`rule` stå tomme, og komponenten sier eksplisitt at saken er lagt inn manuelt. Det er en ærligere tilstand enn tre tankestreker.
- **`open` på maks én sak per skjerm** — den øverste. Alle åpne samtidig er en vegg av tekst, ikke innsyn.
- **Ingen farge.** Proveniens er blekk på papir. Agenten er ikke «grønn fordi den lyktes» — utfallet hører i `StatusBadge` på kortet, ikke her.
- Gulvet ligger på `summary` (43,99 → 44 px ved grov peker). Den visuelle raden er 24 px høy; det er `--floor` som løfter treffsonen, ikke tekststørrelsen.

## Container, ikke viewport

`.akhq-prov-c` eier `container-type: inline-size`. Under 420 px container brekker de tre cellene til én kolonne — også når vinduet er 1500 px bredt, fordi kortet like ofte står i et 300 px artefaktpanel.

## Tilstander

default · hover (summary får `--fg`) · focus-visible (2 px `--focus`, offset 3) · open/lukket (caret roterer) · tom (manuell sak).
