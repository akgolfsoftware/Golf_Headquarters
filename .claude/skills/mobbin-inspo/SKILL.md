---
name: mobbin-inspo
description: >
  Designinspirasjon fra Mobbin (ekte app-skjermer) for AK Golf HQ.
  Bruk ved "mobbin", "designinspo", "UI-referanse", "hvordan gjør top-apper",
  "dashboard-inspo", "AI-chat UI", "inbox-mønster", "unngå AI-slop".
  MCP: https://api.mobbin.com/mcp — krever OAuth. Versjon 2026-07-23.
---

# Mobbin design-inspo

## Hva
Mobbin = 600k+ **ekte** skjermer. Bruk for struktur og flyt — **ikke** kopier farger.
AK-fasit: `akgolf-design-system` / FASIT / v2 tokens. AgencyOS = mørk, lime kun på NÅ.

## Auth (hvis MCP feiler)
Claude: `/mcp` → mobbin → Authenticate → logg inn.  
Grok: ny sesjon + OAuth hvis bedt.  
Notat: `~/Documents/Claude/inbox/mobbin-design-inspo-agencyos.md`

## Arbeidsflyt
1. Definer jobben (5 sek): f.eks. «cockpit — hva haster»
2. Søk Mobbin (MCP hvis auth, ellers bruk notatet + kjente apper)
3. Trekk ut **3 grepp** (layout, hierarki, handling) — ikke hex
4. Map til v2-komponenter (`Kort`, `Rad`, `KpiFlis`, `CTAPill`)
5. ADHD: én primær CTA

## Standard-søk for AgencyOS
- dark mode admin dashboard KPI
- AI assistant suggestions approve dismiss
- inbox approval queue list
- multi-column productivity layout
- AI dashboard

## Referanse-apper (når MCP nede)
Linear, Vercel, Notion AI, Superhuman, Cursor — struktur, ikke merkevare.

## Output til Anders
Kort: hva vi stjeler · hva vi ikke stjeler · neste UI-endring (maks 3).
Ingen emoji.
