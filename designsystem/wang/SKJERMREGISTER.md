# SKJERMREGISTER — alle 35 skjermer i `/team-wang`

Én rad per skjerm. Sortert etter status: **bygget** → **kan bygges nå** → **venter på datamodell**
→ **venter på beslutning**. Innenfor hver gruppe i skjerm-ID-rekkefølge.

Roller: `Åpen` = uten innlogging · `Elev` · `Foresatt` · `Trener` (rolle på gruppen) ·
`Sportssjef` · `Admin`. Se `TILGANGSMATRISE.md` for hva hver rolle faktisk ser på skjermen.
Alle skjermer er tegnet i **mobil 390 og desktop 1280**.

---

## Bygget — finnes i kode i dag

| ID | Navn | Designfil | Foreslått rute | Roller | Tilstander tegnet | Bredder | Status |
|---|---|---|---|---|---|---|---|
| A1 | Skall | `skjermer/a1-skall.html` | `/team-wang` | Åpen, Elev, Foresatt, Trener | Suksess, laster, tom, feil | 390 · 1280 | Bygget |
| A2 | Fellesside · hjem | `skjermer/a2-hjem.html` | `/team-wang` | Åpen, Elev, Foresatt, Trener | Suksess, laster, tom, feil | 390 · 1280 | Bygget |
| A3 | Årsplan | `skjermer/a3-arsplan.html` | `/team-wang?fane=trening` | Åpen, Elev, Foresatt, Trener | Suksess, laster, tom, feil | 390 · 1280 | Bygget |
| A4 | Periode | `skjermer/a4-periode.html` | `/team-wang?fane=trening` | Åpen, Elev, Foresatt, Trener | Suksess, laster, tom, feil | 390 · 1280 | Bygget |
| A6 | Uke | `skjermer/a6-uke.html` | `/team-wang?fane=kalender` | Åpen, Elev, Foresatt, Trener | Suksess, laster, tom, feil | 390 · 1280 | Bygget · «i dag» er hardkodet |

## Kan bygges nå — modellen finnes

| ID | Navn | Designfil | Foreslått rute | Roller | Tilstander tegnet | Bredder | Status |
|---|---|---|---|---|---|---|---|
| B3 | Resultater per elev | `skjermer-batch1/b3-resultater-elev.html` | `/team-wang/elev/[id]/tester` | Elev (egne), Foresatt, Trener | Suksess, tom (ingen tester) | 390 · 1280 | Kan bygges nå · kildelinje krever felter fra C5 |
| B6 | Statistikk-skinn | `skjermer-batch1/b6-statistikk-skinn.html` | `/team-wang/statistikk` | Elev, Trener | Med skinn, uten skinn | 390 · 1280 | Kan bygges nå · ren token-oppgave |
| B7 | Turneringer | `skjermer-batch1/b7-turneringer.html` | `/team-wang/turneringer` | Åpen (navnefri), Elev, Foresatt, Trener | Kommende, gjennomført, mangler i kilde | 390 · 1280 | Kan bygges nå · `wang-turneringer.ts` |
| C1 | Elevliste | `skjermer-batch2/c1-elevliste.html` | `/team-wang/elever` | Trener, Sportssjef | Liste, flervalg, tom gruppe | 390 · 1280 | Kan bygges nå · `GroupMember` |
| C3 | Økt-detalj | `skjermer-batch2/c3-okt-detalj.html` | `/team-wang?fane=kalender&okt=[id]` | Elev, Foresatt, Trener | Overlegg, full høyde, uten publisert plan | 390 · 1280 | Kan bygges nå · `okt-detalj.tsx` er urutet |
| C4 | Turnering-detalj | `skjermer-batch2/c4-turnering-detalj.html` | `/team-wang/turnering/[id]` | Åpen (navnefri), Elev, Foresatt, Trener | Gjennomført, kommende, resultat mangler | 390 · 1280 | Kan bygges nå · `wang-turneringer.ts` |
| C7 | Logg inn og tilgang | `skjermer-batch2/c7-logg-inn.html` | `/team-wang/logg-inn` | Åpen | Skjema, feil passord, hvem ser hva | 390 · 1280 | Kan bygges nå · `wang-login.tsx` |
| C8 | Systemtilstander | `skjermer-batch2/c8-systemtilstander.html` | alle ruter under `/team-wang` | Alle | Laster, feil, uten nett, 403 | 390 · 1280 | Kan bygges nå · se `PORTING.md` §4 |
| D11 | Trenere og roller | `skjermer-batch3/d11-trenere.html` | `/team-wang/tilgang/trenere` | Sportssjef, Admin | Liste, rolle per skole, uten tilgang | 390 · 1280 | Kan bygges nå · `GroupMember.role` |

## Venter på datamodell

