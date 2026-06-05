# Claude Design — to-spors kontroll

> To separate Claude Design-prosjekter. Hold dem adskilt til hver er ferdig og handet off.
> Dette dokumentet er kontroll-oversikten: hva som gjelder hvor, og hvordan handoff skjer.

## Hvorfor separate prosjekter

- **Én brief, én branch, ett fokus** per prosjekt — ingen kontekst-blanding.
- Ulikt tema (AgencyOS mørkt / PlayerHQ lyst) og ulik struktur — adskilt = ingen forvirring.
- Hver gjennomgås og merges uavhengig. Problem i den ene blokkerer ikke den andre.

## Spor 1 — AgencyOS (coach, mørkt)

| | |
|---|---|
| **Brief (last opp)** | `agencyos-komplett-brief.md` |
| **Referansebilder** | `~/Downloads/agencyos-skjermbilder/` |
| **Kickoff-prompt** | se `kickoff-prompts.md` |
| **Svar på åpne spm** | se `claude-design-svar.md` |
| **Branch** | `design/agencyos-lean` |
| **Nytt å bygge** | fokus pin+AI · fellesmelding · global veksler |

## Spor 2 — PlayerHQ (spiller, lyst)

| | |
|---|---|
| **Brief (last opp)** | `playerhq-komplett-brief.md` |
| **Referansebilder** | `~/Downloads/playerhq-skjermbilder/` |
| **Kickoff-prompt** | se `kickoff-prompts.md` |
| **Svar på åpne spm** | se `claude-design-svar.md` |
| **Branch** | `design/playerhq-lean` |
| **Nytt å bygge** | Turnering-detalj · økt-rad åpner økten |

## Den ene tingen som overlapper — Workbench

PlayerHQ og AgencyOS deler **samme Workbench-motor i koden** (coach-endring propagerer til spiller).
I de to design-prosjektene tegnes den som to overflater (spiller-visning / coach-visning) — det er OK.
**Reconciliation mot den ene delte motoren gjøres ved handoff (kode-fasen), ikke i Claude Design.**
Så du trenger ikke koordinere Workbench mellom de to prosjektene — det er min jobb når jeg porter.

## Sannhets-regel (gjelder begge)

- **Motor** (data, modeller, server-actions, hva som faktisk virker) → **koden / PLATFORM.md** er fasit.
- **Struktur og utseende** → **den slanke designen + Anders' låste beslutninger** overstyrer eldre skills/PLATFORM.md.

## Handoff-flyt (per app, separat)

1. Bygg ferdig prototypen i sitt Claude Design-prosjekt (svar på åpne spørsmål er gitt).
2. Send meg branch-/fil-handoffen.
3. Jeg forankrer mot den ekte motoren på `design/<app>-lean`, kjører gjennomgang (diff + ingen brekkasje).
4. Først da merges — én app om gangen.
