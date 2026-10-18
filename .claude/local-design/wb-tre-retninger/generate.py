from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
from datetime import date

OUT = Path('/Users/anderskristiansen/Documents/Claude/akgolf-hq/workbench-tre-design')
INK='#141413'; MUT='#686560'; LINE='#ddd9d1'; BG='#e6e3dd'; FLAT='#faf8f3'
AX=['#788C5D','#B8852A','#2563EB','#C46686','#A32D2D']
def font(s=18,b=False):
    return ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial'+(' Bold' if b else '')+'.ttf',s)
def text(x,y,t,s=18,b=False,c=INK): d.text((x,y),t,font=font(s,b),fill=c)
def box(x,y,w,h,fill='white',outline=LINE,r=8): d.rounded_rectangle((x,y,x+w,y+h),radius=r,fill=fill,outline=outline,width=1)
def line(x,y,w): d.line((x,y,x+w,y), fill=LINE,width=1)
def button(x,y,t,w=118,primary=False):
    box(x,y,w,38,INK if primary else 'white');text(x+12,y+9,t,16,True,'white' if primary else INK)
def tag(x,y,t,w): box(x,y,w,28,FLAT);text(x+9,y+5,t,14)
def title(x,y,k,t): text(x,y,k,13,True,MUT);text(x,y+24,t,25,True)
def session(x,y,w,t,meta,axis=0):
    box(x,y,w,65);d.rectangle((x,y+8,x+4,y+57),fill=AX[axis]);text(x+16,y+12,t,18,True);text(x+16,y+38,meta,14,c=MUT)
def header(name,subtitle):
    global im,d
    im=Image.new('RGB',(1440,1040),BG); d=ImageDraw.Draw(im)
    text(40,25,'AK GOLF HQ / WORKBENCH / TRE RETNINGER',14,True,MUT)
    text(40,52,name,37,True);text(40,101,subtitle,19,c=MUT)
    box(40,148,990,565); box(1054,148,346,820)
    text(62,168,'AGENCYOS  /  WORKBENCH',13,True,MUT)
    text(62,195,'Eksempelspiller · Sesong 2026',21,True)
    tag(829,188,'Utkast',76);button(919,183,'Mer',88)
    line(62,234,946)
    text(1074,172,'MOBIL / SAMME ARBEID',13,True,MUT)
    text(1074,202,'Eksempelspiller',22,True)
    text(1074,236,'Sesong 2026 · Utkast',16,c=MUT)
    text(40,991,'Prinsippskisse fra Codex · syntetiske data · 01.10.2026 · ikke en appskjerm eller valgt designversjon',16,c=MUT)
    text(40,1017,'Endelig typografi, komponenter og klikkbare varianter videreføres i Claude Design / Precision Athletics.',14,c=MUT)
def sub(x,k,t): box(x,738,482,230);title(x+20,758,k,t)
def save(n): im.save(OUT/(n+'.png'))

header('01  Tidslinje','Sesongen er kartet. Velg periode, og gå direkte videre til riktig uke.')
text(62,257,'År  /  Periode  /  Måned  /  Uke  /  Økt',17,True);button(856,249,'Ny periode',151,True)
text(62,309,'2026',28,True);text(62,350,'PERIODER',12,True,MUT)
x0=62; width=658
for i,m in enumerate(['JAN','FEB','MAR','APR','MAI','JUN','JUL','AUG','SEP','OKT','NOV','DES']):
    text(x0+i*width/12,379,m,11,True,MUT)
    d.line((x0+(date(2026,i+1,1)-date(2026,1,1)).days/365*width,405,x0+(date(2026,i+1,1)-date(2026,1,1)).days/365*width,632),fill=LINE)
