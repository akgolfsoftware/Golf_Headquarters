// Hjelper for gruppekalenderen fra AgencyOS. Resten av denne filen bygde
// kalenderen til den gamle fellessiden, der demoøkter ble blandet med ekte
// data. Den siden er slettet (16.10.2026), og demofunksjonene med den.

/** Eneste sted som avgjør om en GroupSchedule-rad er en turnering — brukes til å
 * EKSKLUDERE turneringer fra andre hendelseslister (f.eks. «Kommende samlinger og
 * tester»), slik at samme hendelse aldri vises to steder. */
export function erTurneringstittel(tittel: string): boolean {
  return (
    tittel.startsWith("Turnering:") || tittel.startsWith("Klubbmesterskap")
  );
}
