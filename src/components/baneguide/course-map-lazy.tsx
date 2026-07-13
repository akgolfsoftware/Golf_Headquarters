"use client";

/**
 * Lazy CourseMap (Bølge 6, 2026-07-13): mapbox-gl er den tyngste
 * klient-avhengigheten i appen og kan ikke SSR-es meningsfullt. Denne
 * wrapperen laster kartet først i nettleseren (ssr:false) med et rolig
 * skjelett i mellomtiden — server-sidene importerer HERFRA, aldri
 * course-map direkte.
 */

import dynamic from "next/dynamic";

export type { CourseMapHole } from "./course-map";

export const CourseMapLazy = dynamic(
  () => import("./course-map").then((m) => m.CourseMap),
  {
    ssr: false,
    loading: () => (
      <div
        aria-label="Laster banekart…"
        className="h-full min-h-[280px] w-full animate-pulse rounded-xl bg-secondary/60"
      />
    ),
  },
);
