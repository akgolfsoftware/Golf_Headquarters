# PORTING — fra Train-lock-skjerm til kode

Målgruppe: Claude Code i AK Golf HQ-repoet (Next.js 16.2 · React 19 · TS strict · Tailwind v4 · shadcn).
Mål: porten skal være **pikselnær mot .dc.html-filen**, ikke «inspirert av». Design-filen er fasit; er koden uenig, er koden feil.

---

## 0 · Regel nummer én

Les den faktiske `.dc.html`-filen. Ikke skjermbilde, ikke hukommelse, ikke beskrivelse.
Hver ramme har inline `style`-attributter med eksakte tall. **Kopier tallene.** Ingen «ca. 16px», ingen «rounded-2xl ser riktig ut».

Rekkefølge per skjerm:
1. `DESIGN-SYSTEM.md` — hvilke tokens og komponenter gjelder.
2. `SCREEN-INDEX.md` — finn filen og hvilke rammer/BP den inneholder.
3. Les filen. Finn `data-screen-label` for rammen du porterer.
4. Sjekk om komponenten finnes i repoet fra før. Hvis ja: gjenbruk, ikke lag ny.

---

## 1 · Tokenlaget først — alltid

Ingen hex i komponentkode. Ett tokenlag, én gang, i `globals.css` med Tailwind v4 `@theme`:

```css
@theme {
  --color-scene: #000000;
  --color-elev: #161616;
  --color-dock: #1C1C1E;
  --color-hair: #FFFFFF14;
  --color-dim: #2C2C2E;
  --color-text: #F5F5F5;
  --color-mute: #8E8E93;
  --color-fill: #FFFFFF;
  --color-onfill: #000000;
  --color-target: #0A84FF;
  --color-ok: #30D158;
  --color-warn: #FFD60A;
  --color-danger: #FF453A;
  --color-warm: #B85C3D;
  --color-shot: #B08968;
  --color-avatar: #B08968;
  --color-avatar-ink: #201409;

  --radius-card: 20px;
  --radius-field: 16px;
  --radius-pill: 999px;
  --radius-sheet: 24px;

  --ease-train: cubic-bezier(0.32, 0.72, 0, 1);
}

[data-theme="light"] {
  --color-scene: #FFFFFF;
  --color-elev: #F2F2F2;
  --color-dock: #E9E9EB;
  --color-hair: #00000014;
  --color-dim: #DDDDDE;
  --color-text: #111111;
  --color-mute: #6E6E73;
  --color-fill: #000000;
  --color-onfill: #FFFFFF;
  --color-danger: #FF3B30;
  --color-ok: #34C759;
}
```

Lys modus er **kun** en overstyring av disse variablene. Aldri `dark:`-varianter spredt i komponentene — da divergerer de to modusene innen en måned. Alle FO-skjermene er bygget på nøyaktig dette prinsippet (lys = samme markup, byttede flater), så porten arver det gratis.

Alt annet: bruk Tailwind-utilities som treffer verdien eksakt (`gap-3` = 12px, `gap-4` = 16px, `gap-5` = 20px). Treffer ingen utility, skriv arbitrary med den eksakte px-verdien (`mt-[22px]`), ikke nærmeste steg.

---

## 2 · Primitives før skjermer

Port i denne rekkefølgen. Skjermer bygget før primitives finnes blir alltid inkonsistente.

| Primitive | Kilde-fil | API |
|---|---|---|
| `<Screen>` | `FO-02 Barn.dc.html` | scene-bakgrunn, safe-area, scroll bak dock |
| `<Card>` | samme | elev + radius-card + padding 16–18 |
| `<CapsLabel>` | overalt | 11/600/0.08em/uppercase/mute |
| `<ListRow>` | `FO-05 Fakturaer.dc.html` | tittel + meta + valgfritt høyre-tall |
| `<AgendaRow>` | `FO-03 Bookinger.dc.html` | tid \| hairline \| tittel+meta \| chevron, `muted` |
| `<Bento>` | `FO-09 Ukerapport.dc.html` | 2 kolonner, gap 12, tall 34/700 |
| `<Button>` | `DESIGN-SYSTEM.md` §6 | `variant: primary \| secondary \| tertiary \| accept` |
| `<Toggle>` | `FO-06 Innstillinger.dc.html` | 51×31 |
| `<Avatar>` | `FO-02` | initial, size 38/44/48 |
| `<Sheet>` | `WB-03` | radius 24 24 0 0, 440ms fra bunn |
| `<WeekGrid>` | `WB-02 Uke komplett 3 skall.dc.html` | timekolonne 48 + hairline-rutenett |

`<Button>`-varianten er det viktigste enkeltgrepet: **legg «én hvit primær per skjerm» inn i typene**, ikke i en kommentar. En `<Screen>` som mottar to `variant="primary"` skal feile i dev (assert i development, no-op i prod). Da kan regelen ikke gå tapt.

`variant="accept"` (ok-grønn) skal være fysisk utilgjengelig utenfor Workbench Player — egen eksport fra `workbench/`-modulen, ikke fra felles `ui/`.

---

## 3 · Oversettelsestabell — inline style → kode

