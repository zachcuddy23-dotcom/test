import sys; import os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import os
from art import *
M={}
def reg(name,H):
    def d(f): M[name]=(f,H); return f
    return d
@reg('slime',80)
def slime():
    a=Art()
    a.part('#5fbf3f',lambda d:(d.ellipse((60,150,340,370),fill=255),d.polygon([(120,200),(200,60),(280,200)],fill=255),d.ellipse((150,90,250,200),fill=255)),soft=30,spec=0.9)
    a.eye(235,230,20,iris='#ffffff'); a.eye(290,235,17,iris='#ffffff')
    a.part('#1e3a14',lambda d:d.arc((215,250,305,310),20,160,fill=255,width=8),flat=True)
    return a
@reg('goblin',112)
def goblin():
    a=Art()
    a.line('#6b4a2a',[(300,170),(330,60)],16)  # club handle
    a.ell('#7a5230',(305,20,365,110),soft=10)
    a.poly('#6e8f3a',[(120,95),(60,60),(140,140)],soft=6)   # back ear
    a.rect('#6a4e2e',(130,200,270,330),r=30)                # tunic
    a.line('#6e8f3a',[(160,320),(150,385)],30); a.line('#6e8f3a',[(240,320),(250,385)],30)
    a.ell('#4a3322',(120,370,185,395),soft=5); a.ell('#4a3322',(225,370,290,395),soft=5)
    a.line('#6e8f3a',[(150,220),(110,300)],26)
    a.ell('#7fa044',(130,80,290,230),soft=22)                # head
    a.poly('#7fa044',[(280,120),(370,70),(290,170)],soft=6)  # ear
    a.eye(215,145,14,iris='#ffe14a'); a.eye(262,148,12,iris='#ffe14a')
    a.part('#2a1a10',lambda d:d.polygon([(205,190),(285,185),(270,205),(215,205)],fill=255),flat=True)
    a.poly('#ffffff',[(220,192),(228,192),(224,203)],flat=True); a.poly('#ffffff',[(262,190),(270,190),(266,201)],flat=True)
    a.line('#6e8f3a',[(250,225),(305,170)],26)
    return a
@reg('wolf',104)
def wolf():
    a=Art()
    a.line('#5c5f6e',[(95,200),(35,150),(20,110)],34)  # tail
    a.line('#5c5f6e',[(130,250),(115,360)],30); a.line('#5c5f6e',[(290,250),(300,360)],30)
    a.ell('#7c8090',(80,160,320,290),soft=28)           # body
    a.line('#7c8090',[(150,260),(160,370)],32); a.line('#7c8090',[(270,260),(280,370)],32)
    a.ell('#7c8090',(240,110,350,220),soft=20)          # head
    a.poly('#7c8090',[(320,150),(395,175),(385,205),(320,210)],soft=10)  # snout
    a.poly('#6a6e7e',[(250,125),(262,60),(290,115)],soft=5); a.poly('#6a6e7e',[(290,118),(315,62),(325,125)],soft=5)
    a.ell('#111111',(380,168,396,184),flat=True)
    a.eye(318,150,11,iris='#ff5a3a',slit=True)
    a.part('#ffffff',lambda d:d.polygon([(335,205),(345,205),(340,220),(355,205),(365,205),(360,218)],fill=255),flat=True)
    a.part('#c8ccd8',lambda d:d.ellipse((150,230,300,290),fill=255),soft=20,alpha=0.5)
    return a
@reg('bat',84)
def bat():
    a=Art()
    wing=lambda sgn:[(200,180),(200+sgn*60,90),(200+sgn*190,60),(200+sgn*160,140),(200+sgn*175,200),(200+sgn*120,180),(200+sgn*110,240),(200+sgn*60,200)]
    a.poly('#4a2d5c',wing(-1),soft=8); a.poly('#553366',wing(1),soft=8)
    a.ell('#3b2448',(150,150,250,270),soft=20)
    a.poly('#3b2448',[(160,165),(165,110),(190,160)],soft=4); a.poly('#3b2448',[(210,160),(235,110),(240,165)],soft=4)
    a.eye(182,195,11,iris='#ff3355'); a.eye(222,195,11,iris='#ff3355')
    a.poly('#ffffff',[(190,232),(196,232),(193,246)],flat=True); a.poly('#ffffff',[(206,232),(212,232),(209,246)],flat=True)
    return a
