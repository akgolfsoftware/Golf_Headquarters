# Audit: PlayerHQ — Notater Detalj

**HTML:** `screen-deck/playerhq/notater-detalj.html`
**URL:** `/portal/coach/notes/:id`
**Tier:** Pro
**Antall klikkbare elementer:** 18

## Klikkbare elementer

| Element | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (5) | Skjerm | /portal/* | OK |
| Action-strip: "0 ganger lest" | Inline | Tooltip | OK |
| Action-strip: "3 relaterte notater" | Modal | RelatedNotesModal | NEI - ny modal |
| Action-strip: "Knytt til økt 09.05" | Modal | LinkSessionModal | NEI - ny modal |
| Action-strip: "2 actionable" | Modal | ActionableItemsModal | NEI - ny modal |
| "Del med foreldre" knapp | Modal | ShareWithParentModal | NEI - ny modal |
| "Marker som lest" primær | State-change | Inline | OK |
| Tabs (4: Notatet/Relaterte/Kommentarer/Vedlegg) | State-change | Inline tab-bytte | OK |
| Video-vedlegg "Spill av →" | Modal | VideoPlayerModal | NEI - ny modal |
| Drawer: kommentar-felt | Inline | Inline-edit | OK |
| Drawer: "Send svar" CTA | Skjerm | /portal/coach (med pre-fill) | OK |
| Drawer: "Bytt økt →" | Modal | LinkSessionModal | NEI - ny modal |
| Drawer-knapper (3): Marker som lest / Del / Lagre favoritt | State-change | Inline + ShareWithParentModal | Delvis |
| Relaterte notater (3 lenker) | Skjerm | /portal/coach/notes/:id | OK |

## States som må designes (utenom default)
- Lest vs ulest-state (banner endrer)
- Highlight på actionable-tekst (gul markering)
- Vedleggs-thumbnail-state (video, bilde, doc)
- Empty-state (notat uten vedlegg / uten relaterte)
- Loading skeleton
- Tab-content empty per tab
- VideoPlayerModal (helskjerm-modal med scrubber)
- LinkSessionModal (velg økt/runde)
- RelatedNotesModal (liste relaterte)
- ActionableItemsModal (sjekkliste)
- ShareWithParentModal (velg foresatt + melding)
