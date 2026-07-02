# DEL 1 — DESIGN-handover

> **Hvem dette er for:** Claude Design (og enhver som jobber med utseende/UX).
> **Spørsmålet denne delen svarer på:** *Hvordan skal hver skjerm SE UT, og hvilken skjerm ligger bak hvilken knapp?*
>
> Dette er det ene av to handover-spor. Det andre er `DEL-2-KODE.md` (backend, ruter, tester, bygging).

---

## Start her (i rekkefølge)

1. **`NAV-DIAGRAM.html`** — *åpne i nettleser.* Interaktivt flytskjema over hele appen. Klikk en
   skjerm → se knappene dens, hvor de fører, kildefila og evt. bug/foreldreløs-merknad. Filtrér på
   produkt + bugs/foreldreløse/dubletter + søk. **Dette er den raskeste veien til «knapp → skjerm».**
2. **`CLAUDE-DESIGN-PROMPT.md`** — den selvstendige prompten du kjører Claude Design mot. Inneholder
   gullregelen (riktig skjerm bak riktig knapp), produktkontekst, designretning og kode-forankret nav-fasit.
3. **`SKJERMER.md`** + **`screens/`** — billedkatalogen. Hver rad: rute → **skjermbilde** → eksakt
   `.dc.html`-kildefil → formål. **Bildet + kildefila er fasiten — ikke gjett på utseendet.**
4. **`TOKENS.css`** — designtokens. Eneste låste verdi: lime `#D1F843`. Bygg mot disse.
5. **`COPY-ordbok.md`** — all tekst: begreper, knappetekst, forbudt-liste, persona-data (ØR, Anders K.).

## Designretning (kort)

«Terminal-lys»: varm cream-base ladet med terminal-energi. Tallet er helten (JetBrains Mono, tabular,
komma-desimal, signert delta ▲▼ + farge). Hairlines deler celler/rader. Mørke datamoduler på lys side.
Lime = kun signal (CTA · aktiv · puls · fokus · positiv delta), aldri store flater. AgencyOS = mørk
terminal. Lucide-ikoner (1,5px), ingen emoji. Norsk bokmål «du». Full retning står i
`CLAUDE-DESIGN-PROMPT.md` §3 og i prosjektets `../CLAUDE.md` §3.

## Ferdig-kriterier per skjerm (DoD)

- [ ] Matcher skjermbildet i `screens/` + kildefila i `SKJERMER.md` (layout, hierarki, farge, tetthet).
- [ ] Terminal-lys: cream-base, mono-tall, hairlines, mørke datamoduler der data er tungt.
- [ ] Responsiv 375 / 768 / 1280 — ingen horisontal scroll.
- [ ] Tall: mono, tabular, komma-desimal, signert delta ▲▼ + farge.
- [ ] Kun Lucide (1,5px). Ingen emoji / hjemmetegnet SVG.
- [ ] Tekst følger `COPY-ordbok.md`. Bokmål «du».
- [ ] Alle fire tilstander: innhold · tom (med neste handling) · laster (skeleton) · feil.
- [ ] Ingen døde knapper — hver knapp har destinasjon (se `NAV-DIAGRAM.html`); kjerne ≤ 2 trykk.

## Filene i dette sporet

| Fil | Hva |
|---|---|
| `NAV-DIAGRAM.html` | Interaktivt flytskjema: knapp → skjerm, på tvers av alle fire produkter. |
| `CLAUDE-DESIGN-PROMPT.md` | Selvstendig design-prompt med kode-forankret «knapp → skjerm»-fasit. |
| `SKJERMER.md` | Billedkatalog: rute → skjermbilde → kildefil → formål. |
| `screens/` | PNG av hver ferdige skjerm. |
| `TOKENS.css` | Designtokens. `--lime #D1F843` låst. |
| `COPY-ordbok.md` | All tekst: begreper, knappetekst, forbudt-liste, persona-data. |

> Kildefilene (`.dc.html`) ligger i prosjektroten og åpnes via `SKJERMER.md`. De er **designreferanser**
> (HTML-prototyper), ikke produksjonskode — gjenskap dem i kodebasens eget miljø. Fidelity: **høy (hifi)**.

*Navigasjons-detaljer på rute-nivå (alle 406 ruter) hører til `DEL-2-KODE.md` → `NAVIGASJON-knapp-til-rute.md`. Ved konflikt vinner den koden.*
