# Skjermplan — tegnede fasitskjermer + wireframe-plan for resten

**Skrevet:** 2026-08-05 · **Oppdatert:** 2026-08-10 (Del B fullført — W2–W6 er tegnet)
**Status:** Del A (fasit-portering) = **FERDIG i main**. Del B (W1–W6 tegning) = **FERDIG**.

> ✅ **Tegnesporet er avsluttet 09.08.2026.** Alle bølgene er tegnet: W1 (11 filer, godkjent
> 05.08), W2 (analyse-dybde), W3 (Meg/Booking/Talent/Coach), W4 (AgencyOS), W5
> (marketing/auth/forelder/system) og W6 (WANG + GFGK). Til sammen **79 fasit-HTML** i
> Claude Design `605a48cc` — 33 i `fase1/`, 46 i `fase2/`.
>
> W3–W5 ble tegnet som **maler**, ikke én tegning per skjerm: 18 maler dekker ~100 ruter.
> Konsolideringsnotatene ligger i designprosjektets `kart/w3-…`, `kart/w4-…`, `kart/w5-…` og
> `kart/w6-telling-wang-gfgk-2026-08-09.md`.
>
> Dette dokumentet er dermed **historikk over hvordan tegningen ble planlagt og gjennomført**.
> Gjeldende plan for kodingen er `PIXEL-PERFECT-PLAN-COMPLETE.md` (PP-0…PP-10).
> Seksjonene under (§W2 «I GANG», bølgetabellen med anslag) beskriver tilstanden 06.08 og er
> ikke gjeldende status.
**Kilde:** Claude Design `605a48cc` · speil `designsystem/paper/` · godkjent-liste `docs/port/portstatus-paper.md`
Tallgrunnlag: `fasit-liste-paper.md` + `portstatus-paper.md`. Mønster: `monsterdokument-paper.md`.

**Prinsippet Anders har bestilt:** de 318 skjermene uten fasit skal IKKE komponeres fritt fra
mønsterdokumentet og kodes direkte. De skal **wireframes/tegnes i Claude Design først**, slik at
enhver skjerm har en tegnet fasit før den kodes — samme skjermbilde-gate («app + fasit side om
side») for alle 343, ikke bare de 25.

---

## Del A — fasitskjermer (portet og godkjent 2026-08-06)

**Alle tegnede fasitskjermer med rute er i main.** Komplett tabell med PR-nummer:
`docs/port/portstatus-paper.md`.

| Pulje | Innhold | Status |
|---|---|---|
| 1 PlayerHQ kjerne | Hjem, Plan, Analyse, Meg, Booking | #307–#310, #328 |
| 2 Gjennomføre-sløyfa | Live FØR/UNDER/ETTER, runde, test-gjennomfør, tapper | #311–#317 |
| 3 Workbench | mobil + desktop + turnering-fane | #329, #342 |
| 4 AgencyOS | konsoll, innboks, kalender, stall, profil, økonomi, settings, agenticos, live, AK-stigen | #330–#337, #341, #343 |
| 5 Felles | innlogging, forelder, marketing booking, fangst, logget-ut | #338–#340, #344–#345 |
| W1 wireframes | 11 fase2-filer (økt, feiring, fys/teknisk, tester, turneringer, drills) | #318–#327 |

**Blokkert (ikke Del A):** PR-E (testantall 20/21/25) · PR-F (DataGolf-plassering i PlayerHQ).

**Historisk Del A-status under (A1–A4, «pulje pågår») er overstyrt** — beholdes ikke som gjeldende.

---

## Del B — wireframe-plan for de 318 uten fasit

### Prinsipp

**Ingen skjerm kodes uten tegnet fasit.** Wireframene tegnes i Claude Design-prosjektet
`605a48cc`, i en ny mappe **`fase2/`** (fase1/ forblir urørt som de 33 ferdige fasitene).
Samme rammeverk som fase1: `_foundation.css`-tokens, komponentbiblioteket (138 komponenter),
telefonramme 430px / desktop, `data-od-id`, mønsterdokumentets regler. Når en wireframe er
godkjent av Anders, ER den fasit — og skjermen kodes gjennom samme skjermbilde-gate som pulje 1–5.

### Metode per bølge — tre steg før tegning

1. **Konsolideringsgate.** Før et område tegnes, listes skjermene og Anders får forslag om
   hvilke som bør slås sammen eller utgå (Enkelhet-prinsippet: behold funksjonene, kutt
   flatene). Eksempel: PlayerHQ Analysere har 41 skjermer — mange er trolig faner/undervisninger
   som hører hjemme i den ene 5-fane-analyseflaten som allerede har fasit. Hver skjerm som
   konsolideres bort er én mindre å tegne OG én mindre å kode.
2. **Mal-tildeling.** Hver gjenværende skjerm får en mal fra mønsterdokumentet
   (§5 kort/tabeller · §8 skjema/flerstegsflyt · §9 tabell · §10 filter/paginering ·
   §11 dashbord · §12 detaljside). Skjermer som deler mal tegnes som ÉN mal-wireframe +
   én linje per skjerm om avvik fra malen. Kun skjermer med egen informasjonsarkitektur
   (ny interaksjon, unik flyt) får full individuell wireframe.
