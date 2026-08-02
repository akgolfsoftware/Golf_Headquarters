export interface IconProps {
  /**
   * Navigasjon: hjem · stall · cockpit · ko · plan · ai · idag · analyse · profil
   * Tonesett (låst per tone, ikke valgt per skjerm): varsel (warn) ·
   * info (info) · laas (personvern) · notis (nøytral)
   */
  name: string;
  /** 18 i rail, 20 i tabbar, 16 i Callout/Banner */
  size?: number;
}
