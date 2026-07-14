# AK Golf — datadrevet plattform: komplett plan og status

> **Dato:** 2026-06-28 · **Eier:** Anders Kristiansen, AK Golf Group
> **Hva dette er:** Én samlet referanse for hele det datadrevne løftet — fra DataGolf-data til
> verdens beste treningsverktøy, akgolf.no-funnel, live-resultat-hub, og hvordan alt henger sammen
> teknisk. Samler innholdet fra: `datagolf-produktvisjon.md`, `akgolf-stats-claude-design-prompt.md`,
> `ak-golf-intelligence-konsolidering.md`.

---

## 1. Det store bildet (hvordan alt henger sammen)

| Lag | Hva | Rolle |
|---|---|---|
| **AK Golf Intelligence** (`ak-golf-intelligence`) | Datamotoren: master-data (DataGolf, WAGR, turneringer, kohort, college) + delbar API (`/api/v1`) | Én sannhet for all referanse-/proff-data. Mater alt annet. |
| **akgolf.no** (offentlig `/stats`) | Gratis stats-/resultat-flate + funnel | Drar trafikk → selger PlayerHQ |
| **PlayerHQ** (`/portal`) | Personlig benchmark-motor (betalt) | Spilleren ser seg selv mot nivåene |
| **AgencyOS** (`/admin`) | Coach ser spillerne mot benchmarks | Coaching-verktøy |
| **masterbrain** (kunnskapslager) | Ferdig SG-benchmark-kunnskap: baselines, formler, amatør/handicap-verdier, TrackMan | Fasit for benchmarks — HQ skal koble seg til denne |

**Prinsipp:** Intelligence eier dataene. De andre flatene *henter* fra den (via API), ikke egne kopier.

---

## 2. Hva vi sitter på (DataGolf-datainventar)

Round-level fra DataGolf, 26 tours, tilbake til 1983 (~295k runder mål):
- **Strokes Gained per kategori:** Total/OTT/APP/ARG/PUTT/T2G
- **Tradisjonelt:** driving-lengde, treffsikkerhet, GIR%, scrambling%, nærhet fra fairway/rough
- **Approach-skill per avstand:** 50–75 … 200+ yards (gull for innspill-benchmark)
- **Skill-ratings over tid:** DG-rank, OWGR-rank, trend
- **Decompositions:** «ekte ferdighet» renset for varians
- **Event-finishes:** earnings, FedEx, DG-points
- **Live (kodet, ikke wiret):** in-play-sannsynlighet, live SG, hull-fordeling
- **Norske spillere:** proff-tours (country=NOR) + WAGR (amatør) + norske juniorturneringer

**Kjerne-innsikt:** Vi har hele *fordelingen* per kategori, per nivå, over tid → kan plassere hvem som
helst på en percentil-kurve for hver kategori, og sette benchmarks fra klubbspiller til verdens nr. 1.

---

## 3. Verdens beste treningsverktøy (analytiker)

Én **benchmark-motor**: hver kategori vi måler en spiller på → percentil + slag-gap mot valgt nivå.
1. Nivå-plassering (percentil). 2. SG-gap → drill-forskrift. 3. Avstandsbasert innspill-benchmark.
4. Progresjonskurve mot de som nådde neste nivå. 5. Tour-ekvivalent oversettelse. 6. Per-kategori
benchmark-mål (= neste nivås median). 7. Hva-hvis-modell.
**Nivå-adaptiv:** samme motor, ulik referanse-kohort. Amatør-bro: WAGR + norske data + tour-ekvivalent.
**Benchmark-kunnskapen finnes alt i `masterbrain`** (SG Authoritative KB) — bruk den, ikke finn opp på nytt.

---

## 4. Design (verdensledende, ikke kjedelig golf-statistikk)

Signaturkomponenter (lyst AK-brand, interaktivt):
1. **Benchmark-scrubber** (funnel-kroken): dra klubb → PGA, se fordeling + din percentil → «Prøv PlayerHQ».
2. Fordelings-radar (violin per kategori). 3. Approach-varmestige. 4. SG-elv. 5. «Denne uka»-auto-historier.
6. Delbart spillerkort. 7. Resultat-/turnerings-hub.
**Master-prompt for Claude Design er ferdig** (i Google Disk: `prompt/akgolf-stats-claude-design-prompt-2026-06-28.md`).

---

## 5. akgolf.no-funnel + live-resultat-hub

