# Tema: lys og mørk (fasit)

**Oppdatert:** 2026-07-23  
**Kilde i kode:** `src/app/layout.tsx` (før paint), `src/components/v2/shell.tsx` (B28), `src/app/globals.css` (`:root` + `html[data-v2-tema="light"]`).  
**Forretningsfasit:** `docs/platform/BUSINESS-RULES.md` § Tema per produkt.

---

## For deg (én setning)

**PlayerHQ er alltid lys. AgencyOS er mørk som standard, med valgfri lys-bryter. Ikke «lys overalt».**

---

## Per produkt

| Produkt | URL | Default | Kan bytte? |
|---|---|---|---|
| **PlayerHQ** | `/portal` | **Lys** | **Nei** — låst (B28) |
| **AgencyOS** | `/admin` | **Mørk** | **Ja** — sol/måne i shell |
| **Forelder / auth-kjerne** | `/forelder`, login m.m. | **Lys** | Nei (låses i chrome) |
| **Marketing / stats** | `akgolf.no`, `/stats` | Egen stil (ofte mørk hero) | Ikke samme v2-toggle |

---

## Teknisk (for AI/utvikler)

1. **CSS-grunnlag:** `:root` = mørke `--v2-*`. Lys = `html[data-v2-tema="light"]`.
2. **Cookie:** `ak-v2-tema=light|dark` (path `/`, 1 år).  
   *(Gammel `ak-admin-theme` er utgått — ikke skriv den tilbake.)*
3. **Før paint:** inline-script i rot-layout setter lys hvis  
   - path starter med `/portal`, **eller**  
   - cookie er `ak-v2-tema=light`.
4. **B28 (låst):** i `V2Shell` for PlayerHQ-nav tvinges alltid `data-v2-tema="light"`, selv om coach har mørk cookie fra AgencyOS. Ellers ble spillerappen mørk for trenere.
5. **Bryter:** kun AgencyOS (og flater som deler AgencyOS-shell). PlayerHQ viser ikke tema-bryter.

---

## Ikke bland

| Feil antakelse | Sannhet |
|---|---|
| «Design default er lys overalt» | Nei — CSS og AgencyOS er mørk-først |
| «PlayerHQ kan toggles til mørk» | Nei — alltid lys |
| «AgencyOS er alltid mørk» | Nei — standard mørk, men lys er lov |
| «To cookies (admin vs portal)» | Nei — én cookie, path-lås for PlayerHQ |

---

## Se også

- `docs/design-system/FASIT.md` §1  
- `docs/platform/BUSINESS-RULES.md` § Tema  
- `.claude/rules/design-system-regel.md`  
- `.claude/rules/beslutninger.md`  
