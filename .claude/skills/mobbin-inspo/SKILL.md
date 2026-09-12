---
name: mobbin-inspo
description: >
  Designinspirasjon fra Mobbin (ekte app-skjermer) for AK Golf HQ.
  Bruk ved "mobbin", "designinspo", "UI-referanse", "hvordan gjør top-apper",
  "dashboard-inspo", "AI-chat UI", "inbox-mønster", "unngå AI-slop".
  MCP: https://api.mobbin.com/mcp — krever OAuth. Versjon 2026-09-11.
---

Prosjektkilder: `AGENTS.md` → `docs/platform/AGENT-BRIEF.md`. Design velges i `designsystem/README.md`; historiske skill-eksempler overstyrer ikke disse kildene.

# Mobbin design-inspo

## Hva
Mobbin = 600k+ **ekte** skjermer. Bruk for struktur og flyt — **ikke** kopier farger.
For aktiv retning: les [Atletisk intelligens](../ak-hq-design/references/atletisk-intelligens.md). Anders' eget bildesett styrer visuell smak. Mobbin og offisielle produktkilder brukes sekundært for å kontrollere struktur, flyt og interaksjonsmønstre. Train-lock og Paper er historiske referanser, ikke visuell fasit for Design System v0.1.

## Auth (hvis MCP feiler)
Claude: `/mcp` → mobbin → Authenticate → logg inn.  
Grok: ny sesjon + OAuth hvis bedt.  
Notat: `~/Documents/Claude/inbox/mobbin-design-inspo-agencyos.md`

## Arbeidsflyt
1. Definer jobben (5 sek): f.eks. «cockpit — hva haster»
2. Start med Anders' smaksreferanser; søk deretter Mobbin (MCP hvis auth, ellers bruk verifiserbare produktkilder)
3. Skill visuelt smaksbevis fra bevis på testet brukervennlighet
4. Trekk ut **3 grep** (layout, hierarki, handling) — ikke kopier hex, geometri eller merkevare
5. Koble grepene til oppgaver og semantiske komponentbehov i Design System v0.1, ikke automatisk til dagens v2-komponenter
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
