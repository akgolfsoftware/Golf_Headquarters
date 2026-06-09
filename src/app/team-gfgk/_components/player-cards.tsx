interface PlayerCard {
  initials: string;
  score: string;
  focus: string;
  level: number;
  group: number;
  next: string;
}

const C = ["var(--pyr-fys)", "var(--pyr-tek)", "var(--pyr-slag)", "var(--pyr-spill)", "var(--pyr-turn)"];

const players: PlayerCard[] = [
  { initials: "M.R.", score: "74,0", focus: "SPILL / TURN", level: 5, group: 0, next: "Finpusse spillet og trene konkurranse. Holde roen under press." },
  { initials: "S.H.", score: "74,3", focus: "SPILL / TURN", level: 5, group: 0, next: "Spille flere turneringer og bli skarpere når det gjelder å score." },
  { initials: "F.H.", score: "77,8", focus: "SPILL / TURN", level: 5, group: 0, next: "Score lavere i turnering — få godt spill til å gi resultater når det teller." },
  { initials: "A.R.", score: "78,8", focus: "SLAG / SPILL", level: 4, group: 1, next: "Treffe riktig lengde og velge smart — sette slagene sammen til lavere runder." },
  { initials: "V.H.", score: "79,4", focus: "SLAG / SPILL", level: 4, group: 1, next: "Mer presise innspill, og smartere valg gjennom 18 hull." },
  { initials: "J.H.", score: "83,1", focus: "TEK / SLAG", level: 3, group: 1, next: "Få teknikken stabil, så slagene tåler mer fart og press." },
  { initials: "F.S.", score: "86,0", focus: "TEK / SLAG", level: 3, group: 1, next: "Bygge teknikk og slagkvalitet — jevnere treff og riktig lengde." },
  { initials: "A.L.", score: "88,4", focus: "TEK / FYS", level: 2, group: 2, next: "Bygge teknisk grunnmur — en stabil sving og trygt treff." },
  { initials: "C.H.", score: "89,8", focus: "TEK / FYS", level: 2, group: 2, next: "Grunnslag og putting. Mye trening og gode gjentakelser." },
  { initials: "S.S.", score: "104,2", focus: "FYS / TEK", level: 1, group: 2, next: "Grunnmur først: god bevegelse og trygg teknikk. Glede og mestring." },
];

const groups = [
  { title: "Øvre fokus", meta: "SPILL · TURN · finpuss og konkurranse" },
  { title: "Midtre fokus", meta: "SLAG · SPILL · bygge slagkvalitet og scoring" },
  { title: "Grunnmur", meta: "FYS · TEK · teknisk og fysisk fundament" },
];

function MiniPyr({ level }: { level: number }) {
  return (
    <span className="mini-pyr">
      {[0, 1, 2, 3, 4].map((i) => (
        <i
          key={i}
          style={{
            height: 6 + i * 3,
            background: i < level ? C[i] : "var(--cream-300)",
          }}
        />
      ))}
    </span>
  );
}

export function PlayerCards() {
  return (
    <div className="groups">
      {groups.map((g, gi) => (
        <div key={gi}>
          <div className="group-band" style={{ marginTop: gi === 0 ? 0 : 16 }}>
            <span className="gtitle">{g.title}</span>
            <span className="gmeta">{g.meta}</span>
            <span className="gline" />
          </div>
          <div className="grid g-3">
            {players
              .filter((p) => p.group === gi)
              .map((p) => (
                <div className="pcard" key={p.initials}>
                  <div className="top">
                    <span className="initials">{p.initials}</span>
                    <span className="score">
                      <div className="v">{p.score}</div>
                      <div className="k">Snitt score · 18</div>
                    </span>
                  </div>
                  <div className="focus-row">
                    <MiniPyr level={p.level} />
                    <span className="focus-tag">{p.focus}</span>
                  </div>
                  <div className="next">
                    <b>Neste steg:</b> {p.next}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
