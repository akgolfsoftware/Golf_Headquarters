# PlayerHQ — Knapper per skjerm

**Metode:** Pragmatisk gjennomgang. For tunge skjermer grupperes som "8-10 nøkkel-knapper" — ikke alle micro-interactions.
**Format per skjerm:** Status · HTML-fil · TSX-fil · Knapptabell · Gap-markering

---

## /portal — Hjem (Dashboard)

**Status:** ✓ TSX + delvis HTML-drevet
**TSX:** `src/app/portal/page.tsx`
**HTML:** Ingen 1:1 (designdrevet fra workbench-v2-style)

| Knapp | Hva skjer | Målskjerm | Status |
|---|---|---|---|
| "Ny økt" (hero CTA) | Navigerer | `/portal/ny-okt` | ✓ |
| "Se workbench" | Navigerer | `/portal/tren` | ✓ |
| "Utstyrsbag"-card | Navigerer | `/portal/meg/utstyrsbag` | ✓ |
| "Helse"-card | Navigerer | `/portal/meg/helse` | ✓ |
| "Sikkerhet"-card | Navigerer | `/portal/meg/sikkerhet` | ✓ |
| "Bookinger"-card | Navigerer | `/portal/meg/bookinger` | ✓ |
| "Runder"-card | Navigerer | `/portal/mal/runder` | ✓ |
| "Trackman"-card | Navigerer | `/portal/mal/trackman` | ✓ |
| "Baner"-card | Navigerer | `/portal/mal/baner` | ✓ |
| "Eksporter CSV" | Server action | `/portal/mal/runder?export=csv` | ✓ |
| "Oppgrader"-banner | Navigerer | `/portal/meg/abonnement` | ✓ |
| LockOverlay (Pro-låst card) | Navigerer | `/portal/meg/abonnement` | ✓ |

---

## /portal/ny-okt — Wizard

**Status:** ✓
**HTML:** batch3/ny-okt-wizard.html
**TSX:** `src/app/portal/ny-okt/page.tsx`

| Knapp | Hva skjer | Mål | Status |
|---|---|---|---|
| "Velg dato" | Steg 1 → 2 | (intern wizard-state) | ✓ |
| "Velg type" | Steg 2 → 3 | (intern) | ✓ |
| "Velg drill(s)" | Steg 3 → 4 | (intern) | ✓ |
| "Lagre økt" | Server action | `/portal/tren/[id]/planlagt` | ✓ |
| "Avbryt" | Cancel | `/portal/tren` | ✓ |
| "Be om hjelp fra coach" | Navigerer | `/portal/onskeligokt` | ✓ |

---

## /portal/tren — Workbench v2 (fullscreen)

**Status:** ✓ — flagship-skjerm
**HTML:** public/design/workbench-v2.html (også batch3/batch4)
**TSX:** `src/app/portal/(fullscreen)/tren/page.tsx` + `workbench-client.tsx`

**Nøkkel-knapper (10+ av ~40):**

| Knapp | Hva skjer | Mål | Status |
|---|---|---|---|
| "+ Ny økt" (slot) | Åpner modal | `NyEktModal` (workbench-modaler.tsx) | ✓ |
| Slot drag-drop | Flytter økt | (server action) | ✓ |
| Globalt søk (Cmd+K) | Åpner modal | `GlobalSearchModal` | ✓ |
| Varsel-bjelle | Åpner panel | `NotificationCenterModal` | ✓ |
| "Plan" / "Status" toggle | Mode-bytte | (intern) | ✓ |
| Uke-pil ← → | Naviger uker | (intern state) | ✓ |
| Dag-event klikk | Åpner detalj | `EditOktModal` | ✓ |
| AI-foreslå drill | Åpner AI-modal | `AIForslagModal` (ai-modaler.tsx) | ✓ |
| AI-foreslå turnering | Åpner AI-modal | `AITurneringModal` | ✓ |
| AI-mål-bygger | Åpner AI-modal | `AIMalBygger` | ✓ |
| Profil-avatar (sidebar) | Navigerer | `/portal/meg` | ✓ |

