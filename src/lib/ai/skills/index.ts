// Eksporterer alle Skills slik at agenter kan plukke ut det de trenger.
//
// En "Skill" er en navngitt kunnskapsblokk som injiseres i system-prompt.
// Når du legger til ny Skill: 1) opprett fil i skills/, 2) legg til export
// her, 3) ta med i ALL_SKILLS hvis den skal være tilgjengelig globalt.

export { pyramideSkill } from "./pyramide-taksonomi";
export { bompaSkill } from "./bompa-perioder";
export { sgInterpretationSkill } from "./sg-interpretation";

import { pyramideSkill } from "./pyramide-taksonomi";
import { bompaSkill } from "./bompa-perioder";
import { sgInterpretationSkill } from "./sg-interpretation";

export type Skill = {
  readonly name: string;
  readonly description: string;
  readonly knowledge: string;
  readonly examples?: ReadonlyArray<{
    readonly input: string;
    readonly output: string;
  }>;
};

export const ALL_SKILLS: ReadonlyArray<Skill> = [
  pyramideSkill,
  bompaSkill,
  sgInterpretationSkill,
];