- **Funnel:** gratis «Denne uka i norsk golf» + auto-stats → SEO-trafikk → PlayerHQ-salg. Mye finnes alt
  (`/stats`, `/stats/uka`, `/stats/norske`) — vi **løfter** det til verdensklasse, bygger ikke fra bunnen.
- **Live-scoring kostnad (avklart):**
  - DataGolf live = **inkludert** i medlemskapet (~$270/år, fast — ingen kostnad per kall). 26 proff-tours.
  - GolfBox (norske/junior) = **gratis** offentlige leaderboards (vi har pipelines).
  - Sportradar (ekte hull-for-hull, hele verden) = **dyrt** (~$2 000+/mnd).
  - **Vei:** ukentlig resultat-hub (mandagslast) for alle tours + lenke til offisiell livescore. DataGolf
    «live SG»-visning som gratis bonus. Ekte hull-for-hull verden senere hvis inntekt forsvarer det.

---

## 6. Teknisk status (per 2026-06-28)

- ✅ **Delbar Intelligence-API (v1)** bygget + pushet: `/api/v1` (SG-benchmarks, WAGR, DataGolf, turneringer,
  kohort, college), API-nøkkel-auth. Kontrakt: `ak-golf-intelligence/docs/public-api.md`.
- ✅ **HQ-klient** bygget: `src/lib/intelligence/client.ts`. Nøkkel i HQ `.env.local`; `INTELLIGENCE_API_URL` mangler.
- ✅ **Delt Supabase-DB bekreftet:** HQ = `public`-schema (hadde dataen), Intelligence = `dashboard`-schema (var tom).
- ✅ **Pipeline-ytelse fikset** (`executemany` → `execute_batch`, ~100× raskere).
- ⏳ **DataGolf-backfill kjører:** ~116k+ runder + SG i `dashboard`. Benchmark-fasene (skill-ratings,
  decompositions, approach) fullføres via resume (krasjet på utløpt DB-tilkobling — løses ved resume).
- ⚠️ **GitHub Actions deaktivert** for kontoen (billing) → pipelinene kjøres lokalt i mellomtiden.

---

## 7. Design-sync til Claude Design (status + plan)

**Mål:** la Claude Design bygge med de *ekte* AK-komponentene (ikke bare beskrevet stil).
**To blokkere nå:**
1. **Tilgang:** `/design-login` krever interaktiv terminal — ikke tilgjengelig i nåværende miljø.
   Løsning: kjør fra vanlig Claude Code-terminal, eller «Send to Claude Code» i Claude Design.
2. **Struktur:** akgolf-hq er en Next.js-**app**, ikke et pakket komponentbibliotek (ingen Storybook/`dist/`).
   Design-sync krever ett av dem.

**Plan for å gjøre det skikkelig (egen oppgave):**
- Pakk ut `src/components/athletic/` som et byggbart bibliotek, ELLER sett opp en liten Storybook for dem.
- Kjør `/design-sync` fra interaktiv terminal med `/design-login`.
**Inntil da:** master-prompten (Del 4) gir Claude Design nøyaktig AK-stil — god nok for /stats-funnelen.

---

## 8. Åpne spørsmål for 10/10 (må besvares)

**Benchmark:** kanonisk kategori-liste (finnes i masterbrain — koble den) · referansenivåer per kategori ·
amatør-bro OK? · alders-/kjønnsjustert? · FYS-formel låst? · hvordan legger spilleren inn egne tall?
**Design:** hvilke 2–3 signaturvisualiseringer først · mobil/desktop-først · referanse-estetikk.
**Funnel:** gratis vs. bak mur · pris (150 vs 299 kr/mnd?) · CTA.
**Live-hub:** definere «norsk spiller» · hvilke turneringer i v1 · mandagslast: Actions/Vercel-cron/lokal.

---

## 9. Neste steg (rekkefølge)

1. La DataGolf-backfillen fullføre benchmark-fasene (resume kjører).
2. Kjør WAGR + norske junior-pipelines → full norsk dekning for «denne uka».
3. Sett `INTELLIGENCE_API_URL` (deploy Intelligence) + nøkkel i Vercel/HQ/1Password.
4. Ta master-prompten til Claude Design → port `/stats` mot ekte data via design-gaten.
5. Koble masterbrain-benchmarks inn i benchmark-motoren.
6. (Senere) full design-sync av komponentbiblioteket.

> Detaljerte under-docs i repoet `akgolf-hq/docs/`: `datagolf-produktvisjon.md`,
> `akgolf-stats-claude-design-prompt.md`, `ak-golf-intelligence-konsolidering.md`.
