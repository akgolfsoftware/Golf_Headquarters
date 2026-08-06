# «Ikke bygget ennå» — åpne skjermseksjoner

Skrevet 28.07.2026. Ligger her, og ikke som en komponent i biblioteket, etter beslutning s.d.

Minst ni skjermer i fasiten har faner eller seksjoner som sier at funksjonen er utsatt til implementasjon: **agenticos, booking, drift, kalender, ko, okonomi, plan, stall-plus**. Det er byggestatus, ikke en datatilstand.

`EmptyState` dekker **ikke** dette, og det skal ikke lages en `ComingSoon`, en `variant="kommer"` eller en «under arbeid»-plassholder:

1. Skjermene får faktisk innhold i Fase C. En komponent for mellomtilstanden ville bli bygget for å dø — og i praksis overleve.
2. En plassholder som finnes, blir brukt. Første skjerm som mangler innhold, strekker seg etter den, og da er grensen mellom «ingen data» og «ikke bygget» borte.
3. Byggestatus hører i prosjektsporet, der eier kan prioritere det — ikke som et designet element som ser ferdig ut for brukeren.

Trenger en skjerm å si noe til en ekte bruker før Fase C, er det en `Banner` med `tone="info"` skrevet som driftsmelding — midlertidig beskjed, ikke tomtilstand.

**Til eier:** disse seksjonene trenger innholdsbeslutninger før de kan designes. De er ikke glemt; de venter på hva de skal inneholde.
