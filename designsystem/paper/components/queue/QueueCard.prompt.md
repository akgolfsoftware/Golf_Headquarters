# QueueCard

Køens rad. Én sak: avsender, alder, hatt (coaching/drift), tittel, grunnlag, handlinger — og «Hvorfor?» under.

## Hvorfor den er produktets hjerte

Køen er blandet med hensikt: *«Godkjenn ukeplan for Emma» og «WANG-fakturaen er 12 dager på overtid» hører i samme kø*, fordi det er samme menneske med samme begrensede oppmerksomhet. `QueueCard` er den ene komponenten ingen annen kan stå i stedet for — den er derfor bygget først av K1–K12.

## Bruk

```jsx
<QueueCard first sender="Plan-vakten" kind="coaching" age="4 t"
  title="Godkjenn ukeplan for Emma Sæther"
  primaryLabel="Godkjenn" onPrimary={godkjenn}
  secondaryLabel="Avvis" onSecondary={avvis}
  onSnooze={utsett}
  provenance={{ agent: "Plan-vakten", data: "Periode P3 SPES · testlogg 12.07", rule: "Invariant 7: TEK 30–45 %" }}
  provenanceOpen>
  Uke 31 · 4 økter · 6,5 t · TEK 38 % · invariantene grønne
</QueueCard>
```

## Regler

- **Ingen oransje i kortet.** Oransjemonopolet er én jobb per skjerm; på Kø er det ikke rammen rundt toppsaken. `first` gir blekkramme (`--fg` 40 % mot `--border`), og primærhandlingen er `Button variant="primary"` — blekk, ikke farge.
- **Én primærhandling per kort.** Har du to like viktige, er ingen av dem viktigst — og saken er egentlig to saker.
- **`provenance` er påkrevd for alt en agent har sendt.** Utelat den kun for saker et menneske har lagt inn manuelt; da sier utfellingen det selv.
- **Snooze skjuler ikke.** `snoozedUntil` demper kortet, legger på en `info`-badge med tidspunktet og en «Hent tilbake»-knapp. Raden forsvinner aldri stille — beslutning [natt 1], 30.07.
- **Alder er mono med enhet.** «4 t», «12 d» — aldri «nylig».
- `kind` og `sender` er `StatusBadge kind="tag"`, altså permanent fargeløse. Utfall bruker `status` + `statusTone`.

## Container, ikke viewport

`.akhq-qc-c` eier containeren. Under 460 px container legger hodet seg i én kolonne, handlingene venstrejusteres og tittelen faller til 14 px — også i et bredt vindu, fordi kortet står i artefaktpanelet like ofte som i hovedkolonnen.

## Tilstander

default · hover/active/focus-visible (arves fra `Button`) · utsatt · første i køen · tom (`Region`, med ekte norsk tekst: «Ingenting i køen. Alt som kunne vente, venter ikke lenger.») · laster · feil.
