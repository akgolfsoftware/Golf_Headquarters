# Tema: lys og mørk (fasit)

**Oppdatert:** 2026-07-25 (korrigert mot faktisk deployet tilstand — kode er fasit)  
**Kilde i kode:** `src/app/layout.tsx` (før paint), `src/components/v2/shell.tsx` (B28), `src/app/globals.css` (`:root` + `html[data-v2-tema="light"]`).  
**Forretningsfasit:** `docs/platform/BUSINESS-RULES.md` § Tema per produkt.

---

## For deg (én setning)

**PlayerHQ er alltid lys (B28). Alt annet — AgencyOS, Forelder, auth, marketing — er mørkt som standard. Kun AgencyOS har lys-bryter.**

---

## Per produkt

| Produkt | URL | Default | Kan bytte? |
|---|---|---|---|
| **PlayerHQ** | `/portal` | **Lys** | **Nei** — låst (B28) |
| **AgencyOS** | `/admin` | **Mørk** | **Ja** — sol/måne i shell |
| **Forelder** | `/forelder` | **Mørk** | Nei (ingen lys-tvang i kode) |
| **Auth** | `/auth` | **Mørk** | Nei |
| **Marketing / booking / stats** | `akgolf.no`, `/booking`, `/stats` | **Mørk** | Ikke samme v2-toggle |

> Åpent spørsmål (2026-07-25): marketing-mockups viser mørk PlayerHQ mot B28s lys-lås.
> B28 gjelder i kode inntil Anders tar stilling.

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
| «Design default er lys overalt» | Nei — CSS og alle flater unntatt PlayerHQ er mørk-først |
| «PlayerHQ kan toggles til mørk» | Nei — alltid lys (B28, se åpent spørsmål over) |
| «AgencyOS er alltid mørk» | Nei — standard mørk, men lys er lov |
| «Forelder og auth er lyse» | Nei — mørke i deployet kode (rettet 2026-07-25) |
| «To cookies (admin vs portal)» | Nei — én cookie, path-lås for PlayerHQ |

---

## Se også

- `docs/design-system/FASIT.md` §1  
- `docs/platform/BUSINESS-RULES.md` § Tema  
- `.claude/rules/design-system-regel.md`  
- `.claude/rules/beslutninger.md`  