3. **Tegn og godkjenn i batch.** Design-økt (Fable, i Claude Design) tegner bølgens
   wireframes. Anders godkjenner per batch — ikke per skjerm. Godkjent batch = fasit.

Referansetempo: design-økta 04.08 tegnet 6 fullverdige fasitskjermer (4 tilstander, lys+mørk,
verifisert i Playwright) på én økt. Wireframes med 2 obligatoriske tilstander (Suksess + Tom;
Laster/Feil følger mønsterdokumentets standardmønster) og mal-gjenbruk bør gå raskere —
anslå 8–12 per økt for mal-baserte, 4–6 for unike.

### Bølgene (rekkefølge = kodingens rekkefølge, tegning ligger én bølge foran koding)

Tallene er fra `fasit-liste-paper.md` 05.08 og er **anslag før konsolideringsgaten** — målet
er at hver bølge krymper i steg 1.

| Bølge | Område | Uten fasit (anslag) | Merknad |
|---|---|---:|---|
| W1 | PlayerHQ Gjennomføre-rest + Planlegge-rest | 12 + 23 | `logger`/`tapper` + planleggings-undersider; tegnes FØR pulje 2 kodes ferdig |
| W2 | PlayerHQ Analysere + Hjem-rest | 40 + 1 → **krympes** | **I gang 06.08** — se §W2; hub ferdig; dybdeskjer i PR-kø |
| W3 | PlayerHQ Meg + Booking + Talent + Coach + Aliaser | 27 + 6 + 5 + 20 + 5 | «Aliaser» må verifiseres mot kode — trolig redirects, ikke skjermer |
| W4 | AgencyOS alle områder | ~111 | Stall 28 · Admin 18 · Planlegge 18 · Oversikt 16 · Gjennomføre 14 · Innsikt 14 · Min uke 4 · Meg 2 — tegnes FØR pulje 4 kodes |
| W5 | Marketing + Forelder + Auth + System | 40 + 11 + 10 + 7 | Marketing kan ha egen visuell avklaring — spør Anders før W5 tegnes |
| W6 | WANG (`team-wang`) + GFGK (`gfgk-junior`) | ikke telt | MÅ telles og legges inn i regnskapet først — de er ikke med i de 343 |

### Leveranse per bølge