periods=[('2026-01-01','2026-03-31','Grunn'),('2026-04-01','2026-05-31','Spesial'),('2026-06-01','2026-09-27','Turnering'),('2026-09-28','2026-10-25','Grunn'),('2026-10-26','2026-11-08','R'),('2026-11-09','2026-12-31','Grunn')]
for start,end,label in periods:
    offset=(date.fromisoformat(start)-date(2026,1,1)).days
    days=(date.fromisoformat(end)-date.fromisoformat(start)).days+1
    x=x0+offset/365*width;w=days/365*width-2
    box(x,414,w,54,INK if start=='2026-09-28' else '#f1eee8',r=0);text(x+4,431,label,11,True,'white' if start=='2026-09-28' else INK)
text(570,474,'R = Restitusjon',11,c=MUT)
text(62,490,'HENDELSER',12,True,MUT)
for i,label in [(4,'Test'),(7,'Turnering'),(10,'Test')]:
    x=x0+i*width/12;d.ellipse((x,519,x+6,525),fill=INK);text(x,537,label,12)
text(62,574,'PLANLAGTE TIMER / MÅNED',12,True,MUT)
for i,h in enumerate([17,20,24,29,28,34,33,31,25,20,16,13]):
    x=x0+i*width/12;d.rectangle((x,641-h,x+32,641),fill=INK);text(x,648,str(h),12)
box(748,303,259,383,FLAT);title(766,323,'VALGT PERIODE','Grunnperiode')
text(766,384,'28.09–25.10.2026',17);text(766,425,'Fokus',13,True,MUT);text(766,449,'Styrke og innspill',18,True)
text(766,494,'Uke 40 · 28.09–04.10',16);text(766,526,'Planlagt: 6 t 30 min',16);text(766,554,'Registrert: 2 t 10 min',16)
button(766,614,'Åpne uke 40',223,True)
text(1074,285,'År 2026',25,True);tag(1074,326,'Oktober',99)
box(1074,372,306,160,FLAT);text(1090,392,'Grunnperiode',21,True);text(1090,428,'28.09–25.10',17);text(1090,463,'Styrke og innspill',17);button(1090,485,'Åpne periode',270,True)
box(1074,553,306,135);text(1090,573,'November',21,True);text(1090,610,'Restitusjon → grunn',17);text(1090,648,'Se perioder og hendelser',15,c=MUT)
text(1074,735,'Detaljer åpnes ved valg.',17,True);text(1074,767,'Året blir en lesbar liste.',17);text(1074,808,'Ingen sideveis tidslinje.',17)
sub(40,'PERIODE','Velg uke i samme tidslinje')
for i in range(4): tag(60+i*112,839,'Uke '+str(40+i),101)
text(60,895,'Fokus · budsjett · planlagt · registrert',16)
sub(548,'KALENDER','Uke med datoen bevart')
text(568,839,'Man 28    Tir 29    Ons 30    Tor 1    Fre 2',16)
session(568,875,442,'14:30  Innspill','60 min · Planlagt · SLAG',2)
save('01-tidslinje')

header('02  Planbord','Sammenlign uker og fordel arbeidet. Kalenderen viser når treningen skjer.')
text(62,257,'Grunnperiode · 28.09–25.10',20,True);button(847,249,'Rediger periode',160,True)
tag(62,296,'Planbord',103);tag(177,296,'Kalender',102);text(306,302,'Fokus: styrke og innspill',17)
for i in range(4):
    x=62+i*238
    box(x,345,222,338,FLAT);text(x+14,362,'Uke '+str(40+i),22,True)
    text(x+14,396,['28.09–04.10','05.10–11.10','12.10–18.10','19.10–25.10'][i],14,c=MUT)
    text(x+14,420,'BUDSJETT / UKE',11,True,MUT)
    for j,(axis,budget) in enumerate([('FYS','2 økter'),('TEK','1 økt'),('SLAG','2 økter'),('SPILL','1 økt'),('TURN','0 økter')]):
        yy=444+j*26;d.rectangle((x+14,yy,x+18,yy+18),fill=AX[j]);text(x+28,yy,axis,15,True);text(x+99,yy,budget,15)
    line(x+14,578,194);text(x+14,592,'Planlagt  6 t 30 min',15)
    text(x+14,617,'Registrert  '+('2 t 10 min' if i==0 else '—'),15)
    button(x+14,643,'Åpne uke',194)