**HTML-referanse for AI-modaler:** batch3/ai-foresla-drill.html, ai-foresla-turnering.html, ai-mal-bygger.html

---

## /portal/tren/aarsplan — Årsplan

**Status:** ✓
**HTML:** batch3/arsplan-periode-rediger.html (kun rediger-modal)
**TSX:** `src/app/portal/tren/aarsplan/page.tsx`

| Knapp | Hva skjer | Mål | Status |
|---|---|---|---|
| Klikk periode | Åpner detalj | `/portal/tren/aarsplan/periode/[id]/rediger` | ✓ |
| "Ny periode" | Åpner modal | `EditPeriodeModal` | ✓ |
| "Slett periode" | Confirm + action | (server action) | ✓ |
| Drag-drop periode | Endre dato | (server action) | ✓ |

---

## /portal/tren/turneringer — Turneringsplanlegger

**Status:** ✓
**HTML:** batch4/tournament-sorlandsapent.html
**TSX:** `src/app/portal/tren/turneringer/page.tsx`

| Knapp | Hva skjer | Mål | Status |
|---|---|---|---|
| "Ny turnering" | Åpner modal/wizard | `TournamentEnrollModal` | ✓ |
| Klikk turnering | Detalj | `/portal/tren/turneringer/[id]` | ✓ |
| "AI-foreslå turnering" | Åpner AI-modal | (workbench AI) | ✓ |

---

## /portal/tren/tester — Tester

**Status:** ◔ TSX live, HTML mangler
**TSX:** `src/app/portal/tren/tester/page.tsx`

| Knapp | Hva skjer | Mål | Status |
|---|---|---|---|
| Klikk test | Detalj | `/portal/tren/tester/[testId]` | ✓ |
| "Ny test" | (mangler — gap) | `/portal/tren/tester/ny` | **✗ GAP** |
| "Eksporter resultater" | Server action | (export PDF/CSV) | ⊘ stub |

**HTML-gap:** `batch4/test-detalj-cmj.html` finnes for detalj, men ingen liste-HTML.

---

## /portal/tren/ovelser — Øvelses-bibliotek

**Status:** ◔ TSX live, HTML mangler
**TSX:** `src/app/portal/tren/ovelser/page.tsx`

| Knapp | Hva skjer | Mål | Status |
|---|---|---|---|
| Klikk øvelse | Detalj | `/portal/tren/ovelser/[id]` | ✓ |
| "Filter" | Sidepanel | (intern) | ✓ |
| "Søk" | Filter-input | (intern) | ✓ |
| "Foreslå AI" | Åpner AI-modal | (workbench AI) | ✓ |

---

## /portal/statistikk — Statistikk-hub

**Status:** ✓
**HTML:** batch3/statistikk-drill-down-side.html
**TSX:** `src/app/portal/statistikk/page.tsx`

| Knapp | Hva skjer | Mål | Status |
|---|---|---|---|
| Klikk metric-card | Drill-down | `/portal/statistikk/[metric]` | ✓ |
| "Sammenlign" | Navigerer | `/portal/statistikk/sammenlign` | ✓ |
| "Filter periode" | Dropdown | (intern) | ✓ |
| "Eksporter PDF" | Server action | (mangler) | **✗ GAP** |

---

## /portal/mal — Mål-hub

**Status:** ◔ TSX live, ingen dedikert HTML
**TSX:** `src/app/portal/mal/page.tsx`

| Knapp | Hva skjer | Mål | Status |
|---|---|---|---|
| "Nytt mål" | Navigerer | `/portal/mal/bygger` | ✓ |
| "AI mål-bygger" | Åpner modal/side | `/portal/mal/bygger` | ✓ |
| Klikk mål | Detalj | `/portal/mal/goal/[id]` | ✓ |
| "Runder" | Navigerer | `/portal/mal/runder` | ✓ |
| "Trackman" | Navigerer | `/portal/mal/trackman` | ✓ |
| "Baner" | Navigerer | `/portal/mal/baner` | ✓ |
| "SG-Hub" | Navigerer | `/portal/mal/sg-hub` | ✓ |
| "Leaderboard" | Navigerer | `/portal/mal/leaderboard` | ✓ |
| "Milepæler" | Navigerer | `/portal/mal/milepaeler` | ✓ |