| ID | Navn | Designfil | Foreslått rute | Roller | Tilstander tegnet | Bredder | Status |
|---|---|---|---|---|---|---|---|
| B1 | Testdag-føring | `skjermer-batch1/b1-testdag-foring.html` | `/team-wang/testdag/[id]` | Trener | Velg protokoll, føring, uten nett | 390 · 1280 | Venter · `Protokoll`, `Testdag` |
| B2 | Protokoller | `skjermer-batch1/b2-protokoller.html` | `/team-wang/protokoll` | Trener, Sportssjef | Liste, låst detalj, versjoner | 390 · 1280 | Venter · `Protokoll` + `ProtokollVersjon` |
| B4 | Ukessammendrag | `skjermer-batch1/b4-ukessammendrag.html` | `/team-wang/coach/ukessammendrag` | Trener (skriver), Foresatt (leser) | Kladd, publisert, tidligere uker | 390 · 1280 | Venter · `Ukesrapport` |
| B5 | Dokumenter | `skjermer-batch1/b5-dokumenter.html` | `/team-wang/dokumenter` | Elev, Foresatt, Trener | Liste, tom, last opp | 390 · 1280 | Venter · `Dokument` + `Foresatt` |
| B8 | Elev-ark | `skjermer-batch1/b8-elev-ark.html` | `/team-wang/elev/[id]` | Trener, Sportssjef | Trenerens visning, ikke innlogget | 390 · 1280 | Venter · `Oppmote` (resten finnes) |
| B9 | Samlinger | `skjermer-batch1/b9-samlinger.html` | `/team-wang/samlinger` | Elev, Foresatt, Trener | Oversikt, detalj med uttak | 390 · 1280 | Venter · `Samling` + `Uttak` |
| C2 | Samling med uttak | `skjermer-batch2/c2-samling-uttak.html` | `/team-wang/samling/[id]` | Elev (egen status), Trener | Publisert, kladd, elevens visning | 390 · 1280 | Venter · `Samling` + `Uttak` |
| C5 | IUP med kildelinje | `skjermer-batch2/c5-iup-kildelinje.html` | `/team-wang/coach/iup/[elevId]` | Elev, Foresatt, Trener | Med kilde, dagens visning, tom periode | 390 · 1280 | Venter · kildefelter på `TestResult` |
| C9 | Skole-fanen | `skjermer-batch2/c9-skole-390.html` | `/team-wang?fane=skole` | Elev, Foresatt | Timeplan, prøver, kompetansemål | 390 · 1280 | Venter · `Timeplan`, `Fag`, utvidet `SchoolScheduleEntry` |
| D2 | Plasser | `skjermer-batch3/d2-plasser.html` | `/team-wang/plasser` | Sportssjef, Admin | Per skole, sentralt, venteliste | 390 · 1280 | Venter · `Skole` + `Plass` |
| D3 | Koordinering mellom skoler | `skjermer-batch3/d3-koordinering.html` | `/team-wang/rekruttering/koordinering` | Sportssjef | Overlapp, status per skole, tråd, varsler | 390 · 1280 | Venter · `Kandidat`, `SkoleInteresse`, `KoordineringsTråd` |
| D4 | Timeplan-føring | `skjermer-batch3/d4-timeplan.html` | `/team-wang/skole/timeplan` | Admin, Kontaktlærer | Ukemal, ny time, unntak | 390 · 1280 | Venter · `Timeplan`, `Klasse`, `Fag` |
| D5 | Prøveplan | `skjermer-batch3/d5-proveplan.html` | `/team-wang/skole/proveplan` | Trener, Kontaktlærer, Elev | Uke, termin, belastning | 390 · 1280 | Venter · utvidet `SchoolScheduleEntry` |
| D6 | Foreldremøte | `skjermer-batch3/d6-foreldremote.html` | `/team-wang/foreldremote` | Foresatt, Kontaktlærer, Sportssjef | Invitasjon, påmelding, referat | 390 · 1280 | Venter · `Foreldremote` + `Foresatt` |
| D7 | Gruppeposter | `skjermer-batch3/d7-gruppeposter.html` | `/team-wang/gruppe/poster` | Elev, Foresatt, Trener | Tavle, ny post, lesekvittering | 390 · 1280 | Venter · `GruppePost` + `Vedlegg` |
| D8 | Post til én elev | `skjermer-batch3/d8-post-elev.html` | `/team-wang/post` | Elev, Foresatt, Trener | Elev, innboks, foresatt, sperret | 390 · 1280 | Venter · `PostTråd` + `Foresatt` |
| D9 | Periodeplan | `skjermer-batch3/d9-periodeplan.html` | `/team-wang/plan/periode` | Trener | Periode, ny periode, året | 390 · 1280 | Venter · `Periode` |
| D10 | Månedsplan | `skjermer-batch3/d10-manedsplan.html` | `/team-wang/plan/maned` | Trener | Ukene, avvik, tom måned | 390 · 1280 | Venter · `Manedsplan` (krever `Periode`) |
| D12 | Inviter elev | `skjermer-batch3/d12-inviter-elev.html` | `/team-wang/tilgang/inviter` | Trener med gruppeansvar, Sportssjef | Send, sendte, etter konto | 390 · 1280 | Venter · `Invitasjon` + `GruppeRolle` |

## Venter på beslutning

| ID | Navn | Designfil | Foreslått rute | Roller | Tilstander tegnet | Bredder | Status |
|---|---|---|---|---|---|---|---|
| C6 | Trenerflate | `skjermer-batch2/c6-trenerflate.html` | `/team-wang/coach` | Trener | A lesevisning, B redirect, uten rolle | 390 · 1280 | Venter · **B4**: består flaten eller blir den lesevisning |
| D1 | Rekruttering | `skjermer-batch3/d1-rekruttering.html` | `/team-wang/rekruttering` | Sportssjef (egen skole) | Liste, vurdering, punktsett-editor | 390 · 1280 | Venter · **vurderingspunktene** + `Kandidat`-modellen |

---

## Oppsummert

| Status | Antall |
|---|---|
| Bygget | 5 |
| Kan bygges nå | 9 |
| Venter på datamodell | 19 |
| Venter på beslutning | 2 |
| **Sum** | **35** |

De ni «kan bygges nå» er den første porteringsbølgen. `B3` og `C5` henger sammen: bygg
kildelinje-komponenten én gang (`PORTING.md` §3), så treffer den fem skjermer.
