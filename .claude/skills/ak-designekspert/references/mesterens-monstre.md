# Mesterens mønsterbibliotek — verdens ledende apper → AK Golf HQ

50 års erfaring betyr å vite hvilke mønstre som vant, hvorfor de vant, og hvor de hører hjemme. Lån mønsteret, aldri huden — alt uttrykkes gjennom AK-tokens og det visuelle språket.

## Mønstre per flate

**AgencyOS (coach-arbeidsflater) ← Linear**
Tetthet med ro: mye informasjon, lav visuell støy. Keyboard-first — hver kjernehandling har snarvei, command palette er ryggraden. Optimistisk UI: handlingen skjer umiddelbart, lagring bekreftes diskret. Lister med rad-hover som avslører handlinger, aldri permanente knapperader.

**Booking og betaling ← Stripe**
Tillit gjennom presisjon: beløp, dato og vilkår alltid synlige før bekreftelse, aldri overraskelser etter. Betalingstilstander er førsteklasses design (venter/betalt/feilet/refundert), ikke etterpåklokskap. Skjema-craft: ett spørsmål av gangen der det er mulig, inline-validering som hjelper (ikke straffer), feilmeldinger som sier hva og hvordan.

**PlayerHQ statistikk og helse ← Whoop, Strava, Oura**
Data som fortelling, ikke dashboard: score → trend → forklaring → anbefalt handling, i den rekkefølgen. Ett hovedtall per visning med kontekst under. Recovery/readiness-mønsteret oversatt: spillerens tilstand først, årsaken ett trykk unna. Sammenlign alltid mot spillerens egen baseline før mot andre.

**PlayerHQ mobil-ergonomi ← Apple HIG**
Tommelsonen eier primærhandlinger. Sheets over sider for sekundære flyter (behold kontekst). Progressive disclosure: vis det nødvendige, resten ett trykk unna. Pull-to-refresh og swipe-mønstre der de er etablert — aldri finn opp ny gestikk.

**Marketing og booking-flyt ← Airbnb**
Foto og sosial bevis bærer salget; teksten støtter. Prisen alltid ærlig og synlig. Booking-trakten mister aldri brukerens valg mellom steg.

**AK-stigen og progresjon ← Duolingo, med veteran-filter**
Nivåer, XP og streaks motiverer — men juniorfilteret er absolutt: aldri skyld-mekanikk (mistet streak = nøytral, ikke sorg), aldri press-notifikasjoner, fremgang feires mot egen historikk. Gamification serverer treningsglede, aldri avhengighet.

**Tomme tilstander ← Notion**
En tom flate er onboarding, ikke blindvei: forklar hva som hører hjemme her + én handling for å komme i gang. Gjelder alle data-komponenter (spiller uten tester, uke uten økter).

## Anti-mønstre — sett dem feile i 50 år, avvis på syne

- **Dashboard-grøt:** åtte likestilte kort = ingenting viktig. Én jobb per skjerm, ett fokuspunkt.
- **Innstillings-kirkegård:** funksjoner gjemt bak tannhjul fordi ingen turte prioritere. Prioriter i flaten.
- **Modal-inception:** modal som åpner modal. Maks ett lag; trenger du mer er flyten feil.
- **Data uten dom:** tall uten trend, kontekst eller anbefaling. Plattformen har en mening — vis den.
- **Gamification-gjeld:** poeng på alt til poeng betyr ingenting. Belønn kun det metodikken vil ha mer av.
- **Onboarding-avhør:** tjue spørsmål før verdi. Vis verdi først, spør underveis.
- **Konsistens-brudd for lokal genialitet:** en «bedre» løsning på én skjerm som bryter systemet er en dårligere løsning. Systemet vinner; vil du endre mønsteret, endre det i designsystemet for alle.
