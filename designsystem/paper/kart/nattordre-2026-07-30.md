# NATTORDRE — autonom kjøring 30.–31.07.2026

Eiers instruks: jobb uten videre bekreftelse gjennom natten. Mål ved morgen:
designsystemet komplett, wireframes av ALT (mobil + desktop), og hi-fi-skjermene
i porteringsrekkefølgen så langt tiden rekker — alt klart for én samlet review,
og portering til kode kan starte i morgen tidlig.

Denne ordren endrer HVORDAN portene i `kart/masterordre-fase2-2026-07-30.md`
håndteres i natt — den endrer ingen faglige regler. Readme-reglene, gulvregelen,
fargedisiplinen, `@layer`, container queries og leveransekravene gjelder ufravikelig.

## 1 · Beslutninger som er låst for natten (ingen spørsmål tilbake)

De ni seksjonsspørsmålene i `kart/restanse-systemspor-2026-07-30.md` avsnitt 5
avgjøres NÅ etter anbefalingene, som **midlertidige beslutninger merket [natt]**.
Eier kan omgjøre hver enkelt i morgenreviewen; skjermene bygges så omgjøring er
billig (seksjonsvis, ikke flettet inn i alt):

1. Kø får snooze MED synlig «utsatt til»-tilstand (raden forsvinner aldri stille).
2. Økonomi: timegrunnlag → faktura som egen godkjenningsrunde.
3. Booking: avbestillingsfrist og gebyr synlig i steg 4, før bekreftelse.
4. Kalender: filtrer til ett selskap, «alle» som eksplisitt valg.
5. Drift: varelager er egen flate (S13), ikke del av drift.
6. Plan: publisering modelleres for «eier + delegerbar til Markus for junior» —
   UI viser rollen, CBAC-detaljen avgjøres i kode senere.
7. Stall: «trenger deg»-signalet synlig som begrunnelse på kortet.
8. AgenticOS: lesing + «kjør på nytt», aldri start-fra-bunn.
9. Fullskjerm: eksplisitt «Avslutt økt» med ConfirmDialog.

## 2 · Porter i natt: selvverifiser + logg, aldri stopp

- **Wireframe-porten (trinn 1):** ikke vent på eier. Fullfør galleriene, logg dem
  som «klar for review», og gå videre til trinn 2/3.
- **P7/craft-porten:** kan ikke lukkes i natt (krever verifikatør med rendret side).
  Logg «P7 utestående» per leveranse — aldri meld den grønn.
- **Alle målbare porter** (gulv, lag, kollisjoner, korthøyder, tilstandsmatriser):
  kjøres som normalt, med måling. En målbar port som feiler STOPPER den leveransen
  til den er rettet — autonomi gjelder fremdrift, ikke kvalitet.
- **Uavklarbare funn** (motstridende kilder, manglende data): ta det mest
  konservative valget, logg det i nattloggen med [valg]-merke, fortsett.

## 3 · Rekkefølgen i natt (fra masterordren, uendret)

1. Trinn 0: dekningsvurderingens fire målespørsmål → hele Bolk 0 (seks punkter +
   dokumentrettelsene). Først når riggen kjører grønt med selvtest: videre.
2. Trinn 1: wireframe-galleriene — AgencyOS, PlayerHQ, Foreldreportal, Auth.
   Alle i 860 px + 430 px stakket.
3. Trinn 2: bølge P1 (skall) → P2 (skjema) → så langt natten rekker etter
   bølgerekkefølgen, med K1 QueueCard prioritert før hi-fi av Kø.
4. Trinn 3: hi-fi i porteringsrekkefølgen — S2 Kø → S1 Hjem → S3 Stall+profil →
   videre så langt tiden rekker. Hver ferdig skjerm er ett porterbart artefakt.

Prioritet ved tidsnød: en FERDIG, målt skjerm slår to halvferdige. Kutt bakerst
i rekkefølgen, aldri i kvaliteten på det som leveres.

## 4 · Morgenrapporten (skrives til `kart/fremdrift-fase2.md`)

Én rapport, klar før morgenen:
- Dekning x/223 · y/151, begge [målt].
- Liste: klart for portering (skjerm → template-sti → V2-komponent i repoet den erstatter).
- Liste: klar for review (wireframe-gallerier + [natt]-beslutningene 1–9 + alle [valg]).
- Liste: utestående (P7-verifiseringer, det som ikke ble rukket, i rekkefølge).
Ingen grønn påstand uten måling — [målt]-disiplinen gjelder også klokka fire om natten.
