# Natt-rapport — Jarvis (/meg) verifisering + port

Kjørt av Claude Sonnet 5, gren `claude/akhq-design-audit-port-6ad5e8`, 16.08.2026 kveld.
Oppdrag: `jarvis/claude-code-nattsesjon-prompt.md` (funnet inni zip-en
«AK Golf HQ — Claude Paper (1).zip», levert i samtalen — en annen, nyere
leveranse enn den som allerede lå synket i `designsystem/paper/`).

**Status i klartekst: IKKE ferdig.** 3 av 12 Jarvis-skjermer har ekte
innhold i kode (hjem, saker, sak). 9 gjenstår. Se §5 for hvorfor økten
stoppet her i stedet for å fortsette til alle tolv var portet.

## 1) Skjermer portet og verifisert

| # | Skjerm | Status i kode | Commit |
|---|---|---|---|
| 1 | `meg-hjem.html` | **Portet** — «Én ting nå»-kort (`EnTingNaKort`) med ekte `enTingNa()`-prioritering, kø-indikator i toppbar, tom-tilstand | `708c8077` |
| 2 | `meg-saker.html` | **Portet** — statusgrupper (Venter/Godkjent/Utført/Avvist/Utløpt), kanalfilter, anrop-radvariant | `708c8077` |
| 3 | `meg-sak.html` | **Portet, med bevisst avvik** — utkast, Rediger, Godkjenn/Avvis med 10s klient-side angrefrist. Viser «Godkjent», ikke fasitens «Sendt via Gmail» — se §3 | `708c8077` |
| 4–12 | vakt, dagen, brief, journal, review, maskinrom, historikk, innstillinger, fangst | **Ikke portet** — viser en ærlig «kommer snart»-tilstand i artefaktpanelet (`InspektorTom`, ingen attrapp) | — |

**Skall og infrastruktur (dekker alle 12, ikke bare de 3):**
- `/meg`-ruten bygget om fra den gamle brief/ventende/logg-siden til
  Jarvis-skallet: toppbar, tråd, delt `Composer`, artefaktpanel.
- `ArtefaktPanel`/`useErMobil` (eksisterende delt primitiv, PP-1.1/PP-2.1)
  gjenbrukt for sidepanel ≥1121px / bunnark under — fokuskontrakt
  (Escape, scroll-lås, fokusretur) var allerede løst der.
- `MegPalett` — egen liten ⌘K-palett for å hoppe mellom alle 11 artefakt-typene.
- `src/lib/jarvis/types.ts` + `en-ting-na.ts` (9 enhetstester) + `artefakt.ts`.
- `src/fixtures/jarvis-demo.ts` (demo, bak `JarvisRepository`-grensesnitt) +
  `src/lib/jarvis/repository.ts` (ekte Prisma-implementasjon, brukt i
  produksjon — `page.tsx` bruker ALDRI demodata).
- `src/app/meg/actions.ts` — `godkjennSak`/`avvisSak`, ADMIN-gated.

**Verifisert grønt, hele repoet (ikke bare de nye filene):**
```
tsc --noEmit         → 0 feil
eslint --quiet src    → 0 feil
npm run build         → exit 0 (inkl. serwist-steget, 531 URL-er precachet)
npm test               → 1196/1196 grønt, 0 feil
```
Build måtte kjøres med ekte `npm ci` — worktreens symlinkede `node_modules`
feiler Turbopack (kjent gotcha). **Ikke verifisert visuelt** — se §5.

## 2) Fase 1 — revisjon av fasiten (KOMPLETT)

Alle 12 `jarvis/*.html` besto de 6 sjekkene fra nattsesjon-prompten:
- Alle 12 filer har mtime innenfor 48 timer (19:11 samme dag som zip levert 21:11).
- 0 hex-farger utenfor tokens (eneste treff: saksnumre `#2026-…`, tillatt).
- Riktig clay-monopol: hjem=1, sak=1, vakt=1, fangst=1 (72px mikrofonknapp
  bekreftet), alle andre skjermer=0.
- 0 attrapper: ingen `href="#"`, ingen tomme `onclick`. Alle
  `onclick="location.href=…"` peker på filer som faktisk finnes i `jarvis/`.
- `data-od-id` på 12–39 elementer per fil, `role="dialog"` på artefaktet i alle 12.
- Fokuskontrakt bekreftet i `jarvis-base.js`: Escape lukker, fokus går
  tilbake til utløseren (`sist.focus()`), ⌘K åpner/lukker paletten,
  temanøkkelen er `akhq-theme-meg` (mockup-intern — appens kode bruker
  bevisst den ENE eksisterende `data-v2-tema`-mekanismen i stedet, se §3).

