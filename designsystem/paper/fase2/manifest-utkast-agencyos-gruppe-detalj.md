# Manifest — `fase2/agencyos/agencyos-gruppe-detalj.html`

> **UTKAST — krever Anders' godkjenning.** Generert 20.08.2026 fra malinnholdet (brief «treningsplanlegging» 20.08.2026). Ikke fasit før godkjent.

| Felt | Verdi |
|---|---|
| Fil | `fase2/agencyos/agencyos-gruppe-detalj.html` |
| Fidelitet | MAL — mørk modus og tilstander i `w4-base.css` |
| Rute | /admin/grupper/[id] (+ faner årsplan · timeplan · skoledata) |

## Nytt siden forrige zip (16.08.2026 21:11)
- «Denne økta blir nå din egen»-tilstanden (demo-chip «Økt frigis»): avlysing av fellesøkt frigir en egen kopi til hver påmeldt spiller — med spiller-siden av meldingen vist.
- Hovedcoach: begrep innført i header, nøkkeltall og samlingsrader («eier: hovedcoach»).
- Laster- og feiltilstand lagt til (skjermen hadde bare full/tom).

## Tilstander tegnet
full gruppe · økt frigis · uten medlemmer (tom) · laster · feil — lys og mørk

## NYE komponenter (finnes ikke i biblioteket — Sonnet må bygge dem)
- ingen — alt er eksisterende bibliotek eller ren markup

## Avvik per rute
Frigi-dialogen er ConfirmDialog-mønsteret (modal: true). Å avlyse sperres aldri; spillerne beholder øktene som sine egne og hovedcoach varsles ved endringer.
