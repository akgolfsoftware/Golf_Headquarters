# claude-code-handoff

Handoff-pakke for å bygge **AK Golf HQ** i en ekte kodebase.

**Start i `../CLAUDE.md`** (prosjektroten) — den binder alt sammen. Denne mappa inneholder:

| Fil | Hva |
|---|---|
| `SKJERMER.md` | **Billedkatalog.** Hver skjerm: skjermbilde → kildefil → rute → formål. Slik skal det se ut. |
| `screens/` | PNG av hver ferdige skjerm. |
| `NAVIGASJON-knapp-til-rute.md` | Hver knapp → destinasjonsrute (~150 sider). |
| `TOKENS.css` | Designtokens. Eneste låste verdi: `--lime #D1F843`. Speiles inn i kodebasen. |
| `COPY-ordbok.md` | All tekst: begreper, knappetekst, forbudt-liste, persona-data. |
| `TESTBATTERI.md` | 20 tester, PEI-formel, benchmark-nivåer, scoring. |

Filene er **designreferanser** (HTML-prototyper), ikke produksjonskode. Gjenskap dem i kodebasens
eget miljø med dens etablerte mønstre. Fidelity: **høy (hifi)** — pikselnær.