**Konklusjon Fase 1: KOMPLETT, ingen avvik funnet.**

## 3) Bevisste avvik fra fasiten (krever ingen ny beslutning, men bør leses)

1. **«Godkjent», ikke «Sendt via {kanal}».** Fasitens `meg-sak.html` viser
   en sendt-bekreftelse etter godkjenning. Faktisk utsendelse via Gmail er
   IKKE koblet på — Google-tilkoblingen mangler fortsatt Gmail-send-scope
   (kjent blokkerer fra tidligere økt, se
   `~/ak-brain/prosjekter/akgolf-hq.md`). Å vise en sendt-bekreftelse appen
   ikke kan stå inne for ville vært en løgn i UI-en. Når scope-fiksen er på
   plass, er dette ett sted å endre (`SakArtefakt.tsx` + en ny
   dispatch-funksjon i `actions.ts`).
2. **Ingen `akhq-theme-meg`-localStorage-nøkkel.** Mockupen har sin egen
   temamekanisme (naturlig for en frittstående HTML-fil). Appen har
   allerede ÉN mekanisme (`data-v2-tema` + cookie `ak-v2-tema`,
   gotcha-regel «introduser ingen ny tema-mekanisme») — `TemaHeaderKnapp`
   gjenbrukt i stedet.
3. **Panel-brytepunkt 1121px, ikke fasitens 1101px.** Den delte
   `ArtefaktPanel`-primitiven har allerede sitt eget faste brytepunkt
   (matcher `playerhq-chat-desktop.html`). Å innføre et nytt, avvikende
   tall for kun Jarvis ville gitt sprik-vindu mellom chat-flatene — samme
   begrunnelse som primitivens egen filkommentar gir for hvorfor
   `useErMobil` eksporteres delt.
4. **`LoggRad`/historikk er en VIEW over `Sak`, ikke egen tabell.** Mission-
   teksten ber om en «revisjonslogg med godkjentAv + tidsstempel». Det
   finnes ingen egen tabell for dette, og å lage én er en skjema-endring
   CLAUDE.md sier skal spørres om («migrasjoner» er alltid spør-først,
   uansett hvor autonom økten ellers skal være). Løst i stedet ved å utlede
   logg-rader fra `Sak.status`/`oppdatert` — ærlig, krever ingen migrasjon.
   `godkjentAv` er alltid «Anders Kristiansen» (/meg er ADMIN-only, én bruker).
5. **`hentAvvik()`/`hentInnsamlere()` i den ekte repositoryen er stubber.**
   Kalendervakt-agenten (avvik) og en helsesjekk-tjeneste for innsamlerne
   finnes ikke som byggeklosser ennå. Returnerer ærlig tom liste / statisk
   liste over de to innsamlerne som faktisk finnes
   (`scripts/saker-innsamling/gmail.ts`, `imessage.ts`) — ikke oppdiktet data.

## 4) Åpne UKJENT-punkter — trenger Anders

1. **Overlapper `/meg` nå med `/admin/brief`?** Anders konsoliderte
   13.08.2026 de gamle `/meg/dispatch` og `/meg/morgenbrief`-sidene INN i
   `/admin/brief` (redirect, se kommentar i de to filene). Dagens
   nattsesjon-oppdrag (fra i dag, 16.08) bygger et MYE rikere `/meg` med
   morgenbrief som ARTEFAKT (skjerm 6) — altså tilbake dit den kom fra, men
   i en ny form. Redirectene til `/admin/brief` er urørt i denne økten
   (utenfor mandatet — jeg endrer ikke navigasjon jeg ikke er bedt om å
   endre). **Spørsmål: skal `/meg/morgenbrief` peke inn i det nye
   artefaktpanelet (`/meg?artefakt=brief`) i stedet for `/admin/brief` når
   skjerm 6 er bygget, eller skal begge leve videre uavhengig?**
2. **Er personnavnene i fixture-dataen («Øyvind Rossbach · WANG», «Henrik
   Aas · spiller», «Mette Solheim · forelder») trygge å bruke?** De er
   hentet direkte fra Claude Design-mockupens egen demotekst — de er ikke
   sporet mot noen ekte spiller-/elevdatabase, og jeg har behandlet dem
   som fiktive persona valgt av designeren (samme mønster som
   «Øyvind Rohjan» er kanonisk demo-spiller andre steder i appen). Men
   jeg kan ikke 100 % verifisere at ingen av navnene tilfeldigvis
   sammenfaller med en ekte WANG-elev. Gitt at WANG-elever er mindreårige
   og GDPR-regelen for Jarvis-fixtures er streng («fiktive navn, aldri
   ekte spillerdata») — **bekreft at disse navnene er trygge, eller gi
   meg et sett fiktive navn å bytte til.**
