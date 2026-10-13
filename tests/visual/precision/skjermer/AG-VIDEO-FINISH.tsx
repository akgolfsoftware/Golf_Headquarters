/** Faktiske mediekomponenter; syntetiske data og ingen lagringshandlinger. */
import type { ReactNode } from "react";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { CoachContent } from "@/components/admin/precision/agency-completion/CoachContent";
import { CoachingVideoManager, type CoachingVideoData } from "@/components/admin/precision/agency-completion/CoachingVideoManager";
import { AG18TrackManVideo } from "@/components/admin/precision/AG18TrackManVideo";
export const sti = "/admin/videoer";
function Vis({ children }: { children: ReactNode }) { return <AdminRolleProvider erAdmin><AgencyOSSkall navn="Testcoach"><CoachContent>{children}</CoachContent></AgencyOSSkall></AdminRolleProvider>; }
const base: CoachingVideoData = { players: [{id:"syntetisk-spiller",name:"Testspiller"}], bookings: [], videos: [], total:0, page:1, pageSize:50, initialPlayerId:"syntetisk-spiller" };
const row = {id:"syntetisk-video",title:"Startlinje og balltreff",playerId:"syntetisk-spiller",playerName:"Testspiller",coachName:"Testcoach",createdLabel:"13. oktober 2026",sizeLabel:"12 MB",tag:"TEK",notes:"Syntetisk skjermgrunnlag",status:"READY",canConfirm:false,canDelete:true};
export const tilstander = {
  tom: <Vis><CoachingVideoManager data={base} /></Vis>,
  data: <Vis><CoachingVideoManager data={{...base,total:2,videos:[row,{...row,id:"syntetisk-uavklart",title:"Opplasting avventer kontroll",status:"PROCESSING",canConfirm:true,canDelete:false}]}} /></Vis>,
  ingenSpillere: <Vis><CoachingVideoManager data={{...base,players:[],initialPlayerId:""}} /></Vis>,
  opptak: <Vis><AG18TrackManVideo startFane="opptak" /></Vis>,
};
