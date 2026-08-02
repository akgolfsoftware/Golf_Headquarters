Stepper viser hvor i en flerstegsflyt brukeren er — gjennomført, gjeldende, kommende.

```jsx
<Stepper current={2} dataOdId="nav-steg-plan" steps={[
  { id: "a", label: "Velg spillere" },
  { id: "b", label: "Sett periode" },
  { id: "c", label: "Fordel volum" },
  { id: "d", label: "Bekreft og publiser" }
]} />
```

- **Grensen mot `Pagination`:** sider har rekkefølge uten mening, steg har rekkefølge med mening. Kan brukeren hoppe fritt, er det ikke en flyt.
- **Grensen mot `ProgressBar`:** en andel er kontinuerlig og navnløs. Steg er diskrete og har navn — og navnet er halve poenget.
- **Grensen mot `ProgramLadder`:** AK-stigen er en varig utviklingsmodell over måneder. Stepper er én flyt, én gang.
- Ingen farge. Tre tilstander uttrykkes med fyll, ramme og demping — et steg er ikke en datasemantikk, så `--up`/`--dn` hører ikke hjemme her.

## Bindende: stigen navigerer ikke

Den inneholder verken `<button>` eller `<a>`, og har ingen tab-stopp. Grunnen er ikke teknisk: en klikkbar stige lover at du kan hoppe tilbake til steg 1 uten å miste det du har fylt ut i steg 3, og det løftet kan komponenten ikke holde — den kjenner ikke skjermens tilstand. Skal brukeren kunne gå tilbake, er det skjermens egen «Tilbake»-knapp, som også kan lagre først.

## Bindende: gjeldende steg annonseres to veier

`aria-current="step"` på `<li>` for skjermlesere som leser lista, **og** en visuelt skjult setning «Steg 3 av 4 · pågår» inne i steget. Uten den siste er posisjonen bare en visuell påstand: en bruker som hører «Fordel volum» får ingen anelse om hvor langt inn i flyten det er. Gjennomførte steg får tilsvarende «· fullført», siden haken er `aria-hidden`.

## Container-terskel

`@container (max-width: 520px)` legger stigen loddrett og fjerner forbindelsesstrekene. Tallet er regnet mot containeren, ikke vinduet: i et `Panel` spiser polstringen 34–38 px, så 520 i containeren svarer til ~556 i spalten. Vannrett under den bredden kutter `text-overflow: ellipsis` etikettene, og «Bekreft og publiser» blir «Bekreft og…» — altså nettopp navnet som er poenget.
