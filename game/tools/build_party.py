import sys; import os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from build_sprites import *
OUT=D+'../assets/'
for k in ['miasma','verai','raine']:
    c=prep(k)
    full=cutout_nocrop({'miasma':'1.webp','verai':'2.webp','raine':'3.webp'}[k],{'miasma':(0,60,600,1000),'verai':(0,60,540,1010),'raine':(0,50,330,790)}[k])
    ci=chibi(c,CHIN[k]-full.getbbox()[1],c.width/2,0.40,0.7)
    s=pixelize(ci,128,64); s.save(OUT+f'{k}.png'); print(k,s.size)
# portraits: square crops around face from front portrait panels
P={'miasma':('1.webp',(40,1040,340,1340)),'verai':('2.webp',(40,1060,340,1360)),'raine':('3.webp',(20,770,300,1050))}
for k,(p,b) in P.items():
    im=Image.open(D+'source/'+p).convert('RGBA').crop(b).resize((72,72),Image.LANCZOS)
    im=im.convert('RGB').quantize(colors=48,method=Image.MEDIANCUT,dither=Image.NONE).convert('RGBA')
    im.save(OUT+f'{k}_face.png')
