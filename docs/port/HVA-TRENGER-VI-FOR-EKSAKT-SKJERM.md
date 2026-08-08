# Hva trengs for at hver skjerm blir «eksakt som design»

**Oppdatert:** 2026-08-08

## Har vi en komplett skjermplan?

| | Antall | Status |
|---|---:|---|
| App-ruter (`page.tsx`) | ~450+ | Kode finnes |
| **Tegnet Paper-fasit** (`fase1/`) | **33 HTML** | Komplett for det som er tegnet |
| Unike ruter med fasit | ~38 | Se `fasit-liste-paper.md` |
| Portet + merget (visuelt OK-krav) | ~40 flater | Layout-pass pågår (Hjem/Plan/logo) |
| **Uten tegnet fasit** | **~300+** | **Ikke komplett** — W2–W6 |

**Konklusjon:** Vi har en **komplett plan for *hvordan*** (metode + bølger), men **ikke** en komplett **visuell fasit for hver skjerm**. Uten fasit-HTML kan ingen AI «vite eksakt» piksel-for-piksel.

## Hva som trengs for «eksakt» på én skjerm

Minstedokument per flate (alt må finnes før merge):

1. **Fasit-fil** — `designsystem/paper/fase1/…html` eller godkjent `fase2/…html`
2. **Rute-mappe** — rad i `docs/port/fasit-liste-paper.md` (HTML ↔ `/portal/...`)
3. **Tilstander** — minst: suksess, tom, laster, feil (fasit eller mønsterdokument)
4. **Viewport** — mobil (~430) + desktop (≥1121); iPad der det er egen fasit
5. **Data-kontrakt** — hvilke felt som vises (ikke demo-tekst fra HTML)
6. **Én ting nå** — hvilken handling som eier `T.handling`
7. **Sign-off** — app + fasit side om side, Anders sier ja → `portstatus-paper.md`

## Hvor «vet vi» hva som skal være på skjermen?

| Kilde | Brukes når |
|---|---|
| `fase1/*.html` | Har fasit — **fasit vinner** |
| `monsterdokument-paper.md` | Delvis mønster uten egen HTML (midlertidig polish) |
| `fase2/` wireframes | W2–W6 — **må tegnes først** |
| `docs/platform/SKJERM-KNAPP-KART.md` | Hva knapper/data *gjør* (produkt), ikke piksel |
| `docs/COMPLETE-REMAINING-PLAN.md` | Rekkefølge og spor |

## Hva mangler for 100 % dekning

1. **Tegne W2–W6** i Claude Design (`fase2/`) for de ~300 uten fasit  
2. **Konsolidering** — kutte redirects/duplikater før tegning  
3. **Visuell port** av alle fase1-flater (ikke bare tokens)  
4. **Din batch-ja** per bølge  

## Logo (app-wide, 2026-08-08)

- Rail (alltid mørk): `LogoAK surface="ink"`  
- Lys canvas/auth/marketing: `surface="paper"`  
- `public/logos/*`: Paper-palett (ikke Presis grønn/lime)  
- Regel: `designsystem/paper/uploads/ak-golf-logo-bruk.md`

## Én setning

**Planen for arbeidet er komplett. Tegningen av hver skjerm er det ikke — ~40 har fasit, ~300 trenger fase2-wireframe før «eksakt» er mulig.**