---

## /portal/mal/runder — Runder-liste

**Status:** ◔ TSX live, ingen liste-HTML
**TSX:** `src/app/portal/mal/runder/page.tsx`

| Knapp | Hva skjer | Mål | Status |
|---|---|---|---|
| "Ny runde manuelt" | Navigerer | `/portal/mal/runder/ny` (HTML: legg-til-runde-manuelt.html) | ✓ |
| Klikk runde | Detalj | `/portal/mal/runder/[id]` | ✓ |
| "Eksporter" | Åpner modal | `EksporterRunderModal` (batch3/eksporter-runder-modal.html) | ✓ |
| "Importer fra GolfBox" | (mangler) | – | **✗ GAP** |

---

## /portal/mal/runder/[id]/shot-by-shot

**Status:** ✓
**HTML:** batch3/runde-detalj-shot-by-shot.html
**TSX:** `src/app/portal/mal/runder/[id]/shot-by-shot/page.tsx`

| Knapp | Hva skjer | Mål | Status |
|---|---|---|---|
| Klikk hull | Hull-detalj (intern) | (intern state) | ✓ |
| "Del runde" | Åpner modal | (HTML: playerhq-03-del-runde.html) | ◔ HTML klar, modal mangler |
| "Tag club" | Åpner modal | `ClubTaggingModal` | ✓ |
| "Tilbake" | Navigerer | `/portal/mal/runder/[id]` | ✓ |

---

## /portal/mal/sg-hub — SG-Hub

**Status:** ✓ (men overrepresentert)
**TSX:** 12 ruter under sg-hub/

| Knapp | Hva skjer | Mål | Status |
|---|---|---|---|
| "Pr. club" | Navigerer | `/portal/mal/sg-hub/[club]` | ✓ |
| "Conditions" | Navigerer | `/portal/mal/sg-hub/conditions` | ✓ |
| "Equipment" | Navigerer | `/portal/mal/sg-hub/equipment` | ✓ |
| "Strategy" | Navigerer | `/portal/mal/sg-hub/strategy` | ✓ |
| "Yardage" | Navigerer | `/portal/mal/sg-hub/yardage` | ✓ |
| "Best vs Now" | Navigerer | `/portal/mal/sg-hub/best-vs-now` | ✓ |
| "Yardage PDF" | Eksporter | `/portal/mal/sg-hub/yardage/pdf` | ✓ |

---

## /portal/coach — Coach-hub

**Status:** ✓
**TSX:** `src/app/portal/coach/page.tsx`

| Knapp | Hva skjer | Mål | Status |
|---|---|---|---|
| "Ny melding" | Navigerer | `/portal/coach/melding/ny` | ✓ |
| "AI Coach" | Navigerer | `/portal/coach/ai` | ✓ |
| Klikk coach | Profil | `/portal/coach/[coachId]` | ✓ |
| "Book økt" | Navigerer | `/portal/booking/ny` | ✓ |
| "Ønskelig økt" | Navigerer | `/portal/onskeligokt` | ✓ |
| "Notater" | Navigerer | `/portal/coach/notes` | ✓ |
| "Øvelses-bibliotek" | Navigerer | `/portal/coach/ovelser` | ✓ |
| "Treningsplaner" | Navigerer | `/portal/coach/plans` | ✓ |
| "Videoer" | Navigerer | `/portal/coach/videoer` | ✓ |

---

## /portal/coach/ai — AI Coach

**Status:** ✓
**HTML:** batch4/coachhq-06-ai-caddie-spiller.html
**TSX:** `src/app/portal/coach/ai/page.tsx`

| Knapp | Hva skjer | Mål | Status |
|---|---|---|---|
| "Send melding" | Server action | (chat-state) | ✓ |
| "Foreslå drill" | Trigger | (AI-respons) | ✓ |
| "Last opp video" | Åpner modal | `VideoUploadModal` | ✓ |
| "Gi feedback" | Åpner modal | `AgentFeedbackModal` | ✓ |

