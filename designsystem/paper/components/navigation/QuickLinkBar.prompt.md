QuickLinkBar er raden med «hvor vil du videre» nederst i en seksjon: mono-etikett og dempede piller med pil.

```jsx
<QuickLinkBar label="Mer her" links={[
  { id: "belastning", text: "Belastning", href: "#belastning" },
  { id: "periode", text: "Periodeplan", href: "#periode" },
  { id: "tester", text: "Testresultater", href: "#tester" }
]} />
```

- Lenker, ikke knapper: dette er navigasjon. Endrer klikket noe på siden i stedet for å flytte deg, er det `Chip` (filter) eller `Tabs`.
- Rendres som `<nav>` med `aria-label` fra `label`, så skjermleseren kan hoppe forbi den.
- Maks fem–seks lenker. Blir det flere, er det en side som mangler struktur, ikke en rad som trenger flere piller.
- Pilen er dekor (`aria-hidden`) — lenketeksten står alene som tilgjengelig navn.
- Pillene er dempede med border, aldri fylte. De skal ikke konkurrere med primærhandlingen i PageHeader.