@reg('skeleton',128)
def skeleton():
    a=Art()
    bone='#e6e0c8'
    a.line('#8c8c96',[(310,300),(330,90)],14,spec=1)  # sword
    a.rect('#6b5530',(300,290,340,305),r=4)
    a.line(bone,[(170,300),(150,390)],14); a.line(bone,[(230,300),(250,390)],14)
    a.ell(bone,(160,270,240,310),soft=8)
    a.line(bone,[(200,170),(200,290)],16)
    for i,y in enumerate(range(185,270,20)):
        w=55-i*6; a.part(bone,lambda d,y=y,w=w:d.arc((200-w,y-15,200+w,y+25),200,340,fill=255,width=9),soft=3)
    a.line(bone,[(150,180),(120,250),(135,300)],13); a.line(bone,[(250,180),(290,240),(318,290)],13)
    a.ell(bone,(145,165,255,190),soft=6)
    a.ell(bone,(150,60,260,160),soft=18); a.rect(bone,(175,130,240,180),r=10)
    a.ell('#1a1010',(170,95,203,130),flat=True); a.ell('#1a1010',(215,95,248,130),flat=True)
    a.ell('#ff6a22',(182,106,194,118),flat=True); a.ell('#ff6a22',(227,106,239,118),flat=True)
    for x in range(185,236,10): a.rect('#3a3030',(x,155,x+4,172),flat=True)
    return a
@reg('zombie',128)
def zombie():
    a=Art()
    a.line('#4d5e3e',[(170,300),(160,390)],30); a.line('#4d5e3e',[(235,300),(250,390)],30)
    a.rect('#5a4a6a',(140,160,265,320),r=25)  # rag shirt
    a.poly('#5a4a6a',[(140,300),(150,340),(170,315),(190,345),(215,318),(240,345),(265,300)],soft=5)
    a.line('#7a9460',[(250,190),(330,215),(385,210)],26)  # arms outstretched
    a.line('#6d8656',[(160,195),(260,230),(330,230)],24)
    a.ell('#7a9460',(165,55,275,175),soft=18)
    a.eye(228,110,11,iris='#e8ff66'); a.ell('#1a1a10',(250,98,272,122),flat=True)
    a.part('#2a1818',lambda d:d.ellipse((222,140,262,165),fill=255),flat=True)
    a.part('#3d3326',lambda d:d.polygon([(160,90),(200,45),(260,55),(280,90),(250,70),(210,70)],fill=255),soft=5)
    return a
@reg('imp',96)
def imp():
    a=Art()
    a.line('#8a2020',[(150,280),(80,300),(60,250)],10); a.poly('#8a2020',[(50,255),(62,225),(75,258)],soft=3)
    a.poly('#6b1e3a',[(170,190),(70,110),(90,200),(60,240),(160,240)],soft=6)
    a.poly('#6b1e3a',[(230,190),(330,110),(310,200),(340,240),(240,240)],soft=6)
    a.line('#c23a2a',[(180,300),(170,370)],24); a.line('#c23a2a',[(220,300),(232,370)],24)
    a.ell('#c23a2a',(150,190,250,320),soft=20)
    a.ell('#d24a30',(140,90,260,210),soft=20)
    a.poly('#2a1a1a',[(160,110),(140,40),(185,100)],soft=4); a.poly('#2a1a1a',[(240,110),(260,40),(215,100)],soft=4)
    a.eye(180,145,12,iris='#ffee55',slit=True); a.eye(222,145,12,iris='#ffee55',slit=True)
    a.part('#2a0a0a',lambda d:d.chord((170,160,235,200),0,180,fill=255),flat=True)
    a.line('#d24a30',[(245,230),(300,200)],18); a.ell('#ffaa22',(290,170,330,210),soft=6,spec=1)
    return a
@reg('spider',96)
def spider():
    a=Art()
    for i,(sx,ex) in enumerate([(160,40),(170,70),(230,330),(240,370)]):
        for j,dy in enumerate((0,40)):
            a.line('#3a2a2a',[(200,220+dy),(sx if sx<200 else sx,160+dy),(ex,300+dy)],12)
    a.ell('#4a2e2e',(60,140,230,300),soft=28,spec=0.5)
    a.part('#c02020',lambda d:d.polygon([(130,180),(150,220),(130,260),(110,220)],fill=255),flat=True)
    a.ell('#553535',(200,170,320,270),soft=18)
    for (x,y,r) in [(270,200,11),(298,205,10),(282,228,8),(305,230,7)]: a.eye(x,y,r,iris='#ff2222')
    a.line('#1a1010',[(300,255),(320,285)],8); a.line('#1a1010',[(280,258),(290,290)],8)
    return a
