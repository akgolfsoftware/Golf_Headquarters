import { AgencyOSSkall } from '@/components/precision/AgencyOSSkall';
import { InternalDataGolfWorkspace, type InternalDataGolfData } from '@/components/datagolf/InternalDataGolfWorkspace';
import { DG_VIEWS } from '@/lib/datagolf/analysis-views';
const profile = { dgId:1, name:'Syntetisk Referanse', country:'NO', asOf:'2026-10-01T08:00:00.000Z', total:0, ott:0.2, app:null, arg:-0.2, putt:0, distance:null, accuracy:null };
const data: InternalDataGolfData = { proffer:[profile,{...profile,dgId:2,name:'Syntetisk Referanse To'}], proff:profile, mot:null, valg:{pro:1,mot:null,runder:24}, proffRunder:[{eventId:'syntetisk-event',eventName:'Syntetisk turnering',date:'2026-09-25T00:00:00.000Z',tour:'pga',round:1,courseId:7,score:72,toPar:0,position:null,madeCut:null,total:0,ott:0.2,app:null,arg:-0.2,putt:0,distance:null,accuracy:null,gir:null,importedAt:'2026-10-01T08:00:00.000Z'}], motRunder:[], approach:null,kildestatus:{profiler:'tilgjengelig',proffRunder:'tilgjengelig',motRunder:null,egneDgRunder:null}, brukerTakReserve:false,kildefeil:false };
const View = (d:InternalDataGolfData,id:typeof DG_VIEWS[number][0]) => <AgencyOSSkall navn="Syntetisk analytiker"><InternalDataGolfWorkspace data={d} view={id}/></AgencyOSSkall>;
export const sti = '/portal/analysere/datagolf';
export const tilstander = Object.fromEntries([...DG_VIEWS.map(([id])=>[id,View(data,id)]),['tom',View({...data,proffer:[],proff:null,proffRunder:[],kildestatus:{...data.kildestatus,profiler:'tom',proffRunder:null}},'DG-01')],['feil',View({...data,proffer:[],proff:null,proffRunder:[],kildestatus:{...data.kildestatus,profiler:'feil',proffRunder:null},kildefeil:true},'DG-01')]]);
export const natt: string[] = [];
