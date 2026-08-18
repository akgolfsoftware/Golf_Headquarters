> UTGÅTT 18.08.2026 — styrer ingenting. Gjeldende: se docs/port/GYLDIGHET.md.

# Wave G status — Pattern PlayerHQ rest (2026-08-09)

> **Master:** [`WAVE-STATUS-MASTER.md`](./WAVE-STATUS-MASTER.md)  
> **Checklist:** [`PAPER-PATTERN-CHECKLIST.md`](./PAPER-PATTERN-CHECKLIST.md)

## Scope
PlayerHQ-skjermer **uten** Paper HTML-fasit — designet mot designsystemet (plan §6).

## Levert (~50 flater)

| Domene | Eksempler |
|---|---|
| **Talent** | TalentV2, MinPlan, MittNivå, Roadmap, Sammenligning |
| **Mål / mal** | MalHub, MalBygger, MalDetalj, AiMalBygger |
| **Data / analyse** | DataGolf, Gameplan, Leaderboard, Kalender, Gjor, Hull, Break |
| **Innstillinger-*** | Anlegg, Integrasjoner, Økter, Sikkerhet, Språk, Varsler |
| **Meg-sub** | Profil, Abonnement, Dokumenter, Faktura, Feedback, Foreldre, Help, Helse, Utstyr |
| **Coach-portal** | Hub, Meldinger, QA, AI, Planer, Øvelser, Videoer, SG Hub |
| **Sosial** | Venner, Varsler, Del runde, Foreslå drill/turnering |

### Mønster brukt
- `data-paper-wave-g` + `data-paper-pattern`
- **17px** h1 + mono sub (`data-paper-pattern-topp`)
- Primær CTA **56px** clay der det var solid handling
- maxWidth 720 der det passet

## DONE-def (uten fasit)
Følger tokens/shell/CTA/empty — **ikke** pixel-diff.  
Screenshots + main push fortsatt åpne.

## Neste
**Wave H** — AgencyOS rest uten fasit