---

## /portal/coach/melding/[id]

**Status:** ✓
**HTML:** batch3/meldingstrad-detalj.html
**TSX:** `src/app/portal/coach/melding/[id]/page.tsx`

| Knapp | Hva skjer | Mål | Status |
|---|---|---|---|
| "Svar" | Send-input | (server action) | ✓ |
| "Vedlegg" | Navigerer | `/portal/coach/melding/[id]/vedlegg` | ✓ |
| "Last opp video" | Modal | `VideoUploadModal` | ✓ |
| "Lukk tråd" | Action | (server action) | ✓ |

---

## /portal/varsler

**Status:** ✓
**HTML:** batch4/playerhq-01-varselsenter.html
**TSX:** `src/app/portal/varsler/page.tsx`

| Knapp | Hva skjer | Mål | Status |
|---|---|---|---|
| Klikk varsel | Navigerer | varsel.link (variabel) | ✓ |
| "Marker alle lest" | Server action | – | ✓ |
| "Filter type" | Dropdown | (intern) | ✓ |
| "Innstillinger" | Navigerer | `/portal/meg/innstillinger` | ✓ |

---

## /portal/meg — Profil-hub

**Status:** ◔ TSX live, ingen HTML
**TSX:** `src/app/portal/meg/page.tsx`

| Knapp | Hva skjer | Mål | Status |
|---|---|---|---|
| "Rediger profil" | Åpner modal/side | `/portal/meg/profil/rediger` ELLER `ProfilRedigerModal` | ✓ |
| "Abonnement" | Navigerer | `/portal/meg/abonnement` | ✓ |
| "Bookinger" | Navigerer | `/portal/meg/bookinger` | ✓ |
| "Dokumenter" | Navigerer | `/portal/meg/dokumenter` | ✓ |
| "Helse" | Navigerer | `/portal/meg/helse` | ✓ |
| "Hjelp" | Navigerer | `/portal/meg/help` | ✓ |
| "Innstillinger" | Navigerer | `/portal/meg/innstillinger` | ✓ |
| "Sikkerhet" | Navigerer | `/portal/meg/sikkerhet` | ✓ |
| "Utstyrsbag" | Navigerer | `/portal/meg/utstyrsbag` | ✓ |
| "Foreldre" | Navigerer | `/portal/meg/foreldre` | ✓ |
| "Logg ut" | Auth action | `/login` | ✓ |

---

## /portal/meg/abonnement

**Status:** ✓
**HTML:** batch3/oppgrader-til-pro.html + avbestill-pro-bekreft.html
**TSX:** `src/app/portal/meg/abonnement/page.tsx`

| Knapp | Hva skjer | Mål | Status |
|---|---|---|---|
| "Oppgrader til Pro" | Navigerer | `/portal/meg/abonnement/oppgrader` | ✓ |
| "Se faktura" | Detalj | `/portal/meg/abonnement/faktura/[id]` | ✓ |
| "Avbestill" | Navigerer | `/portal/meg/abonnement/avbestill` | ✓ |
| "Endre betalingskort" | Modal/Stripe | (HTML: batch4/legg-til-betalingskort.html) | ◔ HTML klar, modal mangler |
| "Last ned kvittering" | PDF-export | (server action) | ✓ |

---

## /portal/meg/innstillinger

**Status:** ✓
**HTML:** batch3/innstillinger.html
**TSX:** `src/app/portal/meg/innstillinger/page.tsx`

| Knapp | Hva skjer | Mål | Status |
|---|---|---|---|
| "Integrasjoner" | Navigerer | `/portal/meg/innstillinger/integrasjoner` | ✓ |
| "Språk" | Dropdown | (intern) | ✓ |
| "Varsler" | Toggle-gruppe | (server action) | ✓ |
| "Tema" | Toggle | (intern) | ✓ |
| "Slett konto" | Confirm-modal | (server action) | ⊘ stub |

---

## /portal/meg/help — Hjelpesenter

