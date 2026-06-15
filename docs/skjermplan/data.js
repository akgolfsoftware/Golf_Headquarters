// AUTO-GENERERT av gen-data.mjs fra docs/MASTER-SKJERMPLAN.md — ikke rediger for hånd.
window.PLAN = {
  "meta": {
    "updated": "13. juni 2026",
    "generert": "15. juni 2026",
    "note": "Levende kart over alle flater i AK Golf HQ — generert deterministisk fra docs/MASTER-SKJERMPLAN.md. Spec utledes per skjerm i spec.js.",
    "source": "docs/MASTER-SKJERMPLAN.md"
  },
  "modules": [
    {
      "id": "playerhq",
      "name": "PlayerHQ",
      "icon": "Smartphone",
      "tema": "lyst",
      "desc": "Spillerens eget verktøy — «hva skal JEG gjøre i dag?». Adressene begynner med /portal.",
      "screens": [
        {
          "gruppe": "Hjem",
          "navn": "Hjem (Workbench-hjem)",
          "rute": "/portal",
          "child": false,
          "key": true,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "ja",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Hjem",
          "navn": "Varsler",
          "rute": "/portal/varsler",
          "child": false,
          "key": true,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "ja",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "Planlegge (= Workbench mobil)",
          "rute": "/portal/planlegge",
          "child": false,
          "key": true,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "ja",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "Workbench (planlegging)",
          "rute": "/portal/planlegge/workbench",
          "child": false,
          "key": true,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "Årsplan",
          "rute": "/portal/tren/aarsplan",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "Rediger periode",
          "rute": "/portal/tren/aarsplan/periode/[id]/rediger",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "nei",
            "data": "nei",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "Teknisk plan (liste)",
          "rute": "/portal/tren/teknisk-plan",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "Teknisk plan detalj",
          "rute": "/portal/tren/teknisk-plan/[planId]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "Fys-plan (liste)",
          "rute": "/portal/tren/fys-plan",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "Fys-plan detalj/bygger",
          "rute": "/portal/tren/fys-plan/[planId]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "Drills (bibliotek)",
          "rute": "/portal/drills",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "Drill-detalj",
          "rute": "/portal/drills/[id]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "Mål-hub",
          "rute": "/portal/mal",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "Mål-bygger (wizard)",
          "rute": "/portal/mal/bygger",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "Mål-detalj",
          "rute": "/portal/mal/goal/[id]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "Milepæler",
          "rute": "/portal/mal/milepaeler",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "Leaderboard",
          "rute": "/portal/mal/leaderboard",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "Turneringer (mine)",
          "rute": "/portal/tren/turneringer",
          "child": false,
          "key": true,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "ja",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "Turnering-detalj",
          "rute": "/portal/tren/turneringer/[id]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "delvis",
          "haker": {
            "design": "delvis",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "delvis",
            "flyt": "delvis",
            "data": "nei",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "Ny turnering",
          "rute": "/portal/tren/turneringer/ny",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "Utfordringer",
          "rute": "/portal/utfordringer",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "Ny utfordring (wizard)",
          "rute": "/portal/utfordringer/ny",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "Utfordring-detalj",
          "rute": "/portal/utfordringer/[id]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "AI: mål-bygger",
          "rute": "/portal/ai/mal-bygger",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "AI: foreslå drill",
          "rute": "/portal/ai/foresla-drill",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "AI: foreslå turnering",
          "rute": "/portal/ai/foresla-turnering",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Gjennomføre",
          "navn": "Gjennomføre (I dag/Kalender/Booking)",
          "rute": "/portal/gjennomfore",
          "child": false,
          "key": true,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "ja",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Gjennomføre",
          "navn": "Økt-detalj (V2-økt fra coach)",
          "rute": "/portal/gjennomfore/[id]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "nei",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "ja",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Gjennomføre",
          "navn": "Kalender",
          "rute": "/portal/kalender",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Gjennomføre",
          "navn": "Kalender (alt. adresse)",
          "rute": "/portal/tren/kalender",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Gjennomføre",
          "navn": "Ny økt (handlingsvalg)",
          "rute": "/portal/ny-okt",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Gjennomføre",
          "navn": "Logg treningsøkt (volum per SG)",
          "rute": "/portal/trening/logg",
          "child": false,
          "key": false,
          "datakoblet": true,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Gjennomføre",
          "navn": "Putte-laboratoriet (3 verktøy)",
          "rute": "/portal/trening/putte-laboratoriet",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "delvis",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "nei",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Gjennomføre",
          "navn": "Break-tabell (3 varianter)",
          "rute": "/portal/trening/break-tabell",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "delvis",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "nei",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Gjennomføre",
          "navn": "Ønsket økt (be coach)",
          "rute": "/portal/onskeligokt",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Gjennomføre",
          "navn": "Ønsket økt bekreftet",
          "rute": "/portal/onskeligokt/bekreftet",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Gjennomføre",
          "navn": "Live-økt: brief",
          "rute": "/portal/(fullscreen)/live/[sessionId]/brief",
          "child": false,
          "key": false,
          "datakoblet": true,
          "status": "delvis",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "delvis",
            "flyt": "delvis",
            "data": "ja",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Gjennomføre",
          "navn": "Live-økt: aktiv",
          "rute": "/portal/(fullscreen)/live/[sessionId]/active",
          "child": false,
          "key": false,
          "datakoblet": true,
          "status": "delvis",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "delvis",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Gjennomføre",
          "navn": "Live-økt: oppsummering",
          "rute": "/portal/(fullscreen)/live/[sessionId]/summary",
          "child": false,
          "key": false,
          "datakoblet": true,
          "status": "delvis",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "delvis",
            "flyt": "delvis",
            "data": "ja",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Gjennomføre",
          "navn": "Live-økt: drill-logger",
          "rute": "/portal/(fullscreen)/live/[sessionId]/logger",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "delvis",
          "haker": {
            "design": "delvis",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Gjennomføre",
          "navn": "Live-økt: score-tapper",
          "rute": "/portal/(fullscreen)/live/[sessionId]/tapper",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "delvis",
          "haker": {
            "design": "delvis",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Gjennomføre",
          "navn": "Tren (fullskjerm)",
          "rute": "/portal/(fullscreen)/tren",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Gjennomføre",
          "navn": "Økt-detalj",
          "rute": "/portal/tren/[sessionId]",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Gjennomføre",
          "navn": "Planlagt økt",
          "rute": "/portal/tren/[sessionId]/planlagt",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Gjennomføre",
          "navn": "Feiring (etter plan ferdig)",
          "rute": "/portal/tren/feiring/[planId]",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Analysere",
          "navn": "Analysere (Les tallene · faner)",
          "rute": "/portal/analysere",
          "child": false,
          "key": true,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "ja",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Analysere",
          "navn": "Hull-analyse",
          "rute": "/portal/analysere/hull",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "delvis",
          "haker": {
            "design": "delvis",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Analysere",
          "navn": "Statistikk (oversikt)",
          "rute": "/portal/statistikk",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Analysere",
          "navn": "Metrikk-detalj",
          "rute": "/portal/statistikk/[metric]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Analysere",
          "navn": "Sammenlign",
          "rute": "/portal/statistikk/sammenlign",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Analysere",
          "navn": "Del runde",
          "rute": "/portal/statistikk/runder/[runId]/del",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Analysere",
          "navn": "SG-Hub (Strokes Gained)",
          "rute": "/portal/mal/sg-hub",
          "child": false,
          "key": true,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Analysere",
          "navn": "Kølle-detalj",
          "rute": "/portal/mal/sg-hub/[club]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Analysere",
          "navn": "Benchmark",
          "rute": "/portal/mal/sg-hub/benchmark",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Analysere",
          "navn": "Best vs nå",
          "rute": "/portal/mal/sg-hub/best-vs-now",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Analysere",
          "navn": "Utstyr",
          "rute": "/portal/mal/sg-hub/equipment",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Analysere",
          "navn": "Avstander (yardage)",
          "rute": "/portal/mal/sg-hub/yardage",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Analysere",
          "navn": "Forhold (vær/bane)",
          "rute": "/portal/mal/sg-hub/conditions",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Analysere",
          "navn": "Strategi",
          "rute": "/portal/mal/sg-hub/strategy",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Analysere",
          "navn": "Coach ser spiller-SG",
          "rute": "/portal/mal/sg-hub/coach/[spillerId]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Analysere",
          "navn": "Coach: kølle",
          "rute": "/portal/mal/sg-hub/coach/[spillerId]/[club]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Analysere",
          "navn": "Coach: utstyr",
          "rute": "/portal/mal/sg-hub/coach/[spillerId]/equipment",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Analysere",
          "navn": "Runder (liste)",
          "rute": "/portal/mal/runder",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Analysere",
          "navn": "Runde-detalj",
          "rute": "/portal/mal/runder/[id]",
          "child": true,
          "key": true,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "ja",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Analysere",
          "navn": "Slag-for-slag (visning)",
          "rute": "/portal/mal/runder/[id]/shot-by-shot",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Analysere",
          "navn": "Slag-registrering (wizard + UpGame)",
          "rute": "/portal/mal/runder/[id]/slag",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "ja",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Analysere",
          "navn": "Logg ny runde",
          "rute": "/portal/mal/runder/ny",
          "child": true,
          "key": true,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "ja",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Analysere",
          "navn": "TrackMan (liste)",
          "rute": "/portal/mal/trackman",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Analysere",
          "navn": "TrackMan-sesjon",
          "rute": "/portal/mal/trackman/[id]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "delvis",
          "haker": {
            "design": "delvis",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Analysere",
          "navn": "TrackMan (alt. adresse)",
          "rute": "/portal/trackman/[sessionId]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "delvis",
          "haker": {
            "design": "delvis",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Analysere",
          "navn": "Tester (oversikt)",
          "rute": "/portal/tren/tester",
          "child": false,
          "key": true,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "delvis",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Analysere",
          "navn": "Test-detalj",
          "rute": "/portal/tren/tester/[testId]",
          "child": true,
          "key": true,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "delvis",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Analysere",
          "navn": "Test-gjennomføring (scorekort)",
          "rute": "/portal/tren/tester/[testId]/gjennomfor",
          "child": true,
          "key": true,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "delvis",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Analysere",
          "navn": "Test-katalog (NGF)",
          "rute": "/portal/tren/tester/katalog",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Analysere",
          "navn": "Ny test",
          "rute": "/portal/tren/tester/ny",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Analysere",
          "navn": "Ny egen test",
          "rute": "/portal/tren/tester/ny/egen",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Analysere",
          "navn": "Test live (fullskjerm)",
          "rute": "/portal/(fullscreen)/test/[testId]/live",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Analysere",
          "navn": "Test oppsummering",
          "rute": "/portal/(fullscreen)/test/[testId]/summary",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Analysere",
          "navn": "Bane-bibliotek",
          "rute": "/portal/mal/baner",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Analysere",
          "navn": "Bane-detalj",
          "rute": "/portal/mal/baner/[id]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Analysere",
          "navn": "Statistikk-side (gml.)",
          "rute": "/portal/mal/statistikk",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Coach",
          "navn": "Coach-hub",
          "rute": "/portal/coach",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Coach",
          "navn": "Coach-profil",
          "rute": "/portal/coach/[coachId]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Coach",
          "navn": "Meldinger (innboks)",
          "rute": "/portal/coach/melding",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Coach",
          "navn": "Ny melding",
          "rute": "/portal/coach/melding/ny",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Coach",
          "navn": "Meldingstråd",
          "rute": "/portal/coach/melding/[id]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Coach",
          "navn": "Vedlegg",
          "rute": "/portal/coach/melding/[id]/vedlegg",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Coach",
          "navn": "Coach-planer",
          "rute": "/portal/coach/plans",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Coach",
          "navn": "Plan-detalj",
          "rute": "/portal/coach/plans/[planId]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Coach",
          "navn": "Ny økt i plan",
          "rute": "/portal/coach/plans/[planId]/ny-okt",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Coach",
          "navn": "Perioder",
          "rute": "/portal/coach/plans/perioder",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Coach",
          "navn": "Coach-øvelser",
          "rute": "/portal/coach/ovelser",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Coach",
          "navn": "Ny øvelse",
          "rute": "/portal/coach/ovelser/ny",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Coach",
          "navn": "Rediger øvelse",
          "rute": "/portal/coach/ovelser/[id]/rediger",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Coach",
          "navn": "Coach-videoer",
          "rute": "/portal/coach/videoer",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Coach",
          "navn": "Coach-notater",
          "rute": "/portal/coach/notes",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Coach",
          "navn": "Notat-detalj",
          "rute": "/portal/coach/notes/[noteId]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Coach",
          "navn": "Spørsmål til coach",
          "rute": "/portal/coach/sporsmal/[id]",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Coach",
          "navn": "Coach-AI",
          "rute": "/portal/coach/ai",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Meg",
          "navn": "Meg (profil)",
          "rute": "/portal/meg",
          "child": false,
          "key": true,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "ja",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Meg",
          "navn": "Rediger profil",
          "rute": "/portal/meg/profil",
          "child": false,
          "key": true,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "ja",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Meg",
          "navn": "Abonnement",
          "rute": "/portal/meg/abonnement",
          "child": false,
          "key": true,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "ja",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Meg",
          "navn": "Oppgrader",
          "rute": "/portal/meg/abonnement/oppgrader",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Meg",
          "navn": "Oppgrader-flyt",
          "rute": "/portal/meg/abonnement/oppgrader/flyt",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Meg",
          "navn": "Avbestill",
          "rute": "/portal/meg/abonnement/avbestill",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Meg",
          "navn": "Nytt kort",
          "rute": "/portal/meg/abonnement/kort/ny",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Meg",
          "navn": "Faktura-detalj",
          "rute": "/portal/meg/abonnement/faktura/[id]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Meg",
          "navn": "Mine bookinger",
          "rute": "/portal/meg/bookinger",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Meg",
          "navn": "Endre tid",
          "rute": "/portal/meg/bookinger/reschedule/[bookingId]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Meg",
          "navn": "Helse",
          "rute": "/portal/meg/helse",
          "child": false,
          "key": true,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "ja",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Meg",
          "navn": "Nytt symptom",
          "rute": "/portal/meg/helse/symptom/ny",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Meg",
          "navn": "Innstillinger",
          "rute": "/portal/meg/innstillinger",
          "child": false,
          "key": true,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "ja",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Meg",
          "navn": "Varsler",
          "rute": "/portal/meg/innstillinger/varsler",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Meg",
          "navn": "Personvern",
          "rute": "/portal/meg/innstillinger/personvern",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Meg",
          "navn": "Sikkerhet",
          "rute": "/portal/meg/innstillinger/sikkerhet",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Meg",
          "navn": "Språk",
          "rute": "/portal/meg/innstillinger/sprak",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Meg",
          "navn": "Anlegg",
          "rute": "/portal/meg/innstillinger/anlegg",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Meg",
          "navn": "Integrasjoner",
          "rute": "/portal/meg/innstillinger/integrasjoner",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Meg",
          "navn": "Eksport",
          "rute": "/portal/meg/innstillinger/eksport",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Meg",
          "navn": "Økter",
          "rute": "/portal/meg/innstillinger/okter",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Meg",
          "navn": "Sikkerhet",
          "rute": "/portal/meg/sikkerhet",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Meg",
          "navn": "To-faktor (2FA)",
          "rute": "/portal/meg/sikkerhet/2fa",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Meg",
          "navn": "Utstyrsbag",
          "rute": "/portal/meg/utstyrsbag",
          "child": false,
          "key": true,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "ja",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Meg",
          "navn": "Dokumenter",
          "rute": "/portal/meg/dokumenter",
          "child": false,
          "key": true,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "ja",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Meg",
          "navn": "Foreldre (foresatt-info)",
          "rute": "/portal/meg/foreldre",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Meg",
          "navn": "Feedback",
          "rute": "/portal/meg/feedback",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Meg",
          "navn": "Hjelpesenter",
          "rute": "/portal/meg/help",
          "child": false,
          "key": true,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "ja",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Meg",
          "navn": "Hjelp-artikkel",
          "rute": "/portal/meg/help/artikkel/[slug]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Meg",
          "navn": "Hjelp-kategori",
          "rute": "/portal/meg/help/kategori/[slug]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Meg",
          "navn": "Kontakt",
          "rute": "/portal/meg/help/kontakt",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Booking",
          "navn": "Booking-hub",
          "rute": "/portal/booking",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "delvis",
          "haker": {
            "design": "delvis",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "delvis",
            "flyt": "delvis",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Booking",
          "navn": "Ny booking (wizard)",
          "rute": "/portal/booking/ny",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "delvis",
          "haker": {
            "design": "delvis",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "delvis",
            "flyt": "delvis",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Booking",
          "navn": "Ny booking bekreft",
          "rute": "/portal/booking/ny/bekreft",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Booking",
          "navn": "Booking-detalj",
          "rute": "/portal/booking/[bookingId]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Booking",
          "navn": "Coach-profil (booking)",
          "rute": "/portal/booking/coach/[coachId]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Booking",
          "navn": "Anlegg-detalj (booking)",
          "rute": "/portal/booking/anlegg/[anleggId]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Booking",
          "navn": "Bekreftet",
          "rute": "/portal/booking/bekreftet",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Talent",
          "navn": "Talent-hub",
          "rute": "/portal/talent",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Talent",
          "navn": "Min plan",
          "rute": "/portal/talent/min-plan",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Talent",
          "navn": "Mitt nivå",
          "rute": "/portal/talent/mitt-niva",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Talent",
          "navn": "Roadmap",
          "rute": "/portal/talent/roadmap",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Talent",
          "navn": "Sammenligning",
          "rute": "/portal/talent/sammenligning",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Aliaser og hjelpe-ruter",
          "navn": "Stats (alt. → redirect)",
          "rute": "/portal/stats",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "nei",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Aliaser og hjelpe-ruter",
          "navn": "Analyse (alt. → redirect)",
          "rute": "/portal/analyse",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "nei",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Aliaser og hjelpe-ruter",
          "navn": "Reach (oppsøk-verktøy)",
          "rute": "/portal/reach",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Aliaser og hjelpe-ruter",
          "navn": "Agent-pipeline (AI internt)",
          "rute": "/portal/agent-pipeline",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Aliaser og hjelpe-ruter",
          "navn": "Se annen spiller",
          "rute": "/portal/spiller/[spillerId]",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Aliaser og hjelpe-ruter",
          "navn": "Øvelser (alt. → redirect)",
          "rute": "/portal/tren/ovelser",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "nei",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Aliaser og hjelpe-ruter",
          "navn": "Øvelse-detalj (alt. → redirect)",
          "rute": "/portal/tren/ovelser/[id]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "nei",
            "funker": "ja"
          }
        }
      ]
    },
    {
      "id": "agencyos",
      "name": "AgencyOS",
      "icon": "LayoutDashboard",
      "tema": "mørkt",
      "desc": "Coachens kontrolltårn — «hvem trenger MEG i dag?». Adressene begynner med /admin.",
      "screens": [
        {
          "gruppe": "Oversikt",
          "navn": "Cockpit (hjem)",
          "rute": "/admin/agencyos",
          "child": false,
          "key": true,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "nei",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Oversikt",
          "navn": "Uka (kanban)",
          "rute": "/admin/agencyos/uka",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Oversikt",
          "navn": "Spillere (snarvei)",
          "rute": "/admin/agencyos/spillere",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Oversikt",
          "navn": "Økonomi",
          "rute": "/admin/agencyos/okonomi",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Oversikt",
          "navn": "Caddie (AI-chat)",
          "rute": "/admin/agencyos/caddie",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "delvis",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "nei",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Oversikt",
          "navn": "Caddie-aktivitet",
          "rute": "/admin/agencyos/caddie/aktivitet",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Oversikt",
          "navn": "Admin-rot (gml. hjem)",
          "rute": "/admin",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Oversikt",
          "navn": "Daglig AI-brief",
          "rute": "/admin/brief",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Oversikt",
          "navn": "Coaching-board",
          "rute": "/admin/board",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Oversikt",
          "navn": "Oppfølging",
          "rute": "/admin/oppfolging",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Oversikt",
          "navn": "Oppgave-kø",
          "rute": "/admin/queue",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Oversikt",
          "navn": "Innboks",
          "rute": "/admin/innboks",
          "child": false,
          "key": true,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Oversikt",
          "navn": "Meldinger (alt. → redirect)",
          "rute": "/admin/messages",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "nei",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Oversikt",
          "navn": "Kommunikasjon-hub",
          "rute": "/admin/kommunikasjon",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Oversikt",
          "navn": "Reach",
          "rute": "/admin/reach",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Min uke / Workspace",
          "navn": "Workspace-hub",
          "rute": "/admin/workspace",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Min uke / Workspace",
          "navn": "Tildelt meg",
          "rute": "/admin/workspace/tildelt-meg",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "nei",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Min uke / Workspace",
          "navn": "Oppgaver",
          "rute": "/admin/workspace/oppgaver",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "nei",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Min uke / Workspace",
          "navn": "Oppgave-detalj",
          "rute": "/admin/workspace/oppgaver/[id]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Min uke / Workspace",
          "navn": "Prosjekter",
          "rute": "/admin/workspace/prosjekter",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Min uke / Workspace",
          "navn": "Notion-sync",
          "rute": "/admin/workspace/notion",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Stall",
          "navn": "Stall-oversikt",
          "rute": "/admin/stall",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Stall",
          "navn": "Spillere (alle)",
          "rute": "/admin/spillere",
          "child": false,
          "key": true,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "nei",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Stall",
          "navn": "Ny spiller",
          "rute": "/admin/spillere/ny",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Stall",
          "navn": "Spiller-detalj",
          "rute": "/admin/spillere/[id]",
          "child": false,
          "key": true,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "delvis",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Stall",
          "navn": "Profil",
          "rute": "/admin/spillere/[id]/profil",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Stall",
          "navn": "Workbench (coach-i-spiller)",
          "rute": "/admin/spillere/[id]/workbench",
          "child": true,
          "key": true,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Stall",
          "navn": "Plan-detalj",
          "rute": "/admin/spillere/[id]/plan/[planId]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Stall",
          "navn": "Fremgang (trening vs SG)",
          "rute": "/admin/spillere/[id]/fremgang",
          "child": true,
          "key": false,
          "datakoblet": true,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Stall",
          "navn": "Tester",
          "rute": "/admin/spillere/[id]/tester",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Stall",
          "navn": "Tildel test",
          "rute": "/admin/spillere/[id]/tildel-test",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Stall",
          "navn": "Rediger",
          "rute": "/admin/spillere/[id]/rediger",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Stall",
          "navn": "Grupper",
          "rute": "/admin/grupper",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "nei",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Stall",
          "navn": "Gruppe-detalj",
          "rute": "/admin/grupper/[id]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Stall",
          "navn": "Talent-hub",
          "rute": "/admin/talent",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Stall",
          "navn": "Talent-detalj",
          "rute": "/admin/talent/[playerId]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Stall",
          "navn": "Discovery",
          "rute": "/admin/talent/discovery",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Stall",
          "navn": "Radar",
          "rute": "/admin/talent/radar",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "nei",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Stall",
          "navn": "Radar per spiller",
          "rute": "/admin/talent/radar/[playerId]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Stall",
          "navn": "Kohort",
          "rute": "/admin/talent/kohort",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Stall",
          "navn": "Region",
          "rute": "/admin/talent/region",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Stall",
          "navn": "Ressurser",
          "rute": "/admin/talent/ressurser",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Stall",
          "navn": "Sammenligning",
          "rute": "/admin/talent/sammenligning",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "delvis",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Stall",
          "navn": "WAGR-benchmark",
          "rute": "/admin/talent/wagr-benchmark",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Stall",
          "navn": "WAGR-import",
          "rute": "/admin/talent/wagr-import",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "nei",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "Plan-sentral (hub)",
          "rute": "/admin/planlegge",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "Planer (alle)",
          "rute": "/admin/plans",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "nei",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "Ny plan (Plan-bygger)",
          "rute": "/admin/plans/new",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "delvis",
          "haker": {
            "design": "ja",
            "mobil": "nei",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "ja",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "Plan-detalj",
          "rute": "/admin/plans/[planId]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "Maler (alt. → redirect)",
          "rute": "/admin/plans/templates",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "nei",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "Ny mal (alt. → redirect)",
          "rute": "/admin/plans/templates/ny",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "nei",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "Rediger mal (alt. → redirect)",
          "rute": "/admin/plans/templates/[id]/rediger",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "nei",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "Mal-effektivitet (alt. → redirect)",
          "rute": "/admin/plans/templates/[id]/effectiveness",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "nei",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "Plan-maler (alt.)",
          "rute": "/admin/plan-templates",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "nei",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "Plan-mal detalj",
          "rute": "/admin/plan-templates/[id]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "Ny plan-mal",
          "rute": "/admin/plan-templates/ny",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "Rediger plan-mal",
          "rute": "/admin/plan-templates/[id]/rediger",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "Drills (bibliotek)",
          "rute": "/admin/drills",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "delvis",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "Drill-detalj",
          "rute": "/admin/drills/[id]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "Rediger drill",
          "rute": "/admin/drills/[id]/rediger",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "Teknisk plan",
          "rute": "/admin/teknisk-plan",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "Per spiller",
          "rute": "/admin/teknisk-plan/[spillerId]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "Turneringer",
          "rute": "/admin/tournaments",
          "child": false,
          "key": true,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "Turnering-detalj",
          "rute": "/admin/tournaments/[id]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "delvis",
          "haker": {
            "design": "delvis",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "Ny turnering",
          "rute": "/admin/tournaments/ny",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "Dubletter (rydd)",
          "rute": "/admin/tournaments/dubletter",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "Økter",
          "rute": "/admin/okter",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "Videoer",
          "rute": "/admin/videoer",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Planlegge",
          "navn": "Opptak",
          "rute": "/admin/recording",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Gjennomføre",
          "navn": "Daglig drift (hub)",
          "rute": "/admin/gjennomfore",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Gjennomføre",
          "navn": "Økt-detalj",
          "rute": "/admin/gjennomfore/okter/[id]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Gjennomføre",
          "navn": "Kalender",
          "rute": "/admin/kalender",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "nei",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Gjennomføre",
          "navn": "Uke (redirect)",
          "rute": "/admin/kalender/uke",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "nei",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Gjennomføre",
          "navn": "Måned",
          "rute": "/admin/kalender/maned",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Gjennomføre",
          "navn": "Kalender (alt. → redirect)",
          "rute": "/admin/calendar",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "nei",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Gjennomføre",
          "navn": "Måned (alt. → redirect)",
          "rute": "/admin/calendar/maned",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "nei",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Gjennomføre",
          "navn": "Bookinger",
          "rute": "/admin/bookinger",
          "child": false,
          "key": true,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "nei",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Gjennomføre",
          "navn": "Ny booking",
          "rute": "/admin/bookinger/ny",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Gjennomføre",
          "navn": "Anlegg",
          "rute": "/admin/anlegg",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "nei",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Gjennomføre",
          "navn": "Anlegg-detalj",
          "rute": "/admin/anlegg/[id]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Gjennomføre",
          "navn": "Tilgjengelighet",
          "rute": "/admin/availability",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "nei",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Gjennomføre",
          "navn": "Kapasitet",
          "rute": "/admin/kapasitet",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Gjennomføre",
          "navn": "Tjenester/priser",
          "rute": "/admin/services",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "nei",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Gjennomføre",
          "navn": "Fasiliteter (alt.)",
          "rute": "/admin/facilities",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Gjennomføre",
          "navn": "Fasilitet-detalj",
          "rute": "/admin/facilities/[id]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Gjennomføre",
          "navn": "Lokasjoner",
          "rute": "/admin/locations",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Gjennomføre",
          "navn": "TrackMan (på tvers)",
          "rute": "/admin/trackman",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Gjennomføre",
          "navn": "Live-økt: brief (coach)",
          "rute": "/admin/live/[sessionId]/brief",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Gjennomføre",
          "navn": "Live-økt: aktiv (coach)",
          "rute": "/admin/live/[sessionId]/active",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Gjennomføre",
          "navn": "Live-økt: oppsummering (coach)",
          "rute": "/admin/live/[sessionId]/summary",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Gjennomføre",
          "navn": "Coach-workbench (prototype)",
          "rute": "/admin/coach-workbench",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "nei",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Innsikt",
          "navn": "Innsikt-hub",
          "rute": "/admin/analysere",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Innsikt",
          "navn": "Compliance",
          "rute": "/admin/analysere/compliance",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Innsikt",
          "navn": "Stall-analyse",
          "rute": "/admin/analyse",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "delvis",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Innsikt",
          "navn": "Analytics",
          "rute": "/admin/analytics",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Innsikt",
          "navn": "Lag-snitt",
          "rute": "/admin/lag-snitt",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "delvis",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Innsikt",
          "navn": "Fasiter (autosync)",
          "rute": "/admin/tester/benchmarks",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "delvis",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Innsikt",
          "navn": "Tester (på tvers)",
          "rute": "/admin/tester",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Innsikt",
          "navn": "Test-detalj",
          "rute": "/admin/tester/[id]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Innsikt",
          "navn": "Foreslåtte tester",
          "rute": "/admin/tester/foreslatte",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Innsikt",
          "navn": "Tildel test",
          "rute": "/admin/tester/tildel/[spillerId]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Innsikt",
          "navn": "Økt-forespørsler",
          "rute": "/admin/foresporsler",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "nei",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Innsikt",
          "navn": "Godkjenninger",
          "rute": "/admin/godkjenninger",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "nei",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Innsikt",
          "navn": "Godkjenning-detalj",
          "rute": "/admin/godkjenninger/[id]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Innsikt",
          "navn": "Godkjenninger (alt. → redirect)",
          "rute": "/admin/approvals",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "nei",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Innsikt",
          "navn": "Approval-detalj (alt. → redirect)",
          "rute": "/admin/approvals/[id]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "nei",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Innsikt",
          "navn": "Rapporter",
          "rute": "/admin/reports",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "nei",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Innsikt",
          "navn": "Runder (på tvers)",
          "rute": "/admin/runder",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Innsikt",
          "navn": "Skader/sykdom (tilstander)",
          "rute": "/admin/tilstander",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Innsikt",
          "navn": "Finans (alt. → redirect)",
          "rute": "/admin/finance",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "nei",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Innsikt",
          "navn": "Økonomi (MRR/betalinger)",
          "rute": "/admin/okonomi",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "delvis",
          "haker": {
            "design": "delvis",
            "mobil": "nei",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "ja",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Innsikt",
          "navn": "Stats-oversikt",
          "rute": "/admin/stats/overview",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Innsikt",
          "navn": "Stats-moderering",
          "rute": "/admin/stats/moderering",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Admin",
          "navn": "Organisasjon-hub",
          "rute": "/admin/organisasjon",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Admin",
          "navn": "Klubb-innstillinger",
          "rute": "/admin/klubb/innstillinger",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Admin",
          "navn": "Integrasjoner",
          "rute": "/admin/integrasjoner",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Admin",
          "navn": "Innstillinger",
          "rute": "/admin/settings",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "nei",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Admin",
          "navn": "API",
          "rute": "/admin/settings/api",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Admin",
          "navn": "Kalender",
          "rute": "/admin/settings/calendar",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Admin",
          "navn": "Sikkerhet",
          "rute": "/admin/settings/security",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Admin",
          "navn": "Tilgang",
          "rute": "/admin/settings/tilgang",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Admin",
          "navn": "Team",
          "rute": "/admin/team",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Admin",
          "navn": "Inviter",
          "rute": "/admin/team/inviter",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Admin",
          "navn": "Audit-log",
          "rute": "/admin/audit-log",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Admin",
          "navn": "Audit-detalj",
          "rute": "/admin/audit-log/[id]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Admin",
          "navn": "AI-agenter",
          "rute": "/admin/agents",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Admin",
          "navn": "Agent-detalj",
          "rute": "/admin/agents/[agentId]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Admin",
          "navn": "E-postmaler",
          "rute": "/admin/email-templates",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Admin",
          "navn": "Rediger e-postmal",
          "rute": "/admin/email-templates/[id]/rediger",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Admin",
          "navn": "Profil",
          "rute": "/admin/profile",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Admin",
          "navn": "Hjelp",
          "rute": "/admin/hjelp",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Admin",
          "navn": "Caddie (alt. adresse)",
          "rute": "/admin/caddie",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Admin",
          "navn": "Design-godkjenning",
          "rute": "/admin/godkjenn-portal",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Admin",
          "navn": "Koblinger",
          "rute": "/admin/godkjenn-portal/koblinger",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Admin",
          "navn": "Kobling-detalj",
          "rute": "/admin/godkjenn-portal/koblinger/[id]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Admin",
          "navn": "Review",
          "rute": "/admin/godkjenn-portal/review",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        }
      ]
    },
    {
      "id": "auth",
      "name": "Auth",
      "icon": "LogIn",
      "tema": "lyst",
      "desc": "Innlogging og oppstart — login, registrering, BankID, onboarding, samtykke.",
      "screens": [
        {
          "gruppe": "Auth",
          "navn": "Logg inn",
          "rute": "/auth/login",
          "child": false,
          "key": true,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "ja",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Auth",
          "navn": "Registrer",
          "rute": "/auth/signup",
          "child": false,
          "key": true,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "ja",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Auth",
          "navn": "Glemt passord",
          "rute": "/auth/forgot-password",
          "child": false,
          "key": true,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "ja",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Auth",
          "navn": "Tilbakestill passord",
          "rute": "/auth/reset-password",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Auth",
          "navn": "Sjekk e-post",
          "rute": "/auth/check-email",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Auth",
          "navn": "BankID",
          "rute": "/auth/bankid",
          "child": false,
          "key": true,
          "datakoblet": false,
          "status": "ferdig",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "ja",
            "adresse": "ja",
            "flyt": "ja",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Auth",
          "navn": "Onboarding (spiller, 8 steg)",
          "rute": "/auth/onboarding",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "delvis",
          "haker": {
            "design": "delvis",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "delvis",
            "flyt": "delvis",
            "data": "nei",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Auth",
          "navn": "Onboarding (forelder)",
          "rute": "/auth/onboarding/forelder",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Auth",
          "navn": "Foreldresamtykke (token)",
          "rute": "/auth/guardian-consent/[token]",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Auth",
          "navn": "Samtykke venter",
          "rute": "/auth/samtykke-venter",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Auth",
          "navn": "Logget ut",
          "rute": "/auth/logget-ut",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "delvis",
          "haker": {
            "design": "delvis",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "nei",
            "funker": "ja"
          }
        }
      ]
    },
    {
      "id": "forelder",
      "name": "Forelder",
      "icon": "Users",
      "tema": "lyst",
      "desc": "Foreldreportalen — foresatt følger barnets utvikling, bookinger og økonomi.",
      "screens": [
        {
          "gruppe": "Forelder",
          "navn": "Forelder-hjem",
          "rute": "/forelder",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "delvis",
          "haker": {
            "design": "delvis",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "nei",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Forelder",
          "navn": "Barn (oversikt)",
          "rute": "/forelder/barn",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "delvis",
          "haker": {
            "design": "delvis",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Forelder",
          "navn": "Barn-detalj",
          "rute": "/forelder/barn/[childId]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "delvis",
          "haker": {
            "design": "delvis",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "nei",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Forelder",
          "navn": "Bookinger",
          "rute": "/forelder/bookinger",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Forelder",
          "navn": "Coach",
          "rute": "/forelder/coach",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Forelder",
          "navn": "Fakturaer",
          "rute": "/forelder/fakturaer",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Forelder",
          "navn": "Økonomi",
          "rute": "/forelder/okonomi",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Forelder",
          "navn": "Samtykke",
          "rute": "/forelder/samtykke",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Forelder",
          "navn": "Ukerapport",
          "rute": "/forelder/ukerapport",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Forelder",
          "navn": "Innstillinger",
          "rute": "/forelder/innstillinger",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Forelder",
          "navn": "Varsler",
          "rute": "/forelder/varsler",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Forelder",
          "navn": "Inviter forelder (token)",
          "rute": "/inviter/forelder/[token]",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        }
      ]
    },
    {
      "id": "marketing",
      "name": "Marketing (akgolf.no)",
      "icon": "Globe",
      "tema": "lyst",
      "desc": "Offentlige sider + det store offentlige stats-universet.",
      "screens": [
        {
          "gruppe": "Marketing",
          "navn": "Forside",
          "rute": "/(marketing)",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "delvis",
          "haker": {
            "design": "ja",
            "mobil": "ja",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "delvis",
            "flyt": "delvis",
            "data": "nei",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Marketing",
          "navn": "Anlegg",
          "rute": "/(marketing)/anlegg",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Marketing",
          "navn": "Anlegg-detalj",
          "rute": "/(marketing)/anlegg/[slug]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Marketing",
          "navn": "Blogg",
          "rute": "/(marketing)/blogg",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Marketing",
          "navn": "Blogg-innlegg",
          "rute": "/(marketing)/blogg/[slug]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Marketing",
          "navn": "Booking",
          "rute": "/(marketing)/booking",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Marketing",
          "navn": "Booking-tjeneste",
          "rute": "/(marketing)/booking/[slug]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Marketing",
          "navn": "Booking bekreft",
          "rute": "/(marketing)/booking/[slug]/bekreft",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Marketing",
          "navn": "Booking kvittering",
          "rute": "/(marketing)/booking/kvittering/[bookingId]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "delvis"
          }
        },
        {
          "gruppe": "Marketing",
          "navn": "Cases",
          "rute": "/(marketing)/cases",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Marketing",
          "navn": "Coacher",
          "rute": "/(marketing)/coacher",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Marketing",
          "navn": "Coach-profil",
          "rute": "/(marketing)/coacher/[slug]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Marketing",
          "navn": "Coaching",
          "rute": "/(marketing)/coaching",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Marketing",
          "navn": "Junior",
          "rute": "/(marketing)/junior",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Marketing",
          "navn": "Priser",
          "rute": "/(marketing)/priser",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Marketing",
          "navn": "PlayerHQ (salgsside)",
          "rute": "/(marketing)/playerhq",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Marketing",
          "navn": "Om oss",
          "rute": "/(marketing)/om-oss",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Marketing",
          "navn": "Kontakt",
          "rute": "/(marketing)/kontakt",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Marketing",
          "navn": "Jobb",
          "rute": "/(marketing)/jobb",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Marketing",
          "navn": "FAQ",
          "rute": "/(marketing)/faq",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Marketing",
          "navn": "Suksess",
          "rute": "/(marketing)/suksess",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Marketing",
          "navn": "Treningsfilosofi",
          "rute": "/(marketing)/treningsfilosofi",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Marketing",
          "navn": "Turneringer",
          "rute": "/(marketing)/turneringer",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Marketing",
          "navn": "Turnering-detalj",
          "rute": "/(marketing)/turneringer/[slug]",
          "child": true,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Marketing",
          "navn": "Cookies",
          "rute": "/(marketing)/cookies",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Marketing",
          "navn": "Personvern",
          "rute": "/(marketing)/personvern",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Marketing",
          "navn": "Vilkår",
          "rute": "/(marketing)/vilkar",
          "child": false,
          "key": false,
          "datakoblet": false,
          "status": "planlagt",
          "haker": {
            "design": "nei",
            "mobil": "nei",
            "desktop": "nei",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "delvis",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Stats (offentlig)",
          "navn": "Stats-forside + uka + 2026",
          "rute": "/(marketing)/stats · /stats/uka · /stats/2026",
          "child": false,
          "key": false,
          "datakoblet": true,
          "status": "delvis",
          "haker": {
            "design": "nei",
            "mobil": "delvis",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Stats (offentlig)",
          "navn": "Spillere + årgang",
          "rute": "/(marketing)/stats/spillere(/[slug]) · /stats/aargang(/[aar])",
          "child": false,
          "key": false,
          "datakoblet": true,
          "status": "delvis",
          "haker": {
            "design": "nei",
            "mobil": "delvis",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Stats (offentlig)",
          "navn": "Baner + klubber + regioner",
          "rute": "/(marketing)/stats/baner · /klubber · /regions",
          "child": false,
          "key": false,
          "datakoblet": true,
          "status": "delvis",
          "haker": {
            "design": "nei",
            "mobil": "delvis",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Stats (offentlig)",
          "navn": "Turneringer (offentlig)",
          "rute": "/(marketing)/stats/turneringer · /tour/[slug]",
          "child": false,
          "key": false,
          "datakoblet": true,
          "status": "delvis",
          "haker": {
            "design": "nei",
            "mobil": "delvis",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Stats (offentlig)",
          "navn": "Leaderboards + norske + PGA",
          "rute": "/(marketing)/stats/leaderboards · /norske · /pga (+ 9 undersider)",
          "child": false,
          "key": false,
          "datakoblet": true,
          "status": "delvis",
          "haker": {
            "design": "nei",
            "mobil": "delvis",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Stats (offentlig)",
          "navn": "Verktøy (kalkulatorer)",
          "rute": "/(marketing)/stats/verktoy (+ 5 kalkulatorer)",
          "child": false,
          "key": false,
          "datakoblet": true,
          "status": "delvis",
          "haker": {
            "design": "nei",
            "mobil": "delvis",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Stats (offentlig)",
          "navn": "Sammenlign + SG-sammenlign",
          "rute": "/(marketing)/stats/sammenlign-spillere · /sg-sammenlign",
          "child": false,
          "key": false,
          "datakoblet": true,
          "status": "delvis",
          "haker": {
            "design": "nei",
            "mobil": "delvis",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "ja",
            "funker": "ja"
          }
        },
        {
          "gruppe": "Stats (offentlig)",
          "navn": "Blogg + søk + quiz + wrapped",
          "rute": "/(marketing)/stats/blogg · /sok · /quiz · /wrapped · /min-progresjon",
          "child": false,
          "key": false,
          "datakoblet": true,
          "status": "delvis",
          "haker": {
            "design": "nei",
            "mobil": "delvis",
            "desktop": "ja",
            "ipad": "nei",
            "adresse": "ja",
            "flyt": "delvis",
            "data": "ja",
            "funker": "ja"
          }
        }
      ]
    },
    {
      "id": "system",
      "name": "System & internt",
      "icon": "Settings2",
      "tema": "lyst",
      "desc": "Tverrgående/interne flater — ikke vanlige brukerskjermer.",
      "screens": [
        {
          "gruppe": "System & internt",
          "navn": "Offline-side",
          "rute": "/offline",
          "note": "Vises uten nett. Funker. Ingen v10-design nødvendig.",
          "status": "system"
        },
        {
          "gruppe": "System & internt",
          "navn": "404 (ikke funnet)",
          "rute": "(system)",
          "note": "Nytt v10-design i forhåndsvisning (mx-404.png). Ikke koblet til ekte side.",
          "status": "system"
        },
        {
          "gruppe": "System & internt",
          "navn": "Onboard coach",
          "rute": "/onboard/coach",
          "note": "4-stegs coach-oppstart. Ingen v10-design.",
          "status": "system"
        },
        {
          "gruppe": "System & internt",
          "navn": "Onboard klubb",
          "rute": "/onboard/klubb",
          "note": "5-stegs klubb-oppstart. Ingen v10-design.",
          "status": "system"
        },
        {
          "gruppe": "System & internt",
          "navn": "Design-system (internt)",
          "rute": "/(internal)/design-system · /design-system-v2",
          "note": "Utviklerverktøy, ikke brukerskjerm.",
          "status": "system"
        },
        {
          "gruppe": "System & internt",
          "navn": "Demoer (internt)",
          "rute": "/(internal)/demos/* · /intern/komponenter/* (~29 stk)",
          "note": "Test-/demo-sider. Bør ryddes før lansering.",
          "status": "system"
        }
      ]
    },
    {
      "id": "dropoff",
      "name": "Tegnet, ikke brukt (drop-off)",
      "icon": "AlertTriangle",
      "tema": "lyst",
      "desc": "Ferdig tegnet av Claude Design, men ennå ikke koblet som ekte skjerm. Mål: tom liste.",
      "screens": [
        {
          "gruppe": "Tegnet, ikke brukt",
          "navn": "404-side (mx-404.png)",
          "rute": "Appens «ikke funnet»-side",
          "status": "droppoff"
        },
        {
          "gruppe": "Tegnet, ikke brukt",
          "navn": "Onboarding (pl-onboarding.png)",
          "rute": "/auth/onboarding",
          "status": "droppoff"
        },
        {
          "gruppe": "Tegnet, ikke brukt",
          "navn": "Forelder-info (pl-forelder.png)",
          "rute": "/portal/meg/foreldre",
          "status": "droppoff"
        },
        {
          "gruppe": "Tegnet, ikke brukt",
          "navn": "Varsler (pl-varsler.png)",
          "rute": "/portal/varsler",
          "status": "droppoff"
        },
        {
          "gruppe": "Tegnet, ikke brukt",
          "navn": "Innstillinger (pl-innstillinger.png)",
          "rute": "/portal/meg/innstillinger",
          "status": "droppoff"
        },
        {
          "gruppe": "Tegnet, ikke brukt",
          "navn": "TrackMan (pl-trackman.png)",
          "rute": "/portal/mal/trackman",
          "status": "droppoff"
        },
        {
          "gruppe": "Tegnet, ikke brukt",
          "navn": "Turnering (pl-turnering.png)",
          "rute": "/portal/tren/turneringer",
          "status": "droppoff"
        },
        {
          "gruppe": "Tegnet, ikke brukt",
          "navn": "Forelder ser barn (fo-barn.png)",
          "rute": "/forelder/barn",
          "status": "droppoff"
        },
        {
          "gruppe": "Tegnet, ikke brukt",
          "navn": "Coach AI-chat (ag-caddie.png)",
          "rute": "/admin/agencyos/caddie",
          "status": "droppoff"
        },
        {
          "gruppe": "Tegnet, ikke brukt",
          "navn": "Sammenlign spillere (ag-compare.png)",
          "rute": "/admin/talent/sammenligning",
          "status": "droppoff"
        },
        {
          "gruppe": "Tegnet, ikke brukt",
          "navn": "Compliance (ag-compliance.png)",
          "rute": "/admin/analysere/compliance",
          "status": "droppoff"
        },
        {
          "gruppe": "Tegnet, ikke brukt",
          "navn": "Drift/anlegg (ag-drift.png)",
          "rute": "/admin/anlegg",
          "status": "droppoff"
        },
        {
          "gruppe": "Tegnet, ikke brukt",
          "navn": "Kalender (ag-kalender.png)",
          "rute": "/admin/kalender",
          "status": "droppoff"
        },
        {
          "gruppe": "Tegnet, ikke brukt",
          "navn": "Tester (ag-tester.png)",
          "rute": "/admin/tester",
          "status": "droppoff"
        },
        {
          "gruppe": "Tegnet, ikke brukt",
          "navn": "Marketing-forside (mk-forside.png)",
          "rute": "/(marketing)",
          "status": "droppoff"
        },
        {
          "gruppe": "Tegnet, ikke brukt",
          "navn": "Coach på mobil (components-coach-mobile.html)",
          "rute": "Mobil-utgave AgencyOS — ikke bygget",
          "status": "droppoff"
        },
        {
          "gruppe": "Tegnet, ikke brukt",
          "navn": "Elite: Dispersion/Utslag-spredning",
          "rute": "/portal/statistikk/shot-map (Elite Fase 2 — parkert)",
          "status": "droppoff"
        }
      ]
    },
    {
      "id": "mangler",
      "name": "Mangler helt",
      "icon": "CircleSlash",
      "tema": "lyst",
      "desc": "Skjermer/funksjoner planen krever, men som ikke kan bygges ennå (data-blokkert eller trenger design).",
      "screens": [
        {
          "gruppe": "Mangler helt",
          "navn": "Shot-map / spredningsplott",
          "rute": "/portal/statistikk/shot-map",
          "note": "Data-blokkert: mangler punkt-koordinater per slag.",
          "status": "mangler"
        },
        {
          "gruppe": "Mangler helt",
          "navn": "Scorekort hull-for-hull",
          "rute": "/portal/tren/turneringer/[id]/runde/[nr]",
          "note": "Data-blokkert: Round har bare totalscore.",
          "status": "mangler"
        },
        {
          "gruppe": "Mangler helt",
          "navn": "Live turnerings-tracking",
          "rute": "/portal/tren/turneringer/[id]/live",
          "note": "Data-blokkert: live-scoring-dataflyt mangler.",
          "status": "mangler"
        },
        {
          "gruppe": "Mangler helt",
          "navn": "Fellesmelding til turneringsdeltakere",
          "rute": "(AgencyOS)",
          "note": "Trenger design: velg deltakere → skriv → send.",
          "status": "mangler"
        },
        {
          "gruppe": "Mangler helt",
          "navn": "Spiller↔gruppe-veksler (player-picker)",
          "rute": "(AgencyOS topbar)",
          "note": "Trenger design.",
          "status": "mangler"
        },
        {
          "gruppe": "Mangler helt",
          "navn": "Fokus-spiller-blokk (pin + AI-forslag)",
          "rute": "/admin/agencyos",
          "note": "Delvis bygget; pin + AI-felt ikke ferdig designet.",
          "status": "mangler"
        },
        {
          "gruppe": "Mangler helt",
          "navn": "Mobil-utgave Workbench + AgencyOS",
          "rute": "(desktop-først)",
          "note": "Mobil-varianter ikke tegnet. Spørsmål: trengs før lansering?",
          "status": "mangler"
        }
      ]
    }
  ]
};
