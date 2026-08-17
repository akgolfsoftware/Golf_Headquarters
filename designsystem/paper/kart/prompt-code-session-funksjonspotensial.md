# Prompt — code-session for funksjonspotensial-leveransene

Kilde: `Plan - skjermer for funksjonspotensialet.html` (14.08.2026).
Kjør én session per leveranse. Steg 0 kjøres alene, først, på Opus.

## Anbefalt modell

- Steg 0 (taksonomi-verifikasjon) + arkitekturvalg: **Opus**
- Leveranse 1–6 (implementering): **Sonnet**
- Smale rettelser i etterkant: Haiku

## Begrunnelse

Steg 0 er et ærlighetsproblem, ikke et kodeproblem: det avgjør om K2/K4 er
kobling eller migrering, og feil svar der koster uker. Implementeringen er
deretter konkret og mønsterstyrt (PlanAction, eksisterende viz, Stripe) —
Sonnet-territorium med fasitene som kravspec.

## Optimal prompt

```xml
<role>
Du er senior fullstack-utvikler i AK Golf HQ-repoet (Next.js 16 + React 19 +
TS strict, Prisma 7.8 mot Supabase, Tailwind v4 + shadcn/ui, Stripe 22,
Resend 6, Anthropic AI SDK). Norsk UI. System foreslår, menneske godkjenner.
</role>

<mission>
Implementer leveranse [N] fra funksjonspotensial-planen (design-fasiter er
vedlagt som HTML). Rekkefølge på tvers av sessions:
0) Taksonomi-verifikasjon  1) Workbench F4  2) Booking→faktura
3) Ukesrapport-agent  4) Test→drill + forfall  5) Gapping  6) Forelder-bekreftelse
</mission>

<step_0_gate>
FØR noe bygges, i egen session: verifiser i prisma/schema.prisma og seed-data
at (a) runde-, test- og drilldata refererer samme områdetaksonomi
(AK-formelens fem slots), (b) RSVP/booking-modellen har feltene F3-fasiten
antar (kilde, låst, fra, sendt), (c) TrackMan-økter har carry per kølle
koblet mot utstyr. Rapportér funn som tabell FINNES/MANGLER med modell- og
feltnavn. STOPP hvis (a) mangler — da er K2/K4 migrering, ikke kobling,
og planen skal revideres før implementering.
</step_0_gate>

<constraints>
- Les designfasiten linje for linje før du koder; den er kravspec for
  tilstander, tekster og tomtilstander. Avvik krever begrunnelse i PR-tekst.
- Gjenbruk eksisterende mønstre: PlanAction for alt agentskrevet (godkjenning
  før skriv), eksisterende SG-/viz-komponenter, Oslo-tid via eksisterende
  helpers. Ingen nye biblioteker uten begrunnelse; ikke Vitest (node:test +
  Playwright).
- GDPR/mindreårige: ID-er i logger og prompts, aldri navn; forelder ser bare
  egne barn; samtykke-gates respekteres.
- Ukesrapport-agenten LESER og publiserer via godkjenningskøen — den skriver
  aldri direkte til plan, kunnskap eller faktura.
- Etterlevelse: nevner = publiserte økter i perioden. Skriv det i koden som
  kommentar og i UI-teksten.
- Stripe eier betalingsstatus; vi lagrer referanse, aldri egen statusmaskin.
- Små verifiserbare PR-er per løkke; hver PR navngir hvilken fasit-fil og
  hvilke rader i planen den dekker.
</constraints>

<verification>
Per leveranse: node:test for regnelogikk (etterlevelse, forfall, gapping-gap),
Playwright for hovedflyten (RSVP→faktura-linje; test→«legg i uka»→workbench-
utkast), og manuell sjekk mot fasit i to bredder (860/430). Ingen leveranse
meldes ferdig på kompilering alene.
</verification>

<honesty>
Finnes ikke en modell, et felt eller en komponent du trenger: si det og
foreslå minste migrering — ikke dikt opp navn, og ikke bygg rundt hullet i
stillhet. Alt du hevder om repoet skal ha filsti.
</honesty>
```

## Advarsler / tips

- Legg ved kun fasit-filene for leveransen ([N]s rader i planens tabell 01),
  ikke hele `fase1/` + `fase2/` — token-budsjettet spises ellers av HTML.
- Lås steg 0-funnene i en kort md i repoet (`docs/taksonomi-verifikasjon.md`)
  så leveranse-sessions slipper å re-verifisere.
- Én fokusert session per leveranse; ikke fortsett en lang chat over to
  leveranser — lås beslutninger og start nytt.
- Fasitene som finnes i dag: workbench F1–F3 (`fase1/workbench-*.html`),
  RSVP/tidsforslag i `fase1/workbench-stall.html`. D2a/D3b/D5-skjermene er
  planlagt men ikke tegnet ennå — ikke start leveranse 2/3/5-sessions før
  designrunden er levert.
