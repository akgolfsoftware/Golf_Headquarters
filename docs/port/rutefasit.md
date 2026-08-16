# Rutefasit — alle ruter uten egen fasit-fil, for Claude Code

**Skrevet:** 2026-08-12 · **Kilde:** konsolideringsgatene W3/W4/W5/drift i `kart/` (talt mot kode på `main`)
**Legg denne i repoet som `docs/port/rutefasit.md`** og hold den i synk med `PAPER-ZIP-CHECKLIST.md`.

## Kontrakten og Claude-følelsen → flyttet til `CLAUDE.md`

**Flyttet 16.08.2026.** «Slik brukes den (kontrakten)» og «Claude-følelsen» sto her, men er
regler som gjelder ALT skjermarbeid — ikke bare rutene i tabellene under. De bor nå i
`CLAUDE.md` §Skjermarbeid, som lastes i hver økt, slik at de aldri trenger gjentas i en prompt.

Denne fila eier **tabellene**: rute → mal-fasit → avvik. Ikke dupliser reglene tilbake hit —
to kopier gir to sannheter, og den ene blir stille utdatert.

> Bevisst lokalt avvik fra zip-leveransen: `kart/rutefasit-for-claude-code.md` i designprosjektet
> inneholder fortsatt begge seksjonene. Ved neste resynk — behold denne pekeren, ikke gjenopprett
> seksjonene.

---

## W3 — PlayerHQ (skall: PlayerHQ · fasit-mappe `fase2/playerhq/`)

| Rute | Mal-fasit | Avvik (hele forskjellen) |
|---|---|---|
| /portal/meg/innstillinger | playerhq-innstillinger.html | hub — malen som den er |
| …/innstillinger/varsler | playerhq-innstillinger.html | kun varselgruppa |
| …/innstillinger/sprak | playerhq-innstillinger.html | radioliste nb/en |
| …/innstillinger/okter | playerhq-innstillinger.html | standardvarighet + påminnelsestid |
| …/innstillinger/anlegg | playerhq-innstillinger.html | liste med hjemmeanlegg først |
| …/innstillinger/ai-coach | playerhq-innstillinger.html | tone + forslagsmengde + av/på |
| …/innstillinger/personvern | playerhq-innstillinger.html | samtykker + eksport + sletting nederst, aldri aksent |
| …/innstillinger/sikkerhet | playerhq-innstillinger.html | passord + 2FA |
| …/innstillinger/integrasjoner | playerhq-innstillinger.html | tilkoblede tjenester med status per rad |
| /portal/meg/abonnement | playerhq-abonnement.html | malen som den er |
| …/abonnement/faktura/[id] | playerhq-abonnement.html | kvitteringsdetalj, nedlastbar PDF |
| …/abonnement/kort/ny | playerhq-abonnement.html | kortskjema (Stripe-element) |
| …/abonnement/avbestill | playerhq-abonnement.html | bekreftelse: hva du mister og når |
| …/abonnement/oppgrader/flyt | playerhq-abonnement.html | pakkevalg → betaling |
| /portal/meg/helse (+ symptom/ny) | playerhq-helse.html | symptom/ny er BottomSheet-ark; FYS-score «—» til formel vedtatt |
| /portal/booking/ny (+bekreft, bekreftet) | playerhq-booking-ny.html | query-drevet veiviser; uten pakke → redirect /coaching |
| /portal/booking/[bookingId] | playerhq-booking-mine.html | §12 kvitteringsdetalj |
| /portal/booking/coach/[coachId] · anlegg/[anleggId] | playerhq-booking-mine.html | §12 detaljkort |
| /portal/coach (+ melding/[id]) | playerhq-coach-hub.html | hub + tråd — malen som den er |
| /portal/coach/ai | playerhq-coach-hub.html | trådmalen med AI-avsender |
| /portal/coach/ovelser · videoer | playerhq-coach-hub.html | §10 liste |
| /portal/coach/plans | playerhq-coach-hub.html | periodeliste |
| /portal/coach/sg-hub | playerhq-coach-hub.html | §9 tabell |
| /portal/coach/sporsmal (+[id], ny) | playerhq-coach-hub.html | liste + tråd + skjema |
| /portal/talent/mitt-niva · roadmap | playerhq-talent.html | de to tilstandene i malen; FEATURES.TALENT av → notFound |
| /portal/talent (+ min-plan) | playerhq-talent.html | sammenstilling av samme data (åpent: hub → redirect?) |
| /portal/talent/sammenligning | playerhq-talent.html | kohorttabell på §9 |
| /portal/meg/help (+kategori, artikkel, kontakt) | gfgk-veileder-artikkel.html | GFGK-artikkelmalen med PlayerHQ-chrome |

**Utgår (tegnes/kodes ikke):** 10 `(legacy)/coach/*`-stubber · `meg/innstillinger/eksport`, `meg/sikkerhet`, `meg/abonnement/oppgrader` · 5 aliaser.

## W4 — AgencyOS (skall: AgencyOS · fasit-mappe `fase2/agencyos/`)

