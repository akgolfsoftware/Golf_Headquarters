# Portstatus Paper — samlet status (oppdatert 17.08.2026)

> **Rolle:** levende samletall for porten. Detaljstatus per fasit-fil bor i
> `PAPER-ZIP-CHECKLIST.md` (sannhetskilden), rekkefølge/blokkeringer i `PORTPLAN.md`.
> Denne fila skal kun speile de to — aldri føre eget regnskap.

## Tallene (talt i checklisten 17.08)

| Måltall | Verdi |
|---|---:|
| Fasit-HTML i speilet `designsystem/paper/` | 254 (zip 16.08 21:11 — 0 avvik) |
| Aktive checklist-rader | 88 |
| `[x]` signert av Anders | **40 (45 %)** |
| `[~]` bygget, ikke signert | **41** |
| `[ ]` ikke bygget | **4 reelle** (2 blokkert: wang-logg-inn, D1; D2 ublokkert, D4 = ~12 testers backfill) |
| `[-]` gjelder ikke | 10 |
| Variantruter kvittert (W3+W4+W5) | **0 av 72** |
| Jarvis-fasiter (`jarvis/`, eget spor PORTPLAN §B6) | 12 — 3 portet (+1 i draft #547) |

## Hva som faktisk gjenstår (prioritert)

1. **Signering er flaskehalsen, ikke bygging.** 41 rader venter kun på galleri + Anders' `[x]`.
   Blokkert av `SCREENTEST_PASSWORD`-rotasjonen (Anders).
2. **W4-variantene (38 ruter) kan kvitteres nå** — alle 8 maler er signert.
3. **PP-B-rest:** montér `Composer` i `V2Shell` (komponent finnes, 0 kallsteder — IKKE gjort;
   `onSend`-mål per flate er en C-bølge-beslutning) · clay-sweepen er **gjort 17.08**
   (32 `enTing`-forekomster i 27 filer fjernet — liste-/skjerm-CTA-er er ink, «Én ting nå»-kortene
   urørt; A3), rest av B2 er `error.tsx` → `V2Feil`, clay-prikken i `VarslerV2` og
   `InnstillingerIntegrasjonerV2` 4 → 1 · verifiser B4 chrome-rest.
4. **25 av 54 rutefasit-rader stryker én-linje-testen** — venter på design (W5) eller
   A1-beslutninger (PORTPLAN §A1, 10 spørsmål til Anders).
5. **Sesjoner klare uten nye svar: ingen igjen.** S23 (#435), S3 (#549), S9 (#553), S17 (#554)
   og S22 (#555) er alle merget — de venter kun på signering, ikke bygging.

## Historikk

Batch-historikken (PR #307–#345, Wave A–I, PP-1/PP-2-bølgene, galleriene 10.–12.08) er slettet
17.08.2026 sammen med de øvrige utgåtte port-dokumentene — den lever i git-historikken og i
merged-PR-listen på GitHub. Signeringer per fil står som `[x]`-datoer i `PAPER-ZIP-CHECKLIST.md`.
