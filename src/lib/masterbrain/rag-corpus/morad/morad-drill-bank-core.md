---
chunk_id: morad-009
tags: ["morad", "drill", "bank"]
topics: ["drill", "prescription"]
relevance: agent-rag
word_count: 140
---

# MORAD Drill Bank — under oppbygging

**Drill-banken er tom.** Den ble tatt ut i sin helhet 31. juli 2026 og skal
bygges på nytt. Beslutning: Anders Kristiansen.

## Regel for agenten

Du har ingen drill-bank å foreskrive fra. Du skal:

1. Beskrive hva som bør trenes — pyramideområde, P-posisjon, hvilken feil som er hypotesen
2. Si eksplisitt at drill-banken er under oppbygging
3. **Aldri finne på en drill selv**, og aldri gjenbruke drill-navn fra eldre tekst

## Hvorfor den ble tatt ut

Banken hadde 9 drills, alle fullsving — ingen putting, nærspill, bunker, wedge
eller FYS. Fem drill-navn ble pekt på uten at de fantes. CS-spenn og
pyramideområde motsa hverandre mellom `drills.json` og denne teksten for 7 av
9 drills. Agenten kunne lese to ulike tall for samme drill i samme svar.

Fasit: `knowledge/entities/drills.json` (tom, med skjema for ny drill).
Arkivert kopi av den gamle banken:
`archive/from-akgolf-hq-2026-07-27/drill-bank/`.
