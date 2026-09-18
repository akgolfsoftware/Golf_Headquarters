# Claude Design — oppfølging etter AgencyOS Design System (1).zip

Vurdert 18.09.2026 07:29. Du er fornøyd med utgangspunktet. Ikke tegn om loven.

## Hva zipen *er*

To halvdeler, én palett:

- **App:** sand/grafitt/rust, Oswald + Archivo + Plex Mono, 236/64/372, ni Agency-mål, fire PlayerHQ-faner. Ingen foto som bakgrunn. Ingen `--fs-mkt-*`.
- **Web/sosial:** samme lov + foto full-bleed på scrim, grafitt-felt, ett rust-element. Marketing-komponenter aldri i appen.

Allerede i zip: 7 sosiale maler, 18 foto, lockups, motion 150–250ms, `hjem.html` (lys editorial) vs `hjem-scroll.html` (mørk — 1/5 slop, behold som sammenligning).

**Hull:** priser, navn, tall er placeholder. `academy-08/09/39/42` on hold. `academy-40` slettet — ikke gjenopprett. Ingen MP4. Ingen ekte hvit lockup-fil (invert av svart mark). Font-binærer mangler.

---

## Oppfølgingsprompt (lim inn i samme designsystem-prosjekt)

```
Ikke tegn om palett, type, mål, nav eller stemme. Loven står til 18. desember 2026.

Jeg er fornøyd med utgangspunktet. Dette er sprint 2 — maler som er lette å fylle, ikke ny estetikk.

1) SOSIALT — gjør de sju malene til ÉN familie med fyllfelt
Behold størrelsene:
- ig-feed 1080²
- ig-portrait 1080×1350
- story 1080×1920 (safe 250 top / 320 bunn)
- og 1200×630
- youtube 1280×720 (tittel lesbar ved 210px bredde)
- result 1080²
- quote 1080×1350

Hver fil skal ha et tydelig FYLL-BLOKK øverst i HTML (kommentar + data-attributter):
- data-kicker
- data-tittel
- data-brød
- data-dato
- data-kilde (f.eks. GolfBox · Onsøy GK — aldri DataGolf på junior)
- data-foto (sti)
- data-cta (valgfri, rust-blokk ELLER 4px-strek — aldri begge)
- data-lockup (academy | hq | junior)

Bytt foto ved å endre én sti. Bytt tekst ved å endre Fyll-blokken. Ingen React.

Regler som allerede gjelder: blekk på foto kun på scrim. Ett rust-element. Oswald tall, Plex fakta, Archivo setning. Tomt = «—» + setning. Ingen emoji, ingen hashtag-vegg, ingen drop shadow.

Lag tre fylte eksempler per mal (uttak, økt/akademi, sitat) med foto som IKKE er academy-08, 09, 39, 42, 40.

2) STORY / REELS — bevegelse, ikke slop
Tillatt: én crossfade mellom to stills (som hjem-scroll-båndet), 250ms ease-out, eller still + kicker som fader inn.
Forbudt: partikler, grain, custom cursor, glass, scroll-jack, bounce, scale(0).
Hvis jeg senere leverer MP4: bytt stills mot ekte sekvens. Ikke finn på video.

3) WEB
Behold lys editorial hjem.html som fasit. Ikke erstatt med hjem-scroll.
Hjem: coaching først. Nav: Coaching · Player HQ · Akademiet · Om Anders · Turneringer · Nyheter · Kontakt.
Priser inne i Coaching. Ingen «Priser»-side.
Ikke finn på statistikk. Der tall mangler: «—» og setning.

4) APP-SKALL
Ikke tegn Hjem/Stall/Workbench/Live/TN/WANG her. De arver tokens. Tomt skall 1440/834/390 er nok.

5) LEVER
- Oppdaterte social/*.html med fyllfelt
- Kort social/HOWTO.md: «bytt disse fem linjene»
- Liste over foto som er godkjent / on hold
```

---

## Skills mot merkevare (ikke mot spill)

| Skill | Bruk her | Ikke |
|---|---|---|
| **design-ui** (animations, typography, surfaces, refined-ui) | App-halvdel, 150–250ms, paper | Shimmer, bounce |
| **og** | `og.jpg`, favicon, X-banner fra `og-1200x630.html` | Placeholder grok.me |
| **imagine** | Kun *ny* still når foto mangler (range, bunker uten gjenkjennelig person) | Fake portrett av ansatte |
| **video2dsprite** | Når du har ekte økt-MP4 → Reels-rammer | Generere «trener-video» |
| **neon / animated-website** | Allerede 1/5 | Ikke igjen |
| **game-*** | Nei | — |

Bilder: dokumentarisk, naturlig lys, folk i arbeid. Type på **papir trukket over foto**, ikke på scrim. Én rust. Negative lockup = ikke fargeinverter (rød prikk blir cyan).
