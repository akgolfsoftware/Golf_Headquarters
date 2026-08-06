---
description: Sjekker at Supabase-skjemaet matcher Prisma-skjemaet og rapporterer OK/WARN/FAIL
---

Verifiser at databasen faktisk er i den tilstanden koden forventer, uten å gjette.

1. Les `prisma/schema.prisma` for å få forventet skjema (tabeller, kolonner, relasjoner) — 158 modeller per 2026-08-06, ikke anta antall.
2. Hent faktisk skjema fra Supabase — bruk Supabase MCP (`list_tables` med `include_schemas`/detaljert output) hvis tilgjengelig i denne økten. Er ikke Supabase MCP tilkoblet: si fra at sjekken ikke kan kjøres fremfor å gjette, og be Anders koble den til (via `/mcp` eller claude.ai-tilkoblinger).
3. Sammenlign de to, tabell for tabell:
   - Finnes tabellen i begge?
   - Matcher kolonnene (navn, type, nullable)?
   - Matcher foreign keys og indekser der det er kritisk (spillerdata, booking, betaling)?
4. Rapporter i dette formatet, ett funn per linje:

```
[OK]   <tabell> — matcher
[WARN] <tabell> — <hva som avviker, men ikke er kritisk>
[FAIL] <tabell> — <hva som avviker og MÅ fikses før neste deploy>
```

5. Hvis noe er `[FAIL]`: ikke fiks det automatisk. Rapporter og spør Anders om det skal løses med et nytt kirurgisk `db execute`-script (se `.claude/rules/gotchas.md` §Schema-endringer — `prisma migrate dev`/`db push`/`migrate deploy` er alle blokkert/ødelagt i dette repoet) eller om Supabase-siden skal justeres manuelt.
6. Kjør `get_advisors` (security og performance) mot prosjektet som en del av sjekken hvis noe skjema er endret nylig, og ta med eventuelle nye funn i rapporten.
7. Ikke introduser nye avhengigheter for denne sjekken — bruk kun det som allerede finnes i prosjektet (Prisma, Supabase MCP).
