# claude-code-handoff

Handoff-pakke for å bygge **AK Golf HQ** i en ekte kodebase. **Delt i to spor:**

| Spor | Inngang | For hvem |
|---|---|---|
| **DEL 1 — Design** | `DEL-1-DESIGN.md` | Claude Design: hvordan hver skjerm ser ut + knapp → skjerm |
| **DEL 2 — Kode** | `DEL-2-KODE.md` | Claude Code: ruter, nav-bugs A1–A5, tester, lansering |

**Start i `../CLAUDE.md`** (prosjektroten) — den binder alt sammen. Filene i mappa:

| Fil | Spor | Hva |
|---|---|---|
| `DEL-1-DESIGN.md` | 1 | **Inngang design.** Router til diagram, prompt, billedkatalog, tokens, copy. |
| `DEL-2-KODE.md` | 2 | **Inngang kode.** Ruter, bugs A1–A5, IA-beslutninger, lanserings-sjekkliste. |
| `NAV-DIAGRAM.html` | 1+2 | **Interaktivt flytskjema.** Klikk skjerm → knapper + destinasjon + kildefil. Åpne i nettleser. |
| `CLAUDE-DESIGN-PROMPT.md` | 1 | Selvstendig design-prompt med kode-forankret «knapp → skjerm». |
| `SKJERMER.md` | 1 | **Billedkatalog.** Hver skjerm: skjermbilde → kildefil → rute → formål. |
| `screens/` | 1 | PNG av hver ferdige skjerm. |
| `NAVIGASJON-knapp-til-rute.md` | 2 | Kode-verifisert knapp → skjerm (alle 406 ruter) + bugs + foreldreløse + dubletter. |
| `TOKENS.css` | 1+2 | Designtokens. Eneste låste verdi: `--lime #D1F843`. Speiles inn i kodebasen. |
| `COPY-ordbok.md` | 1+2 | All tekst: begreper, knappetekst, forbudt-liste, persona-data. |
| `TESTBATTERI.md` | 2 | 20 tester, PEI-formel, benchmark-nivåer, scoring. |

Filene er **designreferanser** (HTML-prototyper), ikke produksjonskode. Gjenskap dem i kodebasens
eget miljø med dens etablerte mønstre. Fidelity: **høy (hifi)** — pikselnær.