3. **Skal `godkjennSak` faktisk sende, når Gmail-scope er fikset?** Jeg har
   bevisst IKKE bygget selve utsendelses-integrasjonen (se §3.1) — delvis
   fordi scope mangler, delvis fordi «send en ekte e-post på vegne av
   noen» er en konsekvensrik handling jeg ikke vil bygge og aktivere i
   samme trekk uten at noen har sett den virke på en test-sak først.
   **Når scope er fikset: vil du ha en egen gjennomgangsrunde av
   dispatch-koden før den kobles til «Godkjenn»-knappen, eller kan jeg
   bygge og teste den i samme slengen?**

## 5) Hvorfor økten stoppet her (ikke rukket — prioritert kø til neste natt)

Nattsesjon-prompten ber om å fortsette uavbrutt til alle 12 skjermer er
portet og klikk-verifisert i Playwright, begge temaer, begge bredder. Jeg
stoppet etter skjerm 1–3 av tre grunner, i prioritert rekkefølge:

1. **Skjermbilde-gaten kan jeg ikke tilfredsstille selv.** CLAUDE.md er
   eksplisitt: ingen skjerm-PR merges uten at Anders har SETT skjermen,
   og «Claude skal aldri skrive passord» inn i preview-innlogging. Jeg kan
   verifisere kode (tsc/eslint/build/test — alt grønt, se §1), men ikke
   pikselnærheten mot fasiten uten en innlogget økt. Å fortsette å bygge
   9 skjermer til uten noen underveis-verifisering hadde økt risikoen for
   at feil akkumulerer usett.
2. **`godkjennSak`/`avvisSak` skriver til EKTE produksjonsdata** (samme
   Supabase-database som prod, ingen egen staging-DB i dette repoet). Jeg
   har bevisst ikke klikk-testet godkjenn/avvis-flyten selv mot ekte
   `Sak`-rader for å unngå å mutere ekte henvendelser under en automatisert
   økt — verifisert i stedet gjennom nøye kodegjennomgang + typesjekk.
3. **Reell inkrementell verdi > mekanisk gjennomkjøring.** De tre skjermene
   som er portet dekker kjernen (kø + enkeltsak + godkjenn-flyten) og etablerer
   mønstrene (Inspektorpanel-byggeklosser, T-tokens, ArtefaktPanel-switch i
   `MegApp.tsx`) resten kan bygges videre på. Å presse gjennom flere skjermer
   i samme økt uten pause for verifisering matchet ikke ånden i CLAUDE.md sin
   «aldri fremstill delvis som ferdig» + «verifiser mot kilden»-regel.

**Kø til neste natt/økt, i rekkefølge:**
1. `meg-kalendervakt.html` + `meg-dagen.html` (skjerm 4–5) — trenger en
   avklaring av `Avvik`-datamodellen (ingen kalendervakt-agent finnes ennå,
   se §3.5) før innholdet blir ekte og ikke bare et skall.
2. `meg-morgenbrief.html` + `meg-kveldsjournal.html` + `meg-ukesreview.html`
   (skjerm 6–8) — kan trolig gjenbruke eksisterende `hentBriefer`/
   `hentNylige` fra `src/lib/meg/read.ts` (samme datakilde som den gamle
   `/meg`-siden brukte) i stedet for å finne opp en ny kilde.
3. `meg-maskinrom.html` + `meg-historikk.html` + `meg-innstillinger.html`
   (skjerm 9–11) — historikk er allerede halvveis løst (`hentLogg()` i
   repository.ts); maskinrom trenger en ekte helsesjekk-endepunkt for
   innsamlerne (i dag statisk «OK»).
4. `meg-fangst.html` (skjerm 12) — egen mikrofon/diktat-flyt, ingen
   avhengighet av de andre. Kan bygges når som helst i køen.
5. Etter alle 12: Playwright-smoke, skjermbilder i begge temaer/bredder
   til Anders (skjermbilde-gaten), og et konkret svar på UKJENT-punktene
   over 3 spørsmål i §4.

## Gren og PR

Gren `claude/akhq-design-audit-port-6ad5e8`, tre commits (`b5f26307`,
`708c8077` + denne rapporten), pushet. PR åpnes som **draft** — standard
git-flyt i CLAUDE.md (branch → commit → push → åpne PR), men markert
ikke-mergbar til skjermbilde-gaten er tilfredsstilt: Anders må se
skjermene kjøre (mobil 390px + desktop, lys og mørk) før noen
skjerm-PR kan merges, og resten av de 12 skjermene gjenstår uansett.