- `fase2/<område>/`-filer i Claude Design (godkjente wireframes = fasit)
- Oppdatert rad i `fasit-liste-paper.md` (dekningsregnskapet vokser fra 25 → mot 343)
- Konsolideringsvedtak dokumentert (hvilke skjermer utgikk/slås sammen, med Anders' ja)

### Valgene — låst av Anders 2026-08-05

1. **Fidelitet: full Paper-komposisjon** (som fase1) — komponentbiblioteket brukes, wireframen
   ER fasiten når den er godkjent. Ingen gråboks-mellomrunde.
2. **Godkjenning per batch** — Anders godkjenner bølgens wireframes samlet, ikke per skjerm.
3. **Aktivt konsolideringsmandat** — design-øktene foreslår sammenslåinger/kutt per område;
   Anders sier ja/nei per område før tegning.

### W1 — TEGNET, GODKJENT OG PORTET (05–06.08.2026)

Alle 11 wireframes i `fase2/playerhq/` er batch-godkjent og **portet til main** (#318–#327).
Neste bølge: **W2 (Analysere + Hjem-rest)** — se §W2 under.

### W2 — I GANG (start 2026-08-06)

**Mål:** PlayerHQ Analysere-undersider + Hjem-rest uten egen fasit.

#### Konsolideringsgate (mot kode 2026-08-06)

| Kategori | Ruter (eksempler) | Forslag |
|---|---|---|
| **Hub (har fasit)** | `/portal/analysere` | Allerede portet (#309) — 5 faner i AnalysereV2 |
| **Ekte dybdeskjer** (v2, porte først) | `/portal/analysere/hull`, `/portal/mal/runder`, `/portal/mal/runder/[id]`, `/portal/gameplan`, `/portal/datagolf`, `/portal/mal/trackman`, `/portal/mal/trackman/[id]` | Én PR hver · Paper `T.handling` · midlertidig seed mot `playerhq-analyse.html` til egen wireframe finnes |
| **Talent-familie** | `/portal/talent` + 4 undersider | Utsettes til etter hub-dybde ELLER egen mini-batch · merker PR-E-relatert TalentHQ-i-meny |
| **Redirect / stub** | `/portal/analyse` → analysere, `/portal/stats` → ut, `/portal/gjennomfore` → hjem (W1-vedtak) | **Ikke tegnes** |
| **Hjem-rest** | Varsler, venner, utfordringer, fysisk, … | Kartlegges etter Analysere-dybde; mange er tynne v2-sider |

**Ikke tegn/kode i W2:** rene redirects, aliaser, legacy under `(legacy)/mal/*` som er erstatttet av v2.

**Arbeidsmåte W2 (inntil full wireframe-batch i Design):**
1. Port eksisterende v2-dybdeskjer til Paper (handling-monopolet + data-paper + seed).
2. Parallelt: konsolideringsliste → Claude Design fase2-wireframes for det som trenger ny IA.
3. Når Design-batch er godkjent: bytt midlertidig seed til ekte fase2-fasit.

**Første PR-kø (kode, startet 06.08):**
1. Hull-analyse · 2. Runder-liste · 3. Gameplan · 4. Runde-detalj · 5. DataGolf


### W1 — konsolideringsgate GJENNOMFØRT (Anders' ja 05.08.2026)

Fire vedtak + tre stubbe-funn krympet W1 fra 18 til **11 skjermer som tegnes**:

**Kuttet/konsolidert (Anders' ja per punkt):**
- `/portal/gjennomfore` (Gjør-oversikten) **utgår** — Hjem (dagens økt + sløyfe) og Plan (uka)
  dekker den. Ruten blir redirect til `/portal`.
- `/portal/gjennomfore/[id]` + `/portal/tren/[sessionId]/planlagt` **slås sammen til ÉN
  økt-detalj** — én fasit med planlagt/fullført-tilstand + inviter-kompis.
- Tester-familien **4 → 2**: liste + detalj tegnes; «Ny test»-flytene flytter inn i Workbenchs
  Testbatteri-ark (fasit finnes i `workbench-mobil.html`).
- `/portal/planlegge/bygger` (5-stegs veiviser) **utgår** — chat («Lag en økt» → utkast-kort)
  + Workbench dekker planbygging.

**Stubber/redirects funnet i kartleggingen (ikke skjermer):** `tren/ovelser` + `/[id]`
(redirects til `/portal/drills`), `live/[sessionId]/logger` (alias for `active`),
`live/[sessionId]/page.tsx` (dispatcher), `(fullscreen)/tren` og `tren/kalender` (stubber).

**De 11 som tegnes (`fase2/playerhq/` i Claude Design):**
1. Økt-detalj (samlet) · 2. Live-tapper · 3. Plan-feiring · 4. FYS-plan-hub (plassholdertall)
· 5. Teknisk plan · 6. Tester-hub · 7. Test-detalj · 8. Turneringsplanlegger · 9. Turnering-detalj
· 10. Øvelsesbank (drills) · 11. Drill-detalj

### W1 — opprinnelig skjermliste (verifisert mot kode 05.08.2026)

Stubber og rutere er filtrert bort (`live/[sessionId]/page.tsx` er en dispatcher,
`(fullscreen)/tren/page.tsx` og `tren/kalender/page.tsx` er redirect-stubber — ikke skjermer).
**18 reelle skjermer**, ned fra anslaget 35:

**Gjennomføre-rest (4):**
| Rute | Merknad |
|---|---|
| `/portal/gjennomfore` | Gjør-oversikten (GjorV2). **Konsolideringskandidat #1:** «Gjør»-fanen utgår (fire-faner-beslutningen) — består denne som skjerm nådd fra Hjem/Plan, eller dekkes den av Hjem + Plan? |
| `/portal/gjennomfore/[id]` | Økt-detalj (OktV2, TrainingSessionV2 Spor B) |
| `/portal/(fullscreen)/live/[sessionId]/logger` | Live-logging |
| `/portal/(fullscreen)/live/[sessionId]/tapper` | Live-tapper |

**Planlegge-rest (14):**
| Rute | Merknad |
|---|---|
| `/portal/planlegge/bygger` | 5-stegs plan-bygger-wizard (Mål→Mal→Generer→Juster→Lagre) |
| `/portal/tren/[sessionId]/planlagt` | Planlagt økt-visning |
| `/portal/tren/feiring/[planId]` | Plan-feiring |
| `/portal/tren/fys-plan` | FYS-plan (NB: FYS-formel avventer — plassholdertall) |
| `/portal/tren/ovelser` + `/[id]` | Øvelsesbank, liste + detalj (2 skjermer) |
| `/portal/tren/teknisk-plan/[planId]` | Teknisk plan |
| `/portal/tren/tester` + `/[testId]` + `/ny` + `/ny/egen` | Testflater, 4 skjermer. **Konsolideringskandidat #2:** tester planlegges i Workbench (beslutning 04.08) — hvor mye av denne familien består? Deler PR-E-avklaringen (20/21/25 protokoller) |
| `/portal/tren/turneringer` + `/[id]` | Turneringer, liste + detalj (2 skjermer) |

---

## Forholdet til eksisterende planer

- `docs/port/plan-designport-alle-skjermer.md` — steg-/PR-strukturen (steg 7–10) gjelder
  fortsatt for KODINGEN. Dette dokumentet legger tegne-sporet foran den: ingen skjerm i
  steg 7–9 kodes lenger uten fasit (tegnet i fase1/ eller godkjent wireframe i fase2/).
- `docs/port/monsterdokument-paper.md` — fortsatt regelboka, men rollen endres: fra
  «eneste designkilde for de 318» til **tegnereglene wireframene bygges etter**.
- `docs/port/fasit-liste-paper.md` — dekningsregnskapet; oppdateres per bølge.
