KanbanKolonne er ett trinn i en flyt, med kortene som står der nå.

```jsx
<div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, alignItems: "start" }}>
  <KanbanKolonne title="Til godkjenning" limit={5} dataOdId="panel-kan-godkjenning">
    <QueueCard … />
    <QueueCard … />
  </KanbanKolonne>
  <KanbanKolonne title="Publisert" emptyText="Ingenting er publisert denne uken ennå." dataOdId="panel-kan-publisert" />
</div>
```

- **Brettet er skjermens grid, ikke komponentens.** Kolonnen vet ikke hvor mange søsken den har, og skal ikke vite det — antall kolonner, rulling på tvers og responsiv omlegging hører til skjermen.
- **Kortene er egne komponenter.** `QueueCard` i køer, `SessionCard` i planlegging, `Panel` ellers. Kolonnen styler dem ikke: en regel her som treffer et `QueueCard`-element ville vært kryssfil-styling, som er bindende forbudt.
- **Grensen mot `DataTable`:** samme sett, to spørsmål. «Hvordan ligger disse an mot hverandre» er en tabell og leses nedover. «Hvor i flyten står hver enkelt» er kanban og leses bortover.
- **Grensen mot `ListGroup`:** en liste uten trinn er en liste. Har kolonnene ikke en rekkefølge med mening, er brettet bare tre lister ved siden av hverandre.
- Antallet står ved tittelen, ikke som badge i et hjørne: det er en del av overskriften, ikke en varsling.

## Bindende: taket er en anbefaling, aldri en sperre

`limit` er WIP-taket. Overskrides det, får kolonnen en dempet `--dn`-ramme og setningen «Over anbefalt tak på N. Flytt en sak videre før du legger til flere.» Det finnes **ingen** `disabled`, ingen blokkert knapp og ingen skjult handling — invarianten om at anbefalinger aldri sperrer gjelder her som overalt ellers. `--dn` er leire, ikke rød; det finnes ingen rød i paletten.

Taket er dessuten valgfritt. En kolonne uten `limit` viser bare antall, og det er riktig for trinn der et tak ikke betyr noe («Publisert» har ikke et tak — det er der ting samler seg).

## Bunnflaten

Kolonnen står på `--soft` med hensikt: kortene inni skal lese som oppå flaten, ikke som en del av den. Ligger brettet allerede på `--soft`, bruk `flat` — to lag `--soft` opppå hverandre gir ingen kant og kolonnene flyter sammen.
