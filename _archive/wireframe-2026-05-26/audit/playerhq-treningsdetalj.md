# Audit: PlayerHQ — Treningsdetalj (post-økt)

**HTML:** `screen-deck/playerhq/treningsdetalj.html`
**URL:** `/portal/sessions/:id`
**Tier:** Pro
**Antall klikkbare elementer:** 17

## Klikkbare elementer

| Element | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (5) | Skjerm | /portal/* | OK |
| Action-strip: Anders K. avatar | Skjerm | /portal/coach | OK |
| Action-strip: "2t siden" | Inline | Tooltip | OK |
| Action-strip: "4/4 øvelser" | State-change | Tab → Øvelser | OK |
| Action-strip: "1 åpen action" | Modal | ActionableItemsModal | NEI - ny modal |
| "Del med peer" knapp (toppen + drawer) | Modal | ShareWithPeerModal | NEI - ny modal |
| "Logg refleksjon" primær | Modal | ReflectionLogModal | NEI - ny modal |
| Tabs (4: Sammendrag/Øvelser/Resultater/Notater) | State-change | Inline tab | OK |
| "Les hele notatet →" | Skjerm | /portal/coach/notes/:id | OK |
| "Se økt-detaljer →" anbefalt øvelse | Skjerm | /portal/sessions/:id | OK |
| Carry-tabell rader (4) | Modal | StationDetailModal | NEI - ny modal |
| Agent-insight panel | Modal | AgentInsightDetailModal | NEI - ny modal |
| "Eksporter til PDF →" | Skjerm | PDF-download | OK |

## States som må designes (utenom default)
- Empty-state (rå økt uten notater)
- Loading skeleton
- "Hva gikk bra" / "Hva må forbedres" lister
- Tab-content empty per tab
- Progress-bar comparison ("Sammenliknet med snitt")
- ReflectionLogModal (1-10 + tekst-felt)
- ShareWithPeerModal (velg peer + melding)
- StationDetailModal (per-stasjon brekkdown)
- AgentInsightDetailModal (full agent-rapport)
