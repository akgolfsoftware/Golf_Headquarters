"use client";

/**
 * ViewModeContext — PlayerHQ Standard/Avansert-toggle.
 *
 * Holder hvilken visningsmodus en innlogget spiller har valgt for kalender-
 * og analyse-sidene i /portal. Standard skjuler taksonomi-koder og avanserte
 * visninger; Avansert eksponerer alt — samme som CoachHQ-versjonen.
 *
 * Persisteres i localStorage under nøkkelen `playerhq_view_mode` slik at
 * valget overlever sidereload. Lytter også på `storage`-event, slik at en
 * endring i én tab forplanter seg til andre åpne tabs.
 *
 * Server Components kan ikke bruke `useViewMode`. De må enten:
 *   1) Default til "standard" og la <ViewModeToggle/> kontrollere klient-state, eller
 *   2) Lese fra en cookie (ikke implementert her — bevisst lett løsning).
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ViewMode = "standard" | "advanced";

const STORAGE_KEY = "playerhq_view_mode";

type Ctx = {
  mode: ViewMode;
  setMode: (m: ViewMode) => void;
  /** True første render før localStorage er lest — unngår hydration-mismatch. */
  hydrated: boolean;
};

const ViewModeContext = createContext<Ctx>({
  mode: "standard",
  setMode: () => {},
  hydrated: false,
});

function lesStartmodus(initial: ViewMode): ViewMode {
  if (typeof window === "undefined") return initial;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === "standard" || raw === "advanced") return raw;
  } catch {
    // localStorage kan være blokkert i private mode — fall tilbake.
  }
  return initial;
}

export function ViewModeProvider({
  children,
  initialMode = "standard",
}: {
  children: ReactNode;
  initialMode?: ViewMode;
}) {
  const [mode, setModeState] = useState<ViewMode>(initialMode);
  const [hydrated, setHydrated] = useState(false);

  // Les fra localStorage etter mount.
  useEffect(() => {
    const lagret = lesStartmodus(initialMode);
    setModeState(lagret);
    setHydrated(true);
  }, [initialMode]);

  // Lytt på endringer fra andre tabs.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== STORAGE_KEY) return;
      if (e.newValue === "standard" || e.newValue === "advanced") {
        setModeState(e.newValue);
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setMode = useCallback((ny: ViewMode) => {
    setModeState(ny);
    try {
      window.localStorage.setItem(STORAGE_KEY, ny);
    } catch {
      // ignorer
    }
  }, []);

  const verdi = useMemo<Ctx>(
    () => ({ mode, setMode, hydrated }),
    [mode, setMode, hydrated],
  );

  return (
    <ViewModeContext.Provider value={verdi}>{children}</ViewModeContext.Provider>
  );
}

export function useViewMode() {
  return useContext(ViewModeContext);
}
