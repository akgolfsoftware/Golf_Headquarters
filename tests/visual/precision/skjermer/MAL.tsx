import { RullUtMalPanel } from "@/components/admin/v2/RullUtMalPanel";
import { GruppeMalPublisering } from "@/components/admin/v2/GruppeMalPublisering";
import "@/styles/precision-komponenter.css";
import "@/styles/precision-athletics.css";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
export const sti = "/admin/plan-templates/syntetisk/rull-ut";
const maler=[{id:"syntetisk-mal",name:"Syntetisk treningsprogram",varighetUker:3,sessionCount:12}];
export const tilstander={
  valg:<AgencyOSSkall navn="Syntetisk coach"><RullUtMalPanel grupper={[{id:"syntetisk-gruppe",name:"Syntetisk treningsgruppe"}]} maler={maler} initialTemplateId="syntetisk-mal" /></AgencyOSSkall>,
  lagret:<AgencyOSSkall navn="Syntetisk coach"><GruppeMalPublisering groupId="syntetisk-gruppe" rows={[{id:"syntetisk-utkast",title:"Syntetisk chipøkt",date:"2099-01-05",startMinute:480,durationMinutes:45,status:"DRAFT"},{id:"syntetisk-publisert",title:"Syntetisk fysisk økt",date:"2099-01-06",startMinute:480,durationMinutes:60,status:"PUBLISHED"}]} /></AgencyOSSkall>,
};
