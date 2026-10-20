# Videreføring, funksjonsdekning og tokenkontroll

Oppdatert 13.09.2026. Arbeidsmåte for å fullføre en eksisterende kandidat uten å miste funksjoner eller overdrive bevis.

## Fastslå hva som faktisk er nyest

Les aktive prosjektfiler, manifest og gjeldende beslutninger før redigering. En eldre ZIP er et datert kontrollgrunnlag. Siste svar fra Claude Design er rapportert status til filene og prøvene er undersøkt. Ikke overskriv nyere rettinger med eksporten, og ikke lås neste versjonsnummer uten å se hva som allerede finnes.

Definer nevneren før telling: aktive produksjonslignende designfiler, historiske varianter, komponentbrett og tekniske støttesider er ulike grupper. Tell faktiske filer i hver gruppe. «2 av 18» er ikke gyldig for hele leveransen uten den navngitte listen over 18 filer.

## Kontroller koblingen til designverdiene

1. **Les kilden:** finn faktisk CSS, eventuelt JSON og generator. Avklar hvilken fil som eier verdiene og hvordan de øvrige avledes. Ikke finn på navn fra en navnekonvensjon.
2. **Kontroller referanser:** registrer deklarasjoner og all bruk av `var(...)`, også i importerte stilfiler og generert innhold. Finn uløste navn, kjeder med sirkelreferanser, type-/enhetsfeil og betydninger som ikke finnes i et relevant tema.
3. **Unngå skjulte kopier:** ikke legg inn literal fallback for å få et udefinert designtoken til å se riktig ut. En nødvendig fallback må ha begrunnet funksjon og separat kontroll; den teller ikke som bevis på en løst referanse.
4. **Kontroller bruk per aktiv fil:** en import alene er ikke bevis. Registrer hvilke faktiske komponentegenskaper som leser verdiene, resterende lokale designverdier og begrunnede unntak som bildeinnhold, diagramdata eller separat valgt organisasjonsprofil.
5. **Mål i nettleseren:** bruk `getComputedStyle` på identifiserte elementer og egenskaper i faktisk tema, modus, fokus og tilstand. Registrer forventet og observert verdi samt kildefil/selektor. Kontroll av bare rotens variabelverdi er utilstrekkelig.
6. **Bevis at kilden styrer:** i en isolert kopi endres ett relevant token midlertidig. Bekreft at de tilknyttede komponentene endres og at uvedkommende profiler ikke påvirkes. Tilbakestill, kontroller igjen og dokumenter prøven. Dette avdekker hardkodede verdier som tilfeldigvis matcher.
7. **Kontroller semantikk og lesbarhet:** sekundærtekst, dempet informasjon, deaktivert kontroll og fokus er forskjellige roller. Lik hex beviser ikke riktig rolle. Ikke gjør viktig tekst svakere ved å gjenbruke deaktivert stil. Fokus hentes fra den aktuelle, valgte profilen og kontrolleres på reelle bakgrunner.
8. **Prøv etter portering:** migrer systematisk per fil/familie, kontroller berørte handlinger og visninger, og oppdater felles register. Én riktig tokenprøve godkjenner ikke resten. Regenerer avledede filer og kontroller samsvar.

Udefinerte CSS-variabler kan gi arv eller standardverdi i stedet for en tydelig visuell feil. «Fallback fjernet» er derfor ikke nok; statisk referansekontroll og måling av faktisk komponent kreves sammen. Eksakte tokennavn og farger hører til kandidatens filer, ikke til en generell skill.

## Fullfør arbeidsoppgavene

Kryssjekk funksjonsfamilier, detaljerte funksjonskort, reiser og ruter hver for seg. Bruk `FAM:`, `KORT:` og `REISE:` ved ID-kollisjon. Hvert avklart funksjonskort trenger skjerm/mønster, handling, relevante tilstander og kontroll. Åpne produktvalg beholdes synlige uten at nevneren reduseres.

Bevar særlig planlegging fra år/periode til økt, gruppe til individ med synlige unntak, teknisk oppgave med mål/kilder/revisjon, analyse til nytt tiltak og coaching fra forberedelse til levert oppfølging. Tegnet knapp, klikkbar simulering og faktisk lagring er ulike bevis.

Planstatus, gjennomføring, lagring og deling/levering beskrives uavhengig. Vis bare relevante statuser i konteksten. Ved ukjent utfall kontrolleres status før en ny handling kan gjenta arbeidet.

## Lever kontrollerbare filer

Lever én hovedprompt/startfil, manifest med aktive versjoner, kildegrunnlag, felles designverdier, komponent-/skjermkontrakter, sammenhengende prototype og bevislogg. Generer JSON og CSV fra samme register. Kontroller relative stier, nødvendige ressurser og at ZIP-en faktisk kan åpnes. Beregn kontrollsummer; ikke skriv dem fra hukommelsen.

Bruk syntetiske data. Kontroller også skjulte data, JavaScript, filnavn, bilder og metadata før skyeksport. Originalkilder med ukontrollert personinnhold erstattes av tydelig merkede, bearbeidede referanser. En statisk referanse må ikke omtales som en bevart fungerende prototype.

Kontroller som ikke er utført, merkes som utestet. Ny samlet kandidat forblir uvalgt inntil Anders velger den; allerede valgte delomfang, som Team Norway Claw, beholder sin særskilte status.
