# Audit: PlayerHQ — Coach Detalj

**HTML:** `screen-deck/playerhq/coach-detalj.html`
**URL:** `/portal/coach`
**Tier:** Pro
**Antall klikkbare elementer:** 17

## Klikkbare elementer

| Element | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (5) | Skjerm | /portal/* | OK |
| Action-strip: "28 økter sammen" | Modal | SessionHistoryModal | NEI - ny modal |
| Action-strip: "2 uleste meldinger" | Skjerm | /portal/coach (meldinger-tab) | OK |
| Action-strip: "14:00 neste økt i dag" | Skjerm | /portal/sessions/:id | OK |
| Action-strip: "4,9 snitt-fokus / 5" | Modal | FocusRatingDetailModal | NEI - ny modal |
| "Send melding" knapp | Skjerm/Modal | /portal/coach/message | WIREFRAME_NEEDED |
| "Be om økt" primær | Skjerm | /portal/coach/request (onskeligokt.html) | OK |
| Tabs (5: Om/Mine økter/Meldinger/Notater/Plan) | State-change/Skjerm | Bytter view | OK |
| Spesialiteter-pills | Inline | Filter | OK |
| Sertifisering-tabell rader | Modal | CertificationDetailModal | NEI - ny modal |
| Drawer: "Les notatet →" | Skjerm | /portal/coach/notes/:id | OK |
| Drawer: andre coacher (2 stk) | Skjerm | /portal/coach?coach=marius | OK |
| Drawer: "Send melding til Anders" | Skjerm | /portal/coach/message | WIREFRAME_NEEDED |
| Drawer: "Bytt coach for én økt" | Modal | SwapCoachModal | NEI - ny modal |

## States som må designes (utenom default)
- Coach offline/online-status (grønn dot)
- Tab-content empty per tab
- Loading skeleton
- Multiple coaches-state (Markus har 3 coaches)
- SessionHistoryModal — alle økter med Anders
- FocusRatingDetailModal — vurderings-historie
- CertificationDetailModal — diplom + utstedt-dato
- SwapCoachModal — velg coach for kommende økt
