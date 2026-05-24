# CoachHQ — Innboks-tråd-detalj (side)

**Rute:** `/admin/innboks/[threadId]` (eller `/admin/messages/[id]`).

## Kontekst
Innboksen samler: spillermeldinger + foreldrekontakt + system-varsler + e-poster sluset gjennom AK Golf-domene. Anders åpner én tråd.

## Formål
- Full samtale-tråd med rik tekst
- Spillerkontekst-panel høyre (hcp, siste økt, plan)
- AI-utkast-forslag på svar

## Layout

**Header:**
- Tittel "Markus Røinås Pedersen — Spørsmål om jernspill" Inter Tight 600 22px
- Status-pille: "VENTER SVAR" lime
- "Tilbake til innboks"-link
- MoreHorizontal (arkiver, marker uløst, snooze)

**To-kolonne-layout:**

### Venstre — Samtale (hovedpanel)
Tidslinje av meldinger. Hver melding:
- Avatar + navn + tidsstempel mono
- Innhold (rik tekst, kan ha vedlegg, video, lenker)
- Reactions/emoji-leser nede

Vedlegg-card: filnavn + størrelse + last ned.

**Svar-felt bunn (sticky):**
- Tekstområde 4 linjer (auto-expand)
- AI-forslag-pill over: "Foreslå svar" → genererer 2-3 utkast som Anders kan klikke for å fylle inn
- Vedlegg-paperclip-ikon
- "Send" forest fill høyre + "Send som økt-forslag"-dropdown

### Høyre (320px) — Spillerkontekst
- Avatar + navn + hcp
- "Spillerkort" mini med 4 KPI
- "Siste økt" + dato
- "Aktiv plan" link
- "Sett-status" dropdown
- "Tildel oppfølging" → oppretter task

## Branding
Cream bg, hvite meldinger, AI-utkast lime border, forest send-CTA.
