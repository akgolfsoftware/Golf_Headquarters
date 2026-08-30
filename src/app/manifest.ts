import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AK Golf HQ",
    short_name: "AK Golf HQ",
    description: "Coaching · plan · fremgang i én app for golf",
    start_url: "/portal",
    display: "standalone",
    orientation: "portrait",
    // Web manifest krever literal hex (kan ikke referere CSS-variabler).
    // start_url er /portal, og app-flatene er LYS som standard — splash
    // speiler derfor LYS --v2-bg, som nå er Paper-fasitens --tl-scene (#faf9f5).
    // theme_color er blekk, som `viewport.themeColor` i src/app/layout.tsx —
    // samme verdi som ikonets bakgrunn, så chrome og ikon henger sammen.
    background_color: "#faf9f5",
    theme_color: "#141413",
    lang: "nb",
    categories: ["sports", "lifestyle", "productivity"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-192-maskable.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Start dagens økt",
        url: "/portal",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Logg ny runde",
        url: "/portal/mal/runder/ny",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
