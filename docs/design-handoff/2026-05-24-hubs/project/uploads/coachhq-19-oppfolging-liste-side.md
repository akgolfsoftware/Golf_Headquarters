# CoachHQ — Oppfølging-liste (side)

**Rute:** `/admin/oppfolging`.

## Kontekst
Oppfølginger er "ting Anders bør gjøre, men ikke akutt": ring foreldre, send video, sjekk hvordan ny økt fungerer, betaling forfaller om 7 dager.

## Formål
- Task-liste med kontekst per spiller
- Prioritetsmerking
- Snooze / fullfør / delegere

## Layout

**Header:**
- "Oppfølging · 12 åpne" Inter Tight 700 32px
- "3 forfaller i dag · 4 denne uka" mono
- Filter chips: Alle | I dag | Denne uka | Senere | Snoozet
- "Ny oppfølging" outline høyre

**Liste (grupperte etter forfallsdato):**

```
I dag (3)
☐ Ring Sofies foreldre om sommer-camp                Sofie B. · Foreldre  [Gjør nå]
☐ Send video-feedback om Markus' sving               Markus RP · Video    [Gjør nå]
☐ Sjekk Mikkels fysiske test fra forrige uke         Mikkel L. · Test     [Gjør nå]

Denne uka (4)
☐ Plan-evaluering med Emma                          Emma S. · Plan        [Onsdag]
...
```

Hver rad:
- Checkbox venstre
- Tittel (Inter 500)
- Spiller + kategori-pille (mono small caps)
- Quick-action-knapp høyre
- Hover: Snooze, Delegate, Slett-meny

**Tomtilstand:**
"Ingen oppfølginger. Nyt en kopp kaffe."

## Branding
Cream bg, hvit liste, lime checkbox på fullført, forest CTAs.
