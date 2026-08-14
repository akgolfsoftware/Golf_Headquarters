# Prompt — Claude Code-session: implementer D1–D6 pixel-tro mot design-zippen

Vedlegg til sessionen: **`akgolfhq-design-fasiter.zip`** (design-fasitene + tokens +
kart-kvitteringene). Alt i D1–D6 er tegnet og verifisert i designprosjektet 14.08.2026.

## Anbefalt modell

- Steg 0 (taksonomi-verifikasjon) + fasit-avviksrapport: **Opus**
- Leveranse 1–6 (implementering): **Sonnet**
- Pixel-rettelser i etterkant: Haiku

## Begrunnelse

Steg 0 avgjør om K2/K4 er kobling eller migrering. Implementeringen er mønsterstyrt
med fasitene som kravspec — og fasitene ER kravspecen: HTML-en i zippen er kjørbar,
med tilstander, tomtilstander, nevnere og all copy ferdig skrevet.

## Optimal prompt

```xml
<role>
Du er senior fullstack-utvikler i AK Golf HQ-repoet (Next.js 16 + React 19 +
TS strict, Prisma 7.8 mot Supabase, Tailwind v4 + shadcn/ui, Stripe 22,
Resend 6, Anthropic AI SDK). Norsk UI. System foreslår, menneske godkjenner.
</role>

<mission>
Implementer leveranse [N] fra design-zippen akgolfhq-design-fasiter.zip, og
rett eksisterende design-kode i repoet som avviker fra designsystemet i zippen.
Rekkefølge på tvers av sessions:
0) Taksonomi-verifikasjon + fasit-avviksrapport
1) Workbench F4 (fase1/workbench-desktop.html + -mobil + -stall)
2) Booking→faktura (fase2/agencyos/agencyos-okonomi.html + playerhq-betaling.html)
3) Ukesrapport/digest (agencyos-godkjenninger.html + playerhq-ukesdigest.html + forelder-barn.html)
4) Test→drill + forfall (playerhq-test-detalj.html + playerhq-hjem-varsler.html + workbench-desktop)
5) Gapping (playerhq-gapping.html)
6) Skoletidsbekreftelse (forelder-barn.html)
</mission>

<step_0_gate>
FØR noe bygges, i egen session:
a) Verifiser i prisma/schema.prisma + seed-data at runde-, test- og drilldata
   deler områdetaksonomi (AK-formelens fem slots); at RSVP/booking har feltene
   F3/F4-fasitene antar (kilde, låst, fra, sendt, done, hoppet, ghost-utkast);
   at TrackMan-økter har carry per kølle koblet mot utstyr.
   Rapportér FINNES/MANGLER med modell- og feltnavn. STOPP hvis
   områdetaksonomien ikke deles — da er leveranse 4 migrering, ikke kobling.
b) Fasit-avviksrapport: sammenlign eksisterende implementerte skjermer mot
   tokens i zippen (akhq-tokens v3.1 — verbatim i hver fasit-<style>) og list
   avvik per skjerm: farger utenfor paletten, radius utenfor stigen
   (8/12/16/24/pill), fonter (Poppins/Lora/IBM Plex Mono — merk: repoet bruker
   Inter/Familjen Grotesk/JetBrains Mono i dag; FLAGG konflikten, ikke bytt
   fonter uten eiers vedtak), treffmål under 44 px, clay brukt utenfor
   monopolet («Én ting nå» + fokus). Rapport, ikke retting — rettingen
   prioriteres av eier før leveranse-sessions.
</step_0_gate>

<constraints>
- Fasit-HTML-en i zippen er kravspec: tilstander (fylt/tom/laster/feil),
  tomtilstander, nevner-tekster og copy implementeres ORDRETT. Avvik krever
  begrunnelse i PR-tekst. Pixel-tro betyr: tokens, spacing-stige (4px-base),
  radius-stige og typografi fra zippen — ikke skjermbilde-diffing.
- Les fasit-filens topp-kommentar først: hver fil navngir rute, datakilde og
  reglene den håndhever (f.eks. «Stripe eier status», «utkast teller ikke»,
  «nevner = publiserte økter med passert slutt»). Reglene er krav, ikke prosa.
- Gjenbruk mønstre: PlanAction for alt agentskrevet (rapportagenten LESER og
  publiserer via kø — skriver aldri til plan/kunnskap/faktura), eksisterende
  SG-/viz-komponenter (gapping = utvidelse av DispersionMap, K10), Oslo-tid
  via eksisterende helpers. Ikke Vitest (node:test + Playwright).
- GDPR/mindreårige: ID-er i logger og prompts, aldri navn; forelder ser bare
  egne barn; samtykke-gates respekteres.
- Stripe eier betalingsstatus (betalt/åpen/forfalt); vi lagrer referanse.
  Purring er manuell handling som logges — aldri automatikk.
- Angre ruller tilbake HELE tilstanden inkl. endringsloggen — loggen spilleren
  leser skal aldri påstå et varsel som ikke ble sendt (F4-regel i fasitene).
- Små verifiserbare PR-er; hver PR navngir fasit-fil og planrad den dekker.
</constraints>

<verification>
Per leveranse: node:test for regnelogikk (etterlevelse-nevner, forfall-intervall,
gapping-flaggregel inkl. driver-unntaket og 20-slags-terskelen), Playwright for
hovedflyt (composer→ghost→bekreft; RSVP→fakturalinje→PlayerHQ; test→«legg i
uka»→utkast), og manuell sjekk mot fasit i to bredder (860/430) i lys OG mørk
modus. Ingen leveranse meldes ferdig på kompilering alene.
</verification>

<honesty>
Finnes ikke en modell, et felt eller en komponent du trenger: si det med filsti
og foreslå minste migrering — ikke dikt opp navn, ikke bygg rundt hullet i
stillhet. Alt du hevder om repoet skal ha filsti.
</honesty>
```

## Advarsler / tips

- Kjør steg 0 alene på Opus; lås funnene i `docs/taksonomi-verifikasjon.md` og
  `docs/fasit-avvik.md` i repoet, så leveranse-sessions slipper å re-verifisere.
- Én session per leveranse. Legg bare ved fasit-filene for leveransen fra zippen
  — ikke hele arkivet i kontekst.
- Font-konflikten (repo: Inter/Familjen Grotesk vs. designsystem: Poppins/Lora)
  er et eiervedtak — flagg den i steg 0, ikke avgjør den i en kode-session.
