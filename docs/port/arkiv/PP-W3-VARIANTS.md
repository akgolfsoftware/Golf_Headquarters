> UTGÅTT 18.08.2026 — styrer ingenting. Gjeldende: se docs/port/GYLDIGHET.md.

# W3 Meg/Booking/Talent/Coach — variant tracking (overnight)

Status: **PP-6 natt 11.–12.08** — coach-hub bygget om + booking-avbestilling koblet på.
Alle rader: m390/d1280 sign-off = Anders (utestående — skjermbilde-gaten er ikke tettet av
denne økten, kun kode + kort variant-sjekk tittel/tom/primær-handling).

| Mal / slug | Rute(r) | Kode slug | Kort variant-sjekk | Sign-off |
|---|---|---|---|---|
| playerhq-coach-hub | /portal/coach | `playerhq-coach-hub` (CoachHubV2) | Bygget om denne økten: coachtopp uten kortramme, Fokus-nå-kort separat, Meldinger som én rad (ikke full boble-forhåndsvisning), «Fra coach»-rad-seksjon (Videoer/Øvelser/Spørsmål) lagt til — manglet før. «Uten coach»-tilstand i `page.tsx` fikk andre info-kortet fra fasit («Du mister ingenting…»). | [ ] |
| playerhq-coach-hub (tråd) | /portal/coach/melding | `CoachMeldingerV2` (ingen enkelt data-paper-slug funnet) | IKKE ombygget denne økten — flertråds-modell (CoachingSession-liste) avviker fra fasitens enkelttråd-chat. Ikke et «konkret avvik»-fiks innenfor denne pass-en; flagges for egen vurdering (er flertråd riktig, eller skal fasitens enkeltchat vinne?). | [ ] |
| playerhq-innstillinger | /portal/meg/innstillinger (og undersider) | `playerhq-innstillinger` (InnstillingerV2) | Tittel «Innstillinger» ✓. Allerede portet i tidligere bølge — ingen konkrete avvik funnet i denne kjappe sjekken. | [ ] |
| playerhq-abonnement | /portal/meg/abonnement | `playerhq-abonnement` (MegAbonnementV2) | Tittel «Abonnement» ✓. Allerede portet — ingen konkrete avvik funnet i denne kjappe sjekken. | [ ] |
| playerhq-helse | /portal/meg/helse (KPI-grid) | `playerhq-helse` (MegHelseV2) | Tittel via `Tittel`-komponent ✓. Tomme KPI-er vises ærlig som «—» / «Ingen FYS-tester» (inline, ikke egen TomTilstand) — vurdert som greit nok, ikke fabrikkert data. | [ ] |
| playerhq-booking-ny | /portal/booking/ny | `playerhq-booking-ny` (BookingNyV2) | Slug + TomTilstand (3 forekomster) på plass fra før — ingen konkrete avvik funnet. | [ ] |
| playerhq-booking-mine | /portal/booking (liste) | `playerhq-booking` (BookingHubV2, IKKE `-mine`) | Listen er IKKE fasitens gruppert-per-dato-liste — det er en nyere «Én ting nå»-landingsside (credits-status + første ledige luke) bygget 2026-08-04 på Anders' eksplisitte instruks, som råder over den eldre W3-mock-strukturen. Tittel ✓, TomTilstand ✓ («Ingen kommende timer»), én primær clay-CTA ✓. Vurdert OK for den lette variant-sjekken — full re-design mot booking-mine.html-layouten er IKKE gjort (ville nedgradert en nyere, eksplisitt bestilt skjerm). |[ ] |
| playerhq-booking-mine (detalj) | /portal/booking/[bookingId] | `playerhq-booking-mine` (BookingDetaljV2) | **Konkret avvik lukket:** avbestilling manglet HELT (ingen CTA, ingen 24t-regel-tekst) selv om `cancelBooking`-server-actionen med 24t-refusjonspolicy (`AVBESTILLING_FRIST_TIMER`, `src/lib/booking/policy.ts`) allerede fantes og var koblet på `/portal/meg/bookinger`. Lagt til: `BookingAvbestillKnapp` (ny fil) — dobbeltbekreftelse (matcher fasitens mønster), riktig refusjons-/ingen-refusjon-tekst avhengig av 24t-grensen, kaller eksisterende `cancelBooking`. Vises kun når status er PENDING/CONFIRMED og økten ikke har startet. | [ ] |
| playerhq-talent | /portal/talent/* (5 skjermer) | `playerhq-talent` (TalentV2) | Slug + TomTilstand (3 forekomster) på plass fra før — ingen konkrete avvik funnet i denne kjappe sjekken. | [ ] |

Oppdateres fortløpende under overnight.

## Natt 13.08 — variant-utrulling etter rutefasit.md (PR #434)

Slug-sporing (`data-paper-slug`) + lint-rydding på variantflatene under — ingen
funksjons-/layoutendring (flatene var alt bygget i tidligere bølger; rutefasit-avvikene
deres var allerede dekket eller står på STOPP-lista). Skjermbilder: rutene er
attributt-endringer uten visuell diff — galleri ikke tatt per rute, jf. NATTRAPPORT-2026-08-13.

| Rute(r) | Mal | Avvik (fra rutefasit.md) | Status |
|---|---|---|---|
| meg/innstillinger/{varsler,sprak,okter,anlegg,sikkerhet,integrasjoner,personvern,ai-coach} | playerhq-innstillinger | per rutefasit-tabellen | tagget (#434) |
| meg/abonnement/{faktura/[id], kort/ny, avbestill, oppgrader/flyt} | playerhq-abonnement | kvittering/kortskjema/bekreftelse/pakkevalg | tagget (#434) |
| booking/anlegg/[anleggId] · booking/coach/[coachId] | playerhq-booking-mine | §12 detaljkort | tagget (#434) |
| coach/{ai, ovelser, videoer, sporsmal/ny, sporsmal/[id]} | playerhq-coach-hub | trådmal m/AI-avsender · §10 liste · skjema | tagget (#434) — hub/tråd urørt (pixel-signert) |
| talent/{mitt-niva, roadmap, sammenligning, min-plan} | playerhq-talent | malens to tilstander · kohorttabell | tagget (#434) |

**STOPP-lista natt 13.08 (én-linje-testen slo ut / mangler grunnlag):**
- `meg/innstillinger/okter` — siden viser enhetsadministrasjon; standardvarighet + påminnelsestid mangler felt i datamodellen (`UserPreferences`).
- `meg/helse` symptom/ny — skal være BottomSheet-ark, er i dag full side; strukturendring, ikke pixel-diff.
- `meg/help` (+kategori/artikkel/kontakt) — egen mal (gfgk-veileder-artikkel med PlayerHQ-chrome), ikke påbegynt.
- `CoachPlanerV2` (2 av 3 render-grener) og `CoachSgHubV2` (Fragment-rot) — delvis/ikke tagget.
- `/portal/talent` hub — åpent spørsmål i rutefasit («hub → redirect?») — ikke bygget før Anders svarer.
