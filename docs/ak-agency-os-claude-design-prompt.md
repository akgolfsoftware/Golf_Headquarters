# Claude Design-prompt — AK Agency OS (personlig kommandosenter)

Lim hele blokken under inn i Claude Design. Den er låst til IA-en vi har bygget
(unngår «IA-drift»), bruker eksakte AK-tokens, og designer for ADHD som hard føring.
Relatert: `docs/ak-agency-os-plan.md` (full plan), rute `/kommando`.

---

```
Oppdrag: Design «AK Agency OS» — et personlig kommandosenter for Anders Kristiansen
(CEO, AK Golf Group). Dette er hans eget produktivitets-OS der han styrer alle
AI-verktøyene sine og dagen sin på ett sted. Del av AK Golf HQ-plattformen, men et
eget rom. Alltid mørkt «terminal»-tema. UI-tekst på norsk bokmål.

VIKTIGST — Anders har ADHD. Design for det (HARD føring, ikke bonus):
- Én tydelig ting i fokus per skjerm. Det viktigste er størst. Ikke 12 likeverdige bokser.
- Rolig og ryddig, aldri overveldende. Bruk tomrom. Skjul detaljer til de trengs.
- «Hva nå?» skal alltid være åpenbart — dagens viktigste / neste handling fremst.
- Lime-aksent (#D1F843) KUN på den ene tingen som krever oppmerksomhet nå
  (aktiv / haster / NÅ). Det er blikk-ankeret hans. Aldri lime overalt.
- Forutsigbar, identisk layout-logikk på alle skjermer. Ingen overraskelser.
- Synlig fremdrift gir momentum: hake, fremdriftslinje, «3/5 steg».
- Minimal input: smarte standarder, få valg per handling.

LÅST informasjonsarkitektur — IKKE finn opp ny navigasjon:
Venstre ikon-rail, nøyaktig disse 6 i denne rekkefølgen:
  1) Dashboard  2) Agenter (AI-chat)  3) Oppgaver  4) Kalender  5) Prosjekter  6) Team
Toppbar: ordmerke «AK · AGENCY OS» til venstre; hilsen «God dag, Anders» + dato til høyre.
Ingen lys/mørk-toggle. Kun mørkt tema.

Skjermer som skal designes (desktop ~1280px):
1. Dashboard (hjemskjerm — gjør «hva skjer i dag» krystallklart):
   KPI-stripe med mono-tall (Modeller, Åpne oppgaver, AI-kjøringer, Prosjekter),
   så paneler: «AI-agenter» (status per modell), «I dag» (dagens avtaler + frister),
   «Agent-team» (siste kjøring + fremdriftslinje), «Oppgaver» (de viktigste få).
2. Agenter: chat mot 4 AI-er (Claude, Gemini, Grok, Ollama) med modellvelger øverst.
   Rolig chat-flate, strømmende svar, ett tekstfelt nederst.
3. Oppgaver: enkel liste. Legg til (tittel + valgfri «haster» + prosjekt + frist),
   hak av, slett. «Haster» som tydelig, men rolig varsel-chip.
4. Kalender: måned + uke-visning. Viser avtaler og oppgavefrister. Lesbar, ikke tett.
5. Prosjekter: kort-rutenett. Hvert kort: navn + antall oppgaver. Opprett / arkiver.
6. Team (agent-team): definer ÉN oppgave → tre AI-er jobber etter hverandre
   (Research → Utkast → Gjennomgang) med live fremdrift (status-ikon per steg) +
   resultat. Tidligere kjøringer som sammenleggbar historikk under.

Design-DNA — eksakte verdier, ikke gjett:
- Bakgrunn #07100C · Kort #11221A · Tekst #EAF2EC · Dempet tekst #9DB0A4 · Kantlinje #243A2E
- Lime-aksent #D1F843 (mørk tekst #0A1F17 oppå lime) · OK #4FD08A · Advarsel #E8B43C · Feil #F0683E
- Fonter: Inter (UI/brødtekst), Inter Tight (overskrift/display), JetBrains Mono (alle tall + små etiketter)
- Ikoner: kun Lucide-stil, 1.5px strek. INGEN emoji.
- 8pt-grid. Data-tette flater (dashboard, lister) kan bruke 12–14px tetthet
  (Bloomberg-aktig), men hold helheten rolig.

Leveranse: Alle 6 skjermene i sammenhengende stil, mørkt tema. Start med Dashboard
(det er hjertet). Hold ADHD-føringene synlige i hver eneste skjerm.
```

---

## Slik bruker du den (3 steg)
1. Kopier hele blokken over.
2. Lim inn i Claude Design, send.
3. Få skjermene tilbake → send dem til meg, så porter jeg det inn i appen via design-gaten.
