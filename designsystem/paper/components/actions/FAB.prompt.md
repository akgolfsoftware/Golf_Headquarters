# FAB

Festet handlingsknapp, nede til høyre. Mobilens ene dominerende handling.

## Når

**Én FAB per skjerm, eller ingen.** Den er skjermens oransje jobb (`--cta`), og oransjemonopolet tåler ikke to. Har skjermen allerede en `OneThingNow` med primærhandling, skal den ikke ha FAB — da konkurrerer to oransje elementer og ingen av dem er viktigst.

Legitim bruk: «Logg slag» i live-økt, «Ny booking» i kalenderen, «Be om økt» i PlayerHQ-planen.

```jsx
<FAB label="Logg slag" overTab onClick={logg} />
<FAB label="Ny booking" icon={<PlusIkon />} iconOnly />
```

## Regler

- **56 px, ikke 44.** Gulvet er hevet med hensikt: en FAB tas med tommelen i bevegelse, ofte med hanske, ofte på en range. Det er et navngitt avvik oppover fra gulvet, ikke under det.
- **`overTab` når skjermen har bunnfaner** — uten den ligger den under tabbaren og er utilgjengelig. Fullskjermflater (live økt, runde, test) har ingen tabbar og trenger den ikke.
- **`label` er alltid påkrevd**, også med `iconOnly` — den blir `aria-label`. En ikon-FAB uten navn er en gåte.
- **Ikke på desktop.** Desktop har `StickyActionBar` og en primærknapp i toppfeltet; en flytende knapp over en 860 px kolonne dekker innhold uten å spare noen for noe.

## Tilstander

default · hover · active (1 px ned) · focus-visible (2 px `--focus`, offset 3) · disabled · ikon-variant (sirkel) · over bunnfaner.
