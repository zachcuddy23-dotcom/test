from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import numpy as np
S=400
LIGHT=np.array([-0.55,-0.65,0.55]); LIGHT=LIGHT/np.linalg.norm(LIGHT)
def hexc(h):
    h=h.lstrip('#'); return np.array([int(h[i:i+2],16) for i in (0,2,4)],float)
class Art:
    def __init__(s,w=S,h=S):
        s.w,s.h=w,h; s.img=np.zeros((h,w,4),float)
    def mask(s,fn):
        m=Image.new('L',(s.w,s.h),0); fn(ImageDraw.Draw(m)); return m
    def part(s,color,fn,soft=14,amb=0.45,spec=0.0,flat=False,alpha=1.0,rim=0.0):
        m=s.mask(fn); ma=np.asarray(m).astype(float)/255
        c=hexc(color)
        if flat: rgb=np.broadcast_to(c,(s.h,s.w,3))
        else:
            hgt=np.asarray(m.filter(ImageFilter.GaussianBlur(soft))).astype(float)/255
            gy,gx=np.gradient(hgt)
            k=soft*1.6
            n=np.dstack([-gx*k,-gy*k,np.ones_like(hgt)*0.35+hgt*0.4])
            n/=np.linalg.norm(n,axis=2,keepdims=True)
            d=np.clip((n*LIGHT).sum(2),0,1)
            sh=amb+(1-amb)*d*1.25
            rgb=c[None,None,:]*sh[...,None]
            if spec>0:
                sp=np.clip(d,0,1)**12*spec*255; rgb=rgb+sp[...,None]
            if rim>0:
                edge=np.clip((ma-hgt)*3,0,1); rgb=rgb*(1-edge[...,None]*rim)
            rgb=np.clip(rgb,0,255)
        a=ma*alpha
        s.img[...,:3]=s.img[...,:3]*(1-a[...,None])+rgb*a[...,None]
        s.img[...,3]=np.maximum(s.img[...,3],a*255)
        return s
    # shape helpers
    def ell(s,color,box,**k): return s.part(color,lambda d:d.ellipse(box,fill=255),**k)
    def poly(s,color,pts,**k): return s.part(color,lambda d:d.polygon(pts,fill=255),**k)
    def line(s,color,pts,width,**k): return s.part(color,lambda d:(d.line(pts,fill=255,width=width,joint='curve'),[d.ellipse((p[0]-width/2,p[1]-width/2,p[0]+width/2,p[1]+width/2),fill=255) for p in (pts[0],pts[-1])]),**k)
    def rect(s,color,box,r=0,**k): return s.part(color,lambda d:d.rounded_rectangle(box,r,fill=255),**k)
    def eye(s,x,y,r,iris='#ffdd33',pupil='#000000',slit=False):
        s.ell(iris,(x-r,y-r,x+r,y+r),flat=True)
        if slit: s.ell(pupil,(x-r*0.25,y-r*0.9,x+r*0.25,y+r*0.9),flat=True)
        else: s.ell(pupil,(x-r*0.45,y-r*0.45,x+r*0.45,y+r*0.45),flat=True)
        s.ell('#ffffff',(x-r*0.7,y-r*0.7,x-r*0.2,y-r*0.2),flat=True)
        return s
    def image(s):
        return Image.fromarray(np.clip(s.img,0,255).astype(np.uint8),'RGBA')
def pixel(im,H,colors=32,outline=(20,14,22)):
    im=im.crop(im.getbbox())
    W=max(1,round(im.width*H/im.height))
    a=np.asarray(im).astype(float); al=a[...,3:]/255
    pm=Image.fromarray(np.concatenate([a[...,:3]*al,a[...,3:]],2).astype(np.uint8),'RGBA')
    sm=np.asarray(pm.resize((W,H),Image.LANCZOS)).astype(float)
    alpha=sm[...,3]; rgb=np.clip(np.where(alpha[...,None]>0,sm[...,:3]/np.maximum(alpha[...,None],1)*255,0),0,255)
    mask=alpha>100
    q=Image.fromarray(rgb.astype(np.uint8),'RGB')
    q=ImageEnhance.Color(q).enhance(1.1)
    q=np.asarray(q.quantize(colors=colors,method=Image.MEDIANCUT,dither=Image.NONE).convert('RGB'))
    out=np.zeros((H+2,W+2,4),np.uint8); out[1:-1,1:-1,:3]=q; out[1:-1,1:-1,3]=mask*255
    m=out[...,3]>0; nb=np.zeros_like(m)
    nb[1:]|=m[:-1]; nb[:-1]|=m[1:]; nb[:,1:]|=m[:,:-1]; nb[:,:-1]|=m[:,1:]
    out[nb&~m]=list(outline)+[255]
    return Image.fromarray(out,'RGBA')