@reg('toad',100)
def toad():
    a=Art()
    a.ell('#5a7a3a',(60,160,330,340),soft=30,spec=0.6)
    a.part('#c9c27a',lambda d:d.ellipse((150,250,320,345),fill=255),soft=20)
    a.ell('#5a7a3a',(200,110,280,190),soft=12); a.ell('#5a7a3a',(90,110,170,190),soft=12)
    a.eye(240,150,20,iris='#ffcc22',slit=True); a.eye(130,150,20,iris='#ffcc22',slit=True)
    a.part('#2a1a10',lambda d:d.arc((90,180,330,280),10,170,fill=255,width=7),flat=True)
    for (x,y) in [(110,210),(160,190),(90,260),(210,215)]: a.ell('#3a5a26',(x,y,x+22,y+18),soft=5)
    a.line('#5a7a3a',[(280,300),(330,350)],28); a.line('#5a7a3a',[(100,300),(70,350)],28)
    return a
@reg('ogre',160)
def ogre():
    a=Art()
    a.line('#5a3c22',[(330,330),(360,90)],22); a.ell('#6a4a2a',(320,20,400,150),soft=12)
    for (x,y) in [(340,50),(375,60),(350,110),(385,110)]: a.ell('#aaaaaa',(x,y,x+12,y+12),flat=True)
    a.line('#b0886a',[(150,300),(135,390)],48); a.line('#b0886a',[(250,300),(265,390)],48)
    a.rect('#5a4630',(120,250,280,320),r=15)
    a.ell('#c0987a',(90,110,310,300),soft=34)
    a.line('#c0987a',[(110,150),(60,250),(80,320)],44); a.line('#c0987a',[(290,150),(330,250),(345,310)],44)
    a.ell('#c0987a',(160,40,260,140),soft=18)
    a.eye(195,85,9,iris='#ffffff'); a.eye(232,85,9,iris='#ffffff')
    a.part('#3a2010',lambda d:d.rectangle((185,110,245,122),fill=255),flat=True)
    a.poly('#ffffff',[(190,110),(198,110),(194,98)],flat=True); a.poly('#ffffff',[(232,110),(240,110),(236,98)],flat=True)
    return a
@reg('fishman',132)
def fishman():
    a=Art()
    a.line('#8a7a5a',[(320,380),(330,60)],12); a.poly('#c0c8d0',[(310,70),(330,10),(350,70)],spec=1,soft=4)
    a.poly('#2e7a7a',[(170,160),(120,120),(140,220)],soft=6)
    a.line('#3a9090',[(175,300),(160,390)],30); a.line('#3a9090',[(230,300),(250,390)],30)
    a.ell('#3aa0a0',(140,140,270,320),soft=26)
    a.part('#c8d8a0',lambda d:d.ellipse((180,170,260,310),fill=255),soft=16)
    a.ell('#3aa0a0',(160,50,290,170),soft=20)
    a.eye(250,95,14,iris='#ffee33'); a.part('#102020',lambda d:d.line([(215,140),(285,135)],fill=255,width=6),flat=True)
    a.poly('#2e7a7a',[(170,70),(200,20),(215,65),(240,15),(250,60)],soft=4)
    a.line('#3aa0a0',[(250,200),(320,210)],24)
    return a
@reg('wisp',88)
def wisp():
    a=Art()
    a.part('#8ad8ff',lambda d:(d.ellipse((110,100,290,280),fill=255),d.polygon([(130,230),(200,390),(270,230)],fill=255)),soft=40,alpha=0.55)
    a.ell('#e6f8ff',(150,140,250,240),soft=30,spec=1)
    a.eye(180,185,10,iris='#203050'); a.eye(222,185,10,iris='#203050')
    return a