**Status:** ✓
**HTML:** batch3/hjelp-artikkel-side.html + kontakt-support.html
**TSX:** `src/app/portal/meg/help/page.tsx`

| Knapp | Hva skjer | Mål | Status |
|---|---|---|---|
| "Søk artikkel" | Filter-input | (intern) | ✓ |
| Klikk artikkel | Detalj | `/portal/meg/help/artikkel/[slug]` | ✓ |
| "Kontakt support" | Navigerer | `/portal/meg/help/kontakt` | ✓ |
| "App-feedback" | Navigerer | `/portal/meg/feedback` | ✓ |

---

## /portal/meg/helse — Helse

**Status:** ✓
**TSX:** `src/app/portal/meg/helse/page.tsx`

| Knapp | Hva skjer | Mål | Status |
|---|---|---|---|
| "Nytt symptom" | Navigerer | `/portal/meg/helse/symptom/ny` | ✓ |
| Klikk symptom | (intern detail) | – | ✓ |
| "Eksporter helse-rapport" | (mangler) | – | **✗ GAP** |

---

## /portal/booking/ny — Book direkte

**Status:** ✓
**HTML:** batch4/book-direkte-med-coach.html
**TSX:** `src/app/portal/booking/ny/page.tsx`

| Knapp | Hva skjer | Mål | Status |
|---|---|---|---|
| "Velg coach" | Steg 1 | (intern) | ✓ |
| "Velg tid" | Steg 2 | (intern) | ✓ |
| "Velg tjeneste" | Steg 3 | (intern) | ✓ |
| "Bekreft" | Server action | `/portal/booking/ny/bekreft` | ✓ |
| "Avbryt" | Cancel | `/portal/coach` | ✓ |

---

## /portal/onskeligokt — Ønskelig økt

**Status:** ✓
**TSX:** `src/app/portal/onskeligokt/page.tsx`

| Knapp | Hva skjer | Mål | Status |
|---|---|---|---|
| "Beskriv ønske" | Input | (intern) | ✓ |
| "Send forespørsel" | Server action | `/portal/onskeligokt/bekreftet` | ✓ |

---

## /portal/(fullscreen)/live/[sessionId]

**Status:** ✓
**HTML:** batch3/live-session-logger.html, batch4/live-okt-brief.html, live-okt-summary.html

| Skjerm | Rute | TSX | HTML |
|---|---|---|---|
| Intro | `/portal/(fullscreen)/live/[sessionId]` | ✓ | ✗ |
| Brief | `.../brief` | ✓ | ✓ live-okt-brief.html |
| Active | `.../active` | ✓ | ✓ live-session-logger.html |
| Tapper | `.../tapper` | ✓ | ✗ |
| Summary | (gap — ingen rute) | **✗ GAP** | ✓ live-okt-summary.html |

**Knapper i live-flyt:**
| Knapp | Hva skjer | Mål | Status |
|---|---|---|---|
| "Start økt" | Action | `/active` | ✓ |
| "Logg slag" | Append (intern) | – | ✓ |
| "Bytt klubb" | Modal | `ClubTaggingModal` | ✓ |
| "Pause" | State-toggle | – | ✓ |
| "Avslutt" | Confirm + redirect | (Summary — gap) | ⊘ |

---

## Skjermer med HTML men ingen tilsvarende TSX-route

| HTML-fil | Forventet rute | Status |
|---|---|---|
| `onboarding-flyt.html` | `/onboarding` eller `/portal/onboarding` | **✗ GAP** |
| `playerhq-02-global-sok.html` | (modal — finnes i `GlobalSearchModal`) | ◔ |
| `playerhq-03-del-runde.html` | Modal `DelRundeModal` | **✗ GAP** |
| `legg-til-betalingskort.html` | Modal `LeggTilBetalingskortModal` | **✗ GAP** |
| `live-okt-summary.html` | `/portal/(fullscreen)/live/[id]/summary` | **✗ GAP** |
| `test-detalj-cmj.html` | (TSX finnes `/tren/tester/[id]`, men design ikke koblet) | ◔ |
