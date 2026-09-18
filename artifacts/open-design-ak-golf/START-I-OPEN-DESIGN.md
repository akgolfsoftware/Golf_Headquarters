# Gjør dette i Open Design — eksakt rekkefølge

Du har **ingen** designsystem der ennå. Ikke start med å tegne Hjem eller Workbench. Først systemet. Deretter et prosjekt som bruker det.

Kilde: Claude Design-zip «AgencyOS Design System (2)». Denne pakken er den samme loven, slanket så Open Design kan svelge den (uten 18 foto).

Motor: **Grok**.

---

## A · Koble Grok (én gang)

1. Åpne **Open Design**.
2. Velg motor / agent: **Grok** (ikke Claude Code, ikke Codex).
3. Logg inn med SuperGrok / X Premium+ hvis den ber om det.
4. Bekreft at prosjektvelgeren viser Grok som aktiv motor.

Hvis Grok ikke ligger i listen: Settings → Agents / BYOK → Grok. Du har SuperGrok.

---

## B · Opprett designsystemet (første gang, tomt)

Open Design har **ikke** en stor «New design system»-knapp i alle versjoner. Bruk **én** av disse. Prøv B1 først.

### B1 — Importer zip som system (foretrukket)

1. New / Create → **Design system** (eller «Import brand» / «Import ZIP»).
2. Last opp **`AK-Golf-OpenDesign-start.zip`** (denne pakken).
   - Hvis den nekter: last opp bare `DESIGN.md` + `tokens.css` + `SKILL.md`.
3. Navn: **AK Golf Academy**.
4. Namespace: `user:ak-golf-academy` (eller det feltet kaller det).
5. **Ikke** huk av et innebygd merke (Stripe, Linear, Paper …).
6. La Grok **lese** filene. Lim inn prompten i `GROK-FØRSTE-PROMPT.md` del 1.
7. Stopp når du ser sand/grafitt/rust + Oswald/Archivo i kit-preview. **Tegn ingen app-skjerm.**

### B2 — Hvis zip-opplasting feiler (det skjedde med den store Claude-zipen)

1. New project, **uten** å velge et annet merke. Hvis den tvinger et system: velg det mest nøytrale og overstyr med prompt.
2. Dra disse tre filene inn i prosjektmappen / Library:
   - `DESIGN.md`
   - `tokens.css`
   - `SKILL.md`
   - mappen `assets/logos/`
3. I chatten til Grok: lim inn `GROK-FØRSTE-PROMPT.md` del 1.
4. Be Grok: «Lagre dette som design system AK Golf Academy. Ikke generer sider ennå.»

### B3 — Ikke gjør

- Ikke last opp den fulle Claude-zipen med 18 foto hvis B1 feiler (7 MB kan gå, 27 MB Hjem-zip gikk ikke).
- Ikke lim inn GitHub-URL som erstatning for tokens. GitHub-koden er ikke visuell lov.
- Ikke be den «lage hele appen i designsystemet».

---

## C · Når systemet finnes: lag **prosjektet** (skjermer)

Designsystem ≠ app. Nytt prosjekt:

1. **New project**.
2. Name: `AgencyOS skall` (første prosjekt). Senere: `PlayerHQ`, `Marked`, egne filer.
3. Design system: **AK Golf Academy** (det du nettopp laget).
4. Fidelity: **High**.
5. Platform: Web, breakpoints 1440 og 390 (834 i neste runde).
6. Agent: **Grok**.
7. Skills: design system / prototype. Ikke brand-rebuild. Ikke «extract from URL».
8. Lim inn `GROK-FØRSTE-PROMPT.md` del 2. Send.
9. Godkjenn **tomt AgencyOS-skall** (rail, topp, flate, inspektør) før du ber om Hjem.

Neste prosjekt-prompt (etter skall): én skjerm om gangen — Hjem, deretter Workbench uke. Ikke 105 sider.

---

## D · Hva som skal ligge hvor

| Sted | Innhold |
|---|---|
| Design system (dette) | Tokens, type, knapper, tomme skall, logoer, regler |
| Prosjekt AgencyOS | Hjem, Stall, Workbench, Innboks … arver systemet |
| Prosjekt PlayerHQ | I dag, Live, Plan … samme tokens, annet skall |
| Ikke her | Team Norway (Claw-zip), WANG (WANG-zip) |

---

## E · Sjekkliste før du tegner noe

- [ ] Grok er valgt motor
- [ ] System heter AK Golf Academy
- [ ] Preview viser `#e6e3dd` bakgrunn, rust `#9b2415`, radius 2px
- [ ] Ingen Stripe-blå / Linear-lilla
- [ ] Ingen foto som app-bakgrunn
- [ ] Du har **ikke** bedt om 40 skjermer i system-steget
