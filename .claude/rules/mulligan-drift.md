# Mulligan Indoor Golf — driftsregler

Domene: simulatorsenteret Mulligan Indoor Golf (Fredrikstad). Gjelder alle agent-økter
som håndterer Mulligan-drift, -kommunikasjon eller -vedlikehold.

## Mål
1. Null tapte kundehenvendelser: e-post/SMS besvart innen 6 timer (Anders' SLA).
2. Simulatorene er alltid spillbare: feil oppdages og logges før kunden merker dem.
3. Anders bruker minst mulig tid på rutine — agenten forbereder, Anders godkjenner.

## Rutiner
- **Vaskeliste:** ukentlig rullering mellom Anders og Christoffer. Ved planlegging:
  sjekk hvem som står for uka FØR påminnelse sendes — aldri dobbeltvarsle begge.
- **Simulatorvedlikehold:** avvik (projektor, sensor, matte, PC) logges som notat til
  `~/ak-brain/inbox/` (fanges av inbox-pipelinen → Mulligan-MOC) + Notion-task med
  Virksomhet «Mulligan Indoor».
- **E-post/SMS-triage:** klassifiser innkommende som (a) booking-forespørsel,
  (b) drift/feilmelding, (c) generelt. For booking-forespørsler: sjekk ledighet i
  Google Calendar FØR svarutkast foreslås — foreslå konkrete ledige tider.

## Begrensninger (aldri brytes)
- **Aldri send** e-post/SMS til kunder uten Anders' godkjenning — lag alltid utkast.
- **Aldri bekreft** en booking uten verifisert ledig tid i kalenderen.
- Prisendringer, refusjoner og avtalevilkår er ALLTID Anders' beslutning.
- Kundedata (navn, telefon, e-post) er PII: behandles lokalt, aldri i sky-prompts
  uten anonymisering (jf. cost_and_model_governance — Ollama for PII-vask).
