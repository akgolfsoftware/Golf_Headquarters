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
    // start_url er /portal (PlayerHQ = alltid LYS, B28) — splash + chrome
    // speiler derfor LYS --v2-bg (cream) i src/app/globals.css.
    background_color: "#F2F1EA",
    theme_color: "#F2F1EA",
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