@reg('shade',136)
def shade():
    a=Art()
    a.part('#2a2238',lambda d:d.polygon([(200,40),(290,120),(310,250),(340,390),(280,340),(240,390),(200,330),(160,390),(120,340),(60,390),(90,250),(110,120)],fill=255),soft=30,amb=0.6)
    a.part('#120c1c',lambda d:d.ellipse((140,80,260,200),fill=255),flat=True)
    a.eye(180,140,10,iris='#c060ff'); a.eye(222,140,10,iris='#c060ff')
    a.line('#2a2238',[(280,180),(360,150),(390,170)],22); a.line('#e0d0ff',[(385,160),(398,140)],4,flat=True)
    return a
@reg('pirate',130)
def pirate():
    a=Art()
    a.line('#c8ccd8',[(300,230),(380,120)],10,spec=1); a.rect('#caa040',(285,222,315,240),r=5)
    a.line('#3a3048',[(175,300),(165,385)],30); a.line('#3a3048',[(230,300),(245,385)],30)
    a.ell('#2a1c14',(150,370,190,395),soft=5); a.ell('#2a1c14',(230,370,275,395),soft=5)
    a.rect('#e8e0d0',(145,160,260,310),r=25)
    for y in (185,215,245,275): a.rect('#b83030',(146,y,259,y+12),flat=True)
    a.line('#d8a880',[(150,180),(120,270)],24); a.line('#d8a880',[(255,180),(295,230)],24)
    a.ell('#d8a880',(160,60,260,170),soft=18)
    a.part('#b83030',lambda d:d.chord((150,45,270,125),180,360,fill=255),soft=8)
    a.poly('#b83030',[(160,90),(120,110),(140,80)],soft=3)
    a.eye(230,112,8,iris='#ffffff'); a.rect('#111111',(185,100,210,120),r=6,flat=True)
    a.line('#111111',[(170,95),(250,85)],4,flat=True)
    a.part('#5a3a20',lambda d:d.chord((190,130,260,180),0,180,fill=255),soft=5)
    return a
@reg('lizard',92)
def lizard():
    a=Art()
    a.line('#8a6a3a',[(120,260),(40,280),(10,240)],30)
    a.line('#8a6a3a',[(150,280),(130,330)],20); a.line('#8a6a3a',[(260,280),(280,330)],20)
    a.ell('#a88048',(100,200,300,300),soft=26)
    a.poly('#a88048',[(270,210),(380,225),(385,255),(280,275)],soft=12)
    for x in range(120,290,30): a.poly('#704a26',[(x,210),(x+14,180),(x+28,210)],soft=3)
    a.eye(320,228,9,iris='#ff9922',slit=True)
    a.line('#a88048',[(180,280),(170,335)],20); a.line('#a88048',[(290,265),(310,330)],20)
    return a
# ---- bosses ----
@reg('vhalen',216)
def vhalen():
    a=Art()
    a.poly('#5a1020',[(120,110),(70,380),(330,380),(280,110)],soft=14)   # cape
    a.line('#b8bcc8',[(300,280),(390,20)],20,spec=1.5); a.line('#3a2a2a',[(290,300),(305,265)],14); a.rect('#caa040',(275,262,330,278),r=6,spec=1)
    a.rect('#4a4e5c',(150,280,190,385),r=8,spec=0.8); a.rect('#4a4e5c',(215,280,255,385),r=8,spec=0.8)
    a.rect('#5a6070',(130,140,270,300),r=30,spec=0.8)
    a.part('#caa040',lambda d:d.polygon([(200,160),(230,200),(200,260),(170,200)],fill=255),soft=5,spec=1)
    a.ell('#6a7080',(95,120,165,190),spec=1); a.ell('#6a7080',(235,120,305,190),spec=1)
    a.line('#5a6070',[(130,170),(115,270)],34,spec=0.8); a.line('#5a6070',[(270,170),(295,265)],34,spec=0.8)
    a.rect('#5a6070',(155,45,245,150),r=30,spec=1)
    a.rect('#101014',(170,95,238,108),flat=True); a.ell('#ff3020',(185,96,197,106),flat=True); a.ell('#ff3020',(215,96,227,106),flat=True)
    a.poly('#b01818',[(200,50),(230,0),(260,20),(215,60)],soft=5)
    a.poly('#8a8e9a',[(155,70),(110,30),(160,50)],soft=4); a.poly('#8a8e9a',[(245,70),(290,30),(240,50)],soft=4)
    return a
