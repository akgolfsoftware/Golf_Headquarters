---
description: Start en ny funksjon — oppretter branch, leser prosjektkontekst, foreslår nummerert plan og venter på OK før noe bygges
---

Du skal starte arbeidet med denne funksjonen: $ARGUMENTS

Følg disse stegene i rekkefølge:

1. Kjør `git checkout main && git pull` for å starte fra oppdatert kode.
2. Kjør `git status` — bekreft at working tree er rent. Hvis ikke: stopp og spør Anders hva som skal gjøres med uncommitted endringer.
3. Les `CLAUDE.md` (repo-rot) og relevante filer i `.claude/rules/` (særlig `gotchas.md` og `beslutninger.md`) hvis du ikke allerede har dem i kontekst.
4. Opprett en ny branch: `git checkout -b feature/<kort-kebab-case-beskrivelse>` (eller `fix/...`) basert på $ARGUMENTS.
5. Lag en nummerert plan (maks 10 steg) for hvordan funksjonen skal bygges. Planen skal:
   - Referere konkrete filer/mapper der det er mulig (`src/app/...`, `src/lib/domain/...` for forretningslogikk)
   - Flagge om oppgaven krever en databaseendring — additive endringer gjøres med kirurgisk `db execute` (tsx-script), ALDRI `prisma migrate dev`/`db push`/`migrate deploy` (alle tre er blokkert/ødelagt i dette repoet, se `.claude/rules/gotchas.md` §Schema-endringer)
   - Flagge om oppgaven berører UI (og dermed krever sjekk av lys/mørk + mobil 390px + desktop, jf. designfasit Claude Paper — se `.claude/rules/beslutninger.md`)
   - Flagge om noe i AK-formel/fagterminologi er uklart og bør avklares med Anders før bygging
6. **Stopp her og vent på eksplisitt OK fra Anders.** Ikke begynn å skrive kode før planen er godkjent.
7. Når OK er gitt: gjennomfør hele planen i én sammenhengende økt. Ikke stopp for å spørre om hvert steg med mindre du støter på noe planen ikke dekket.
8. Underveis: følg reglene i `CLAUDE.md` og `.claude/rules/` (norsk bokmål i UI, Lucide-ikoner, domenelogikk kun i `src/lib/domain/`, PII aldri i prompts).
9. Avslutt med en kort statusoppdatering: hva som ble gjort, hva som gjenstår, og om branchen er klar for `/pr`.
