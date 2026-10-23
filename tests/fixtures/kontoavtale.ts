/** Kun syntetisk testtekst. Skal aldri importeres i appkode eller publiseres som avtale. */
export const syntetiskKontoAvtale = {
  versjon: "test-pakke-1",
  vilkar: { versjon: "test-vilkar-1", tekst: "Syntetiske testvilkår. Ingen juridisk avtale." },
  personvern: { versjon: "test-personvern-1", tekst: "Syntetisk testinformasjon. Ingen persondata." },
  bekreftelse: { vilkar: "Test: jeg godtar vilkårene.", personvern: "Test: jeg har lest personvernerklæringen." },
};
export const syntetiskKontoSvar = { pakkeVersjon: "test-pakke-1", vilkarGodtatt: true, personvernLest: true };