| Rute | Mal-fasit | Avvik |
|---|---|---|
| /admin/godkjenninger · handlingssenter · queue · approvals(+[id]) · foresporsler | agencyos-godkjenninger.html | ÉN flate — rutene bak pillene nås fra ⌘K |
| /admin/grupper | agencyos-gruppe-detalj.html | §9-liste av grupper |
| /admin/grupper/[id] (+arsplan, skoledata, timeplan, workbench) | agencyos-gruppe-detalj.html | faner på samme flate, samme loader |
| /admin/bookinger | agencyos-bookinger.html | malen som den er |
| …/bookinger/[id] | agencyos-bookinger.html | kvitteringsdetalj på §12 |
| …/bookinger/ny | agencyos-bookinger.html | tjeneste → tid → spiller (samme tre steg som PlayerHQ) |
| (legacy) availability · kapasitet · services · anlegg | agencyos-bookinger.html | «Tjenester og åpningstid»-kortet som egen flate |
| /admin/plans (+[planId]) | agencyos-planbibliotek.html | [planId] = inspektørpanelet i full bredde |
| /admin/plan-templates (+[id], rediger, ny) | agencyos-planbibliotek.html | skjema på malstrukturen; effectiveness = Effekt-blokka i full bredde |
| /admin/teknisk-plan · okter | agencyos-planbibliotek.html | okter = §9 tabell |
| /admin/tournaments (+[id], ny, dubletter) · turnering-kart | agencyos-turneringer.html | dubletter = §12-sammenslåing i malen |
| /admin/settings (+api, calendar, security, periode-*, tilgang) | agencyos-oppsett.html | avvik per fane står i malen og w4-notatet |
| /admin/klubb/innstillinger · integrasjoner · team(+inviter) | agencyos-oppsett.html | team/inviter = én rad i skjema |
| /admin/gdpr · audit-log · feillogg | agencyos-oppsett.html | «System og logg» — destruktivt nederst, aldri aksent |

**Utgår:** ~38 redirect-stubber (<600 B) · ~26 `(legacy)`-ruter med v2-erstatning.

## W5 — Marketing · Auth · Forelder · System (fasit-mapper `fase2/marketing|auth|forelder|system/`)

| Rute | Mal-fasit | Avvik |
|---|---|---|
| (marketing)/ + coaching, playerhq, junior, priser, om-oss, treningsfilosofi, faq, kontakt, jobb, suksess, vilkar, personvern, cookies | marketing-side.html | tre skallvarianter i malen: hero+bevis / pris / prosa — velg riktig per rute |
| coacher(+[slug]) · anlegg(+[slug]) · blogg(+[slug]) · cases · turneringer(+[slug]) | marketing-katalog.html | §10 liste + §12 detalj, samme mal uansett innholdstype |
| /auth/logg-inn · login · signup · check-email · forgot/reset-password · bankid · etter-innlogging · logget-ut · onboarding · checkout-resume · /onboard/* | auth-flyt.html | tilstander i malen; logg-inn/login = alias (åpent: redirect) |
| guardian-consent/[token] · lyd-samtykke/[token] · samtykke-venter · onboarding/forelder · inviter/forelder/[token] | auth-samtykke.html | samtykke aldri forhåndshuket, punkt for punkt |
| /forelder/barn(+[childId]) · ukerapport · okonomi · fakturaer · bookinger · varsler · innstillinger · samtykke · coach | forelder-barn.html | én mal med fanevisninger; personvernlinjen står i visningen |
| /offline · 404 · 500 · vedlikehold · 403 · FEATURES-gate | system-tilstander.html | globalt mønster i rot-layoutene, IKKE per rute (lukker P4); «vedlikehold» og «403» mangler ruter — åpent spm. 8 |

## Drift/AgenticOS (nye fasiter 12.08 · `fase2/agencyos/`)

| Rute | Mal-fasit | Avvik |
|---|---|---|
| /admin/agenticos (NY) | agencyos-agenticos-hub.html | malen som den er; redirects fra agents, agent-team, kommando/* |
| /admin/agents/[agentId] | agencyos-agent-detalj.html | én mal; manuelle agenter (plan-revisjon, peaking) får kjøringsskjemaet |
| /admin/brief (+ meg/dispatch, meg/morgenbrief) | eksisterende V2 | pixel-pass mot Paper-mønsteret; dispatch/morgenbrief → redirect (åpent) |
| /admin/recording | eksisterende V2 | pixel-pass; pipeline-stegene som i huben |
| /admin/workspace (+notion, prosjekter) | eksisterende V2 | pixel-pass; oppgavesystem-valget (KommandoTask vs Notion) er åpent |
| /admin/marketing · reports | agencyos-oppsett.html-mønsteret | inngang fra huben; egen fasit kun hvis én-linje-testen stryker |

## Utenfor denne fila

- **`(marketing)/stats/*` (~45):** blokkert av PR-F — egen designrunde (W7-stats), ikke mal-varianter.
- **Alle ruter med egen fasit:** styres av `PAPER-ZIP-CHECKLIST.md`, ikke denne.
- **Redirect-stubber og `(legacy)`:** kodes aldri mot denne fila.