| I .dc.html | I koden |
|---|---|
| `background: #161616` | `bg-elev` |
| `border-bottom: 1px solid #FFFFFF14` | `border-b border-hair` |
| `box-shadow: inset 0 0 0 1px #FFFFFF14` | `ring-1 ring-inset ring-hair` (ikke `border` — border endrer layout) |
| `border-radius: 20px` | `rounded-card` |
| `border-radius: 999px` | `rounded-pill` |
| `font-variant-numeric: tabular-nums` | `tabular-nums` — på **hvert** element med tall |
| `opacity: 0.5` på rad | `opacity-50` (aldri erstatt med gråtone) |
| `opacity: 0.45` på negative tall | `opacity-45` — aldri `text-danger` |
| `letter-spacing: -0.02em` | `tracking-[-0.02em]` på 34/700-titler |
| `letter-spacing: 0.08em` + uppercase | `<CapsLabel>` |
| `repeating-linear-gradient(...)` i rutenett | behold verbatim som inline style |
| `aspect-ratio: 1` i prikk-grid | `aspect-square` |

Fallgruver som ødelegger pikselnærhet:
- **Font.** `-apple-system` gir SF på Mac/iOS og noe annet på Windows/Android. Sett samme stack som design-filen, og aksepter at referansebildene tas på macOS/Safari.
- **`box-sizing`.** Design-filene antar `border-box`. Tailwind gir det, men egne `<style>`-blokker kan bryte det.
- **Scroll bak dock.** Design-filene bruker `padding-bottom: 96px` på scroll-containeren, ikke en spacer-div. Gjør det samme, og legg `env(safe-area-inset-bottom)` på toppen av det.
- **Telefonramme.** 390×844 / 393×852 med radius 54 er *presentasjonschrome*, ikke app-UI. Port innholdet, ikke rammen. Ramme kun i Storybook/visuell-diff-oppsettet.
- **Tall.** `tabular-nums` mangler oftere enn noe annet. Legg det på `<Screen>` som default og overstyr aldri.
- **Norsk format.** `Intl.NumberFormat('nb-NO')` for beløp (`1 450,00`), `Intl.DateTimeFormat('nb-NO')` for dato (`22.08.2026`) — Oslo-tid. Aldri manuell strengbygging.

---

## 4 · Motion

Én delt konstant, ikke per-komponent-timing:

```ts
export const TRAIN_EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';
export const ENTER_CARD = { duration: 520, stagger: 70, y: 18 };
export const ENTER_SHEET = { duration: 440 };
export const PRESS = { scale: 0.97, duration: 180 };
```

Kun `transform` og `opacity`. Respekter `prefers-reduced-motion` ved å nulle varigheten, ikke ved å fjerne elementer.

---

## 5 · Verifikasjon — det som faktisk gir pikselnærhet

Uten en maskinell sammenligning drifter porten. Gjør dette per skjerm:

1. **Referansebilde.** Åpne `.dc.html`-filen, screenshot rammen med gitt `data-screen-label` ved 2× på 390 bredde. Lagre som `tests/visual/ref/<label>.png`.
2. **Storybook/route-story** for den porterede skjermen med **samme faste data** som design-filen (samme navn, samme beløp, samme klokkeslett — ellers sammenligner du innhold, ikke layout).
3. **Playwright + pixelmatch**, terskel 0,1 % piksler ved `maxDiffPixelRatio`. Diff over terskel = feil, ikke «nær nok».
4. **Assert-test på reglene**, ikke bare bildet:
   - nøyaktig én `variant="primary"` per skjerm
   - ingen hex-litteral i `.tsx` (ESLint `no-restricted-syntax` på `/#[0-9A-Fa-f]{6}/`)
   - ingen `backdrop-filter`, `blur`, `linear-gradient` utenfor godkjent rutenett-liste
   - ingen emoji i strenger
   - alle tallformater gjennom `nb-NO`-helper
5. **Fest referansebildet i PR-en.** Diff-bildet i PR-beskrivelsen er det som holder porten ærlig over tid.

Sett terskelen én gang og senk den aldri. Er diffen for stor, er det designfilen som er fasit.

---

## 6 · Rekkefølge for en porteringssession

1. Tokenlag + `Screen` + `Button` + `CapsLabel` + `ListRow` — én PR, ingen skjermer.
2. Visuell-diff-riggen (én skjerm som pilot, f.eks. `FO-05 Fakturaer` — mange rader, mange tall, ingen spesialgeometri).
3. Én PR per skjermfamilie (alle FO-, alle WB-…), ikke én PR per skjerm og ikke alt i én.
4. Uke-rutenettet (`WB-02`) helt til slutt — det er den eneste virkelig vanskelige geometrien og skal ikke blokkere resten.

Lever alltid: filer endret · hvilke `data-screen-label` som er dekket · diff-prosent per skjerm · hva som gjenstår.

---

## 7 · Stopp-regler

Stopp og spør istedenfor å gjette:
- Design-filen mangler en tilstand koden trenger (feil, laster, tom) — den skal **tegnes** først, ikke improviseres i kode.
- Du er i ferd med å innføre en farge, radius eller avstand som ikke står i `DESIGN-SYSTEM.md`.
- Du er i ferd med å bruke ok-grønn utenfor Workbench Player Godta.
- To primære CTA-er havner i samme ramme.
- Et tall i UI-et finnes ikke i datamodellen. Da er svaret tom-tilstand med hel setning, aldri en plassholderverdi.
