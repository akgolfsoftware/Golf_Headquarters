let meta = #{
    name: "skjerm-mot-fasit",
    description: "Porter én Train-lock-skjerm: les fasit, bygg, skeptiker, stopp for Anders ser",
    when_to_use: "Én PlayerHQ/AgencyOS-skjerm skal porteres eller signeres mot Train-lock",
    phases: [
        #{ title: "Fasit", detail: "les tegningen og koden" },
        #{ title: "Bygg", detail: "én implementer i isolert gren" },
        #{ title: "Sjekk", detail: "skeptiker mot fasit og tester" },
    ],
};

let brief_schema = #{
    "type": "object",
    "required": ["fasit_fil", "rute", "finnes_i_kode", "avvik"],
    "properties": #{
        "fasit_fil": #{ "type": "string" },
        "rute": #{ "type": "string" },
        "finnes_i_kode": #{ "type": "boolean" },
        "avvik": #{ "type": "string" },
    },
};

let build_schema = #{
    "type": "object",
    "required": ["branch", "files", "tests", "ok"],
    "properties": #{
        "branch": #{ "type": "string" },
        "files": #{ "type": "string" },
        "tests": #{ "type": "string" },
        "ok": #{ "type": "boolean" },
        "blockers": #{ "type": "string" },
    },
};

let skeptic_schema = #{
    "type": "object",
    "required": ["pass", "reason"],
    "properties": #{
        "pass": #{ "type": "boolean" },
        "reason": #{ "type": "string" },
    },
};

let skjerm = if args == () { () } else { args.skjerm };
if skjerm == () {
    pause("verification", "Pass args.skjerm — f.eks. PH-07, PH-04, AX-01.");
}

phase("Fasit");
let fasit_prompt = "Les AGENTS.md og designsystem/README.md først. Følg siste beslutning om denne flaten. ";
fasit_prompt += "Les Train-lock-fasiten for skjermen " + skjerm + ". ";
fasit_prompt += "Bruk read_file og grep. Ikke svar fra hukommelsen. ";
fasit_prompt += "1) Les designsystem/train-lock/SCREEN-INDEX.md og finn fila. ";
fasit_prompt += "2) Les selve .dc.html-fila. 3) Finn hvilken rute og komponent i src/ som porterer den. ";
fasit_prompt += "Tokens: kun --tl-* / TL. Ingen Paper. Returner fasit_fil, rute, finnes_i_kode, avvik.";
let brief = agent(fasit_prompt, #{
    label: "fasit:" + skjerm,
    capability_mode: "read-only",
    output_schema: brief_schema,
});
if brief == () || !brief.success || brief.output.fasit_fil == () {
    complete(#{ ok: false, summary: "Fasit-lesing feilet for " + skjerm });
}

phase("Bygg");
let build_prompt = "";
build_prompt += "Porter skjermen " + skjerm + " mot fasit " + brief.output.fasit_fil + ". ";
build_prompt += "Rute: " + brief.output.rute + ". Kjente avvik: " + brief.output.avvik + ". ";
build_prompt += "Gren fra origin/main, aldri main. TDD der det er href/status-logikk. ";
build_prompt += "Filhode: Fasit: + Rigg: eller Avvik: (PORTING.md §0b). ";
build_prompt += "Kun --tl-* / TL. Norsk bokmål. Ingen emoji. Ikke merge. ";
build_prompt += "Kjør tsc + berørte tester. Push gren og åpne PR. Returner branch, files, tests, ok.";
let built = agent(build_prompt, #{
    label: "bygg:" + skjerm,
    capability_mode: "all",
    isolation_worktree: true,
    output_schema: build_schema,
});
if built == () || !built.success || built.output.ok != true {
    let why = "ukjent";
    if built != () && built.output != () && built.output.blockers != () {
        why = built.output.blockers;
    }
    complete(#{ ok: false, summary: "Bygg feilet: " + why });
}

phase("Sjekk");
let sk_prompt = "";
sk_prompt += "Skeptiker: les diffen på grenen " + built.output.branch + " mot origin/main. ";
sk_prompt += "Bruk git diff og les de endrede filene. Fasit er " + brief.output.fasit_fil + ". ";
sk_prompt += "pass=true bare hvis (1) tokens er --tl-*/TL, (2) filhode har Rigg eller Avvik, ";
sk_prompt += "(3) ingen Paper, (4) tester i rapporten er grønne. Ellers pass=false med reason.";
let sk = agent(sk_prompt, #{
    label: "sjekk:" + skjerm,
    capability_mode: "read-only",
    output_schema: skeptic_schema,
});
let pass = sk != () && sk.success && sk.output.pass == true;
if !pass {
    let reason = "skeptiker avviste";
    if sk != () && sk.output != () && sk.output.reason != () { reason = sk.output.reason; }
    complete(#{ ok: false, summary: reason, branch: built.output.branch });
}

await_user("user", "Skjerm " + skjerm + " er bygget på " + built.output.branch + ". Se 390/1280 lys+mørk, så merge.");
complete(#{
    ok: true,
    skjerm: skjerm,
    branch: built.output.branch,
    fasit: brief.output.fasit_fil,
    summary: skjerm + " klar for Anders å se",
});
