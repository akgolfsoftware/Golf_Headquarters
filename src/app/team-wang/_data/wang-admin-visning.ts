// Visningsmodellen for invitasjoner og timeplanunntak i WANG Administrasjon (pakke W4).

export interface WangAdminData {
  /** Den innloggede sportssjefen; egen rad får ikke «Fjern tilgang». */
  megId: string | null;
  invitasjoner: { id: string; epost: string; utloper: string; utlopt: boolean }[];
  unntak: { id: string; uke: number; fra: string; til: string | null; tekst: string }[];
}

export const TOM_ADMINDATA: WangAdminData = { megId: null, invitasjoner: [], unntak: [] };
