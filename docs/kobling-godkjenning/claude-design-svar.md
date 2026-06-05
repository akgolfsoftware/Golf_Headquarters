# Svar på Claude Designs åpne spørsmål

> Lim inn i riktig prosjekt når Claude Design stiller åpne spørsmål før bygg.

## Sannhets-regel (begge apper)

- **Motor** (data, modeller, actions, hva som virker) → **koden / PLATFORM.md** er fasit.
- **Struktur og utseende** → **den slanke designen + Anders' låste beslutninger** overstyrer eldre skills/PLATFORM.md.

---

## AgencyOS

1. **Branch eller prototype?** (a) Høyoppløst HTML-prototype forankret mot repoet. Du kan ikke pushe — jeg tar kode-handoffen til `design/agencyos-lean` etter godkjent utseende. Ikke push selv.
2. **PLATFORM.md som fasit?** Ja for motoren. Men låste beslutninger + slank design overstyrer for struktur (f.eks. spiller-klikk → Workbench direkte, ikke profil-mellomside).
3. **SMS i fellesmelding?** Push + e-post aktive. SMS vises som «kommer» (grået ut) — ingen SMS-leverandør i koden.
4. **Pin-persistens?** Ren økt-state i prototypen. Persistens (`PlayerFocusPin`) kommer i kode-fasen.
5. **Bygge mot koden slik den er?** Ja — koden er sannhet for motoren. §14-konflikter (acceptPlanAction, ingen godkjenningsinnboks, CBAC) er egne oppgaver senere. **Kjør.**

---

## PlayerHQ

1. **Branch eller prototype?** (a) Høyoppløst HTML-prototype forankret mot repoet. Jeg tar kode-handoffen til `design/playerhq-lean`. Ikke push selv.
2. **PLATFORM.md som fasit?** Ja for motoren. MEN den ferske designen + låste beslutninger overstyrer for struktur:
   - **Tema lyst** (ikke mørk sidebar fra eldre skill).
   - **Coach = skuff fra høyre, IKKE femte fane.** Femte fane er Meg.
   - **5 faner: Hjem · Planlegge · Gjennomføre · Analysere · Meg.**
3. **Nytt vs re-kobling?** Bygg kun nytt: Turnering-detalj (data finnes) + la økt-rad åpne selve økten. Resten re-kobling.
4. **Live-økt / state?** Bygg mot Spor A (`TrainingPlanSession`) som i dag. Kjent §14-gap: live-reps holdes i React-state/sessionStorage, ikke DB (Spor B ubrukt). Ikke løs gapet i prototypen — gjenspeil dagens oppførsel; persistens fikses i kode-fasen.
5. **Bygge mot koden slik den er?** Ja for motoren; struktur/utseende følger slank design. Abonnement: gratis / 300 kr — ingen tier-nivåer, ELITE finnes ikke. **Kjør.**
