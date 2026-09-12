# Grengjennomgang — 12.09.2026

Gjennomgangen avstemmer fersk `origin`, lokale grener, arbeidskopier og åpne pull requests mot `main` på `ca25a7569`. Ingen produksjonsendring, databasekommando, betaling, utsending eller utrulling inngår.

## Resultat

| Gren / arbeid | Funn | Behandling |
|---|---|---|
| `main` | Lokal og `origin/main` var synkronisert på `ca25a7569`. Hovedmappen hadde ucommittert, sammenhengende arbeid for den nye retningen «Atletisk intelligens» og felles språkgrunnlag. | Bevares på egen `codex/athletic-intelligence-design-skills` før samling. |
| `codex/pr841-funn-2026-09-11` | Én ren commit direkte oppå `main`: alternativ statuskontroll for oppfølgingskøen og eksplisitt TrackMan-enhetsrad. 15 målrettede tester, TypeScript og streng lint bestod 12.09. | Kan samles i `main` etter full kvalitetsgate. |
| `origin/claude/ak-golf-hq-five-packages-ioqscd` / PR #843 | Utkast med seks commits og 38 filer. De fem sikkerhetspakkene har samme formål som nyere arbeid som allerede er samlet via PR #840, men med konkurrerende implementasjoner. Simulert merge mot dagens `main` ga 17 innholdskonflikter. PR-en viste 2 av 2 grønne kontroller, men full innlogget spillerreise var ikke utført. | Skal ikke flettes som helhet. Bevar commit `547c506f1` i historikken, lukk den foreldede PR-en og slett fjern-grenen etter avstemming. |
| `codex/manuell-sg-2026-09-11` | Ingen unike commits mot `main`; innholdet er allerede samlet via PR #836. Arbeidskopien ble tidligere beholdt for lokal prototypebruk. | Kan fjernes når ingen lokal server eller privat prototype fortsatt bruker mappen. |
| `codex/athletic-intelligence-design-skills` | Pekte på samme commit som `main`; navnet var klart for det ucommitterte design-/instruksjonsarbeidet. | Brukes til å bevare og kontrollere den nye designretningen før samling. |
| Fem stasher | Historiske/private sikkerhetskopier, ikke aktive funksjonsgrener. | Bevares. De slettes ikke som vanlig grenopprydding. |

## Hvorfor dagens UI ikke slettes

Eksisterende komponenter, stilfiler og ruter bærer fungerende handlinger, datatilstander, tilgangskontroll og historikk. Den nye Claude Design-retningen har ennå ikke status `valgt-for-bygging`. Å slette dagens UI nå ville derfor fjerne implementasjonsgrunnlaget før en kontrollert erstatning finnes.

Riktig overgang er skjermfamilie for skjermfamilie:

1. Claude Design leverer en navngitt versjon med komponentverdier, tilstander og mobil/desktop.
2. Anders velger versjonen for bygging.
3. Koden kartlegges til delte komponenter og verdier i samme reise.
4. Gammel styling fjernes først når innkommende importer er borte og funksjons- og visuell kontroll består.

## Begrensninger

GitHub CLI-tokenet var utløpt. Ferske grener ble hentet med Git over SSH, og PR #843 ble kontrollert lesende i GitHub. Ingen GitHub-kommentar eller PR-status ble endret i denne delen av gjennomgangen.
