// Eksporterer alle Skills slik at agenter kan plukke ut det de trenger.
//
// En "Skill" er en navngitt kunnskapsblokk som injiseres i system-prompt.
// Agenter importerer eksplisitt de skillene de trenger — det finnes ingen
// «alle skills»-samling lenger (fjernet i forenkling bølge 3: den dyttet
// hele kunnskapsbasen inn i prompter som ikke trengte den).
// Ny Skill: 1) opprett fil i skills/, 2) legg til export her.

export { pyramideSkill } from "./pyramide-taksonomi";
export { bompaSkill } from "./bompa-perioder";
export { sgInterpretationSkill } from "./sg-interpretation";