text(1074,285,'Grunnperiode',25,True);text(1074,326,'28.09–25.10 · Budsjett per uke',15)
button(1074,372,'Uke 40',145,True);button(1231,372,'Neste uke',149)
for j,(axis,desc) in enumerate([('FYS','2 økter'),('TEK','1 økt'),('SLAG','2 økter'),('SPILL','1 økt'),('TURN','0 økter')]):
    d.rectangle((1074,437+j*43,1078,463+j*43),fill=AX[j]);text(1090,437+j*43,axis,17,True);text(1260,437+j*43,desc,16)
text(1074,716,'Planlagt  6 t 30 min',18,True);text(1074,751,'Registrert  2 t 10 min',17)
button(1074,807,'Åpne kalender',306,True)
text(1074,886,'Én uke om gangen på mobil.',16)
sub(40,'ÅRSPLAN','Periodene som arbeidskort')
for i,label in enumerate(['Grunn','Spesial','Turnering']):
    box(60+i*149,837,135,107,FLAT);text(72+i*149,854,label,17,True);text(72+i*149,889,'Datoer · fokus',13);text(72+i*149,918,'Åpne periode',13)
sub(548,'KALENDER','Bytt fra fordeling til klokkeslett')
session(568,838,442,'Fredag 2. oktober · Innspill','14:30–15:30 · Planlagt · SLAG',2)
text(568,928,'Flytt økt åpner dato- og tidsvalg.',16)
save('02-planbord')

header('03  Fokus','Én arbeidsflate. Detaljer og verktøy vises når du trenger dem.')
text(62,258,'2026  /  Grunnperiode  /  Uke 40',17,True);button(870,249,'Ny økt',137,True)
text(62,314,'28. september–4. oktober',28,True)
tag(62,363,'Agenda',92);tag(166,363,'Tidsrutenett',130);button(773,356,'Filtre',103);button(888,356,'Verktøy',119)
line(62,418,945)
text(62,443,'FRE',13,True,MUT);text(62,468,'02',36,True);text(62,516,'OKT',13,True,MUT)
session(160,437,847,'14:30  Innspill','60 min · Planlagt · SLAG · Utendørs treningsområde',2)
text(160,530,'Fokus: lengdekontroll',19,True)
text(160,568,'Se økta for øvelser, tekniske oppgaver og øktmaler.',17,c=MUT)
button(160,622,'Se økt',126,True);text(716,634,'Uka: 6 t 30 min planlagt',17)
text(1074,285,'Uke 40',25,True);text(1074,327,'År / Periode / Uke',16,c=MUT)
text(1074,383,'Fredag 2. oktober',21,True)
session(1074,430,306,'14:30  Innspill','60 min · Planlagt · SLAG',2)
button(1074,521,'Se økt',306,True)
button(1074,579,'Verktøy',145);button(1231,579,'Filtre',149)
line(1074,658,306);text(1074,686,'Ukens plan',21,True);text(1074,726,'4 økter · 6 t 30 min planlagt',17)
text(1074,768,'2 t 10 min registrert hittil',17)
text(1074,841,'Øvelsesbank og detaljer',16);text(1074,869,'åpnes i et eget ark.',16)
sub(40,'ÅRSPLAN','En enkel liste over perioder')
for i,t in enumerate(['Grunn · 28.09–25.10','Restitusjon · 26.10–08.11','Grunn · 09.11–31.12']):
    text(60,837+i*38,t,17);line(60,865+i*38,442)
sub(548,'PERIODE','Fokus først, deretter uker')
text(568,837,'Styrke og innspill',19,True);text(568,875,'Uke 40   6 t 30 min planlagt   Åpne',16)
text(568,917,'Budsjett, volum og kilder åpnes ved behov.',15)
save('03-fokus')
print('Tre skjematiske wireframes skrevet til',OUT)
