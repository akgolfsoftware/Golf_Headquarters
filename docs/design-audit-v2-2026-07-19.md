# Design-audit — PlayerHQ + AgencyOS mot v2-kanon (19. juli 2026)

Presis per-skjerm-gjennomgang (hver flagget fil åpnet, imports sporet, live/død verifisert med
fixed-string referansesøk). «Riktig design» = ligger på v2-kanon (`@/components/v2` / `V2Shell` /
`*V2`-komponent / `@/lib/v2/tokens`). Ikke-kanon: golfdata (gammelt overgangs-lag), bespoke lokal
familie (AgPage), eller «shared-ui» (PlayerHero/DetailShell/shared+ui uten V2Shell-ramme).

## Sammendrag

- **Hovedtyngden av begge appene er allerede v2.** Av 314 sider er ~183 tydelig v2; Claude Design
  har 0 gjenstående design-*mockups* (16. juli).
- **Reelle LIVE design-gap: ~28 skjermer** (22 PlayerHQ + 6 AgencyOS) — skjermer brukere når som
  IKKE er på full v2-kanon.
- Bare **2 skjermer er ekte gammelt golfdata**; resten er en «transitional» shared-ui-hale +
  noen få bespoke.
- **~29 døde `(legacy)`-ruter** uten lenker inn = opprydding (sletting), ikke design-gap.

---

## PlayerHQ — reelle gap (22 live skjermer, ikke v2)

**Verst / port først (synlige analyse-flater, ekte gammelt eller bespoke):**
1. `/portal/statistikk` — GAMMELT golfdata (`StatistikkHub`)
2. `/portal/tren/aarsplan` — GAMMELT golfdata (`Aarsplan`)
3. `/portal/mal/sg-hub` — BESPOKE (`SgHub`, golfdata-basert hub). NB: 6 drill-down-undersider
   (`/[club]`, `/benchmark`, `/best-vs-now`, `/conditions`, `/strategy`, `/yardage`) nås KUN fra
   denne hubben — de må portes SAMMEN med den (ikke slett dem løst).

**Transitional shared-ui (PlayerHero-ramme, ikke V2Shell — brandet + funksjonell, men ikke kanon):**
- Coach-kontakt: `/portal/coach/[coachId]` · `/coach/melding/[id]` · `/coach/ovelser/ny` ·
  `/coach/plans/[planId]`
- Tren: `/portal/tren/[sessionId]` · `/tren/fys-plan/[planId]` · `/tren/tester/katalog` ·
  `/portal/ny-okt` · `/portal/utfordringer/ny` · `/portal/mal/runder/[id]/fullfor`
- Venner: `/portal/venner` · `/portal/venner/[spillerId]`
- Meg/konto: `/portal/meg/bookinger` · `/meg/bookinger/reschedule/[bookingId]` ·
  `/meg/sikkerhet/2fa` · `/meg/innstillinger/personvern` · `/meg/help/kontakt` ·
  `/meg/abonnement/oppgrader/flyt` · `/meg/abonnement/kort/ny`
  (de fire siste bruker alt v2-`Knapp`, men mangler V2Shell-ramme).

## AgencyOS — reelle gap (6 live skjermer, ikke v2)

1. `/admin/tester/tildel` — AGPAGE (bespoke `AgPage`+`AgPageHead`)
2. `/admin/talent/sammenligning` — AGPAGE
3. `/admin/agenter` — bespoke `AgentChat`
4. `/admin/drills/ny` — rå markup + lokal `DrillCreateForm`
5. `/admin/teknisk-plan/[spillerId]` — shared-ui (`DetailShell`/`KPICard`)
6. `/admin/talent/wagr-benchmark` — `AdminHero`/shared

## Døde holdovers — opprydding (0 lenker inn, kan slettes)

**AgencyOS:** `/admin/ai` · `/admin/drills/forslag` · `/admin/risiko` (AgPage) ·
`/admin/plan-templates/[id]/effectiveness` · `/admin/talent/kohort` · `/talent/region` ·
`/talent/ressurser` (AdminHero) · døde redirects `/admin/board` · `/kommunikasjon` · `/mer` ·
`/prosjekter` · `/stall` · `/tilstander`. (Ferdig-v2 men uten nav-lenke: `/admin/reach` ·
`/recording` · `/stats/overview` · `/talent/wagr-import` — mangler trolig bare nav-oppføring.)

**PlayerHQ:** `/portal/agent-pipeline` · `/coach/notes`(+`/[noteId]`) · `/coach/melding/[id]/vedlegg` ·
`/coach/ovelser/[id]/rediger` · `/coach/plans/[planId]/ny-okt` · `/coach/plans/perioder` ·
`/mal/milepaeler` · `/mal/statistikk` · `/reach` · `/tren/turneringer/ny` ·
`/meg/innstillinger/ai-coach` · foreldreløse v2 `/tren/aarsplan/periode/ny`(+`/rediger`).
Redirect-stubber: `/mal/runder/[id]/shot-by-shot` · `/trackman/[sessionId]` ·
`/live/[sessionId]/logger` · fullscreen `/tren`.

## Ikke dekket av denne kode-auditen

Visuell bekreftelse (at hver v2-skjerm faktisk SER riktig ut, ikke bare importerer riktig) krever
innlogging. På ny London-DB finnes bare Anders (ADMIN) + Markus (COACH) — ingen testspiller for
PlayerHQ-visuell gjennomgang.

## Anbefalt rekkefølge

1. **Port de 3 verste PlayerHQ-flatene:** statistikk, tren/aarsplan, sg-hub(+6 drill-downs) — de
   er ekte gammelt/bespoke og synlige.
2. **Port de 6 AgencyOS-gapene** (AgPage-familien først — master-planen flagget den ikke-kanon).
3. **Transitional shared-ui-halen (~19 PlayerHQ):** løft PlayerHero→V2Shell, én skjerm per commit.
4. **Slett de ~29 døde holdover-rutene** (egen opprydding-commit).
</content>