@reg('rusk',208)
def rusk():
    a=Art()
    a.poly('#1e2a4a',[(120,140),(90,370),(310,370),(280,140)],soft=14)   # coat
    a.line('#caa040',[(120,140),(95,370)],6,flat=True); a.line('#caa040',[(280,140),(305,370)],6,flat=True)
    a.line('#3a2a20',[(170,330),(165,390)],34); a.line('#3a2a20',[(230,330),(240,390)],34)
    a.rect('#e8e0d0',(150,140,250,300),r=20)
    a.rect('#6a3a1a',(145,260,255,285),flat=True); a.rect('#caa040',(188,258,212,287),spec=1)
    a.line('#c8ccd8',[(290,250),(380,160),(395,120)],13,spec=1.5); a.part('#caa040',lambda d:d.arc((265,225,315,275),90,270,fill=255,width=8),spec=1)
    a.line('#1e2a4a',[(125,160),(95,250)],34); a.line('#1e2a4a',[(275,160),(295,245)],34)
    a.line('#6a5a4a',[(95,250),(95,285)],10); a.part('#caa040',lambda d:d.polygon([(85,280),(105,280),(95,300)],fill=255),flat=True)  # hook
    a.ell('#d8a880',(150,50,250,160),soft=18)
    a.part('#3a1e10',lambda d:d.chord((150,90,250,185),0,180,fill=255),soft=6)  # beard
    a.part('#111111',lambda d:d.polygon([(100,70),(200,10),(300,70),(250,60),(200,75),(150,60)],fill=255),soft=6)
    a.part('#caa040',lambda d:d.polygon([(190,30),(210,30),(200,55)],fill=255),flat=True)
    a.eye(222,103,8,iris='#ffffff'); a.rect('#111111',(170,95,196,112),r=4,flat=True); a.line('#111111',[(160,85),(240,110)],4,flat=True)
    return a
@reg('morvane',228)
def morvane():
    a=Art()
    a.part('#6a2090',lambda d:d.ellipse((60,60,340,340),fill=255),soft=50,alpha=0.35)   # aura
    a.poly('#20142c',[(130,120),(60,395),(340,395),(270,120)],soft=16)   # robe
    a.part('#3a2450',lambda d:d.polygon([(165,140),(135,395),(265,395),(235,140)],fill=255),soft=10)
    a.line('#caa040',[(200,150),(200,390)],5,flat=True)
    a.line('#3a2a20',[(310,390),(330,40)],10); a.ell('#b040ff',(305,15,360,70),spec=1.5,soft=8)
    a.line('#20142c',[(135,150),(100,260)],30); a.line('#20142c',[(265,150),(318,200)],30)
    a.ell('#9aa0b8',(88,250,115,280),soft=4); a.ell('#9aa0b8',(305,185,335,215),soft=4)
    a.part('#e0e0e8',lambda d:d.polygon([(150,60),(120,230),(160,170),(200,220),(240,170),(280,230),(250,60)],fill=255),soft=8)  # hair
    a.ell('#9aa0b8',(160,55,240,150),soft=16)
    a.poly('#9aa0b8',[(165,95),(115,70),(162,115)],soft=4); a.poly('#9aa0b8',[(235,95),(285,70),(238,115)],soft=4)
    a.part('#e0e0e8',lambda d:d.chord((155,35,245,110),180,360,fill=255),soft=8)
    a.part('#caa040',lambda d:d.polygon([(160,55),(172,20),(186,48),(200,10),(214,48),(228,20),(240,55)],fill=255),spec=1.2,soft=4)
    a.eye(183,100,7,iris='#ff2040',slit=True); a.eye(217,100,7,iris='#ff2040',slit=True)
    a.part('#3a1030',lambda d:d.arc((185,115,215,135),20,160,fill=255,width=4),flat=True)
    return a
def render(names=None,out=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','assets')+'/'):
    ims=[]
    for n,(f,H) in M.items():
        if names and n not in names: continue
        im=pixel(f().image(),H,32); im.save(out+'m_'+n+'.png'); ims.append(im)
    return ims
if __name__=='__main__':
    ims=render(sys.argv[1:] or None)
    W=sum(i.width for i in ims)+10*len(ims); Hh=max(i.height for i in ims)
    sheet=Image.new('RGBA',(W,Hh),(60,70,100,255)); x=0
    for i in ims: sheet.alpha_composite(i,(x,Hh-i.height)); x+=i.width+10
    sheet.resize((W*2,Hh*2),Image.NEAREST).save(os.path.join(os.path.dirname(os.path.abspath(__file__)),'_preview','monsters.png'))
