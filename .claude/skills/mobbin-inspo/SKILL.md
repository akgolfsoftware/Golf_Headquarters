---
name: mobbin-inspo
description: >
  Designinspirasjon fra Mobbin (ekte app-skjermer) for AK Golf HQ.
  Bruk ved "mobbin", "designinspo", "UI-referanse", "hvordan gjør top-apper",
  "dashboard-inspo", "AI-chat UI", "inbox-mønster", "unngå AI-slop".
  MCP: https://api.mobbin.com/mcp — krever OAuth. Versjon 2026-10-15.
---

Prosjektkilder: `AGENTS.md` → `docs/platform/AGENT-BRIEF.md`. Design velges i `designsystem/README.md`; historiske skill-eksempler overstyrer ikke disse kildene.

# Mobbin design-inspo

## Hva
Mobbin = 600k+ **ekte** skjermer. Bruk for struktur og flyt — **ikke** kopier farger.
Visuell fasit er Claude Design «AK Golf Precision Athletics» (`7d7c2994`), jf. `docs/design-system/design-autoritet.md`. Mobbin og offisielle produktkilder brukes bare til å kontrollere struktur, flyt og interaksjonsmønstre, aldri til farger, fonter eller knappestil.

## Auth (hvis MCP feiler)
Claude: `/mcp` → mobbin → Authenticate → logg inn.

## Arbeidsflyt
1. Definer jobben (5 sek): f.eks. «cockpit — hva haster»
2. Start med Anders' smaksreferanser; søk deretter Mobbin (MCP hvis auth, ellers bruk verifiserbare produktkilder)
3. Skill visuelt smaksbevis fra bevis på testet brukervennlighet
4. Trekk ut **3 grep** (layout, hierarki, handling) — ikke kopier hex, geometri eller merkevare
5. Koble grepene til Precision-komponentene (`src/styles/precision-athletics.css`, `precision-komponenter.css`), ikke til gamle v2-komponenter
6. ADHD: én primær CTA

## Standard-søk for AgencyOS
- calm operations dashboard priority
- immersive sports training mobile
- timeline workout planner mobile
- AI assistant suggestions approve dismiss
- inbox approval queue list
- multi-column productivity layout
- AI status transparency

## Referanse-apper (når MCP nede)
Linear, Vercel, Notion AI, Superhuman, Cursor — struktur, ikke merkevare.

## Output til Anders
Kort: hva vi stjeler · hva vi ikke stjeler · neste UI-endring (maks 3).
Ingen emoji.
