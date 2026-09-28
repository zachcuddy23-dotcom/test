from PIL import Image, ImageFilter
import numpy as np, sys
from collections import deque
import os
D=os.path.dirname(os.path.abspath(__file__))+'/'
def cutout(path, box, tol=38):
    im=Image.open(D+'source/'+path).convert('RGB').crop(box)
    a=np.asarray(im).astype(int)
    h,w,_=a.shape
    white=(np.abs(a-255).max(axis=2)<tol)
    bg=np.zeros((h,w),bool)
    q=deque()
    for x in range(w):
        for y in (0,h-1):
            if white[y,x] and not bg[y,x]: bg[y,x]=True;q.append((y,x))
    for y in range(h):
        for x in (0,w-1):
            if white[y,x] and not bg[y,x]: bg[y,x]=True;q.append((y,x))
    while q:
        y,x=q.popleft()
        for dy,dx in ((1,0),(-1,0),(0,1),(0,-1)):
            ny,nx=y+dy,x+dx
            if 0<=ny<h and 0<=nx<w and white[ny,nx] and not bg[ny,nx]:
                bg[ny,nx]=True;q.append((ny,nx))
    rgba=np.dstack([a,(~bg*255)]).astype(np.uint8)
    out=Image.fromarray(rgba,'RGBA')
    return out.crop(out.getbbox())
def pixelize(im,H,colors=40):
    W=round(im.width*H/im.height)
    # premultiply to avoid white fringe
    a=np.asarray(im).astype(float)
    al=a[...,3:]/255
    pm=np.concatenate([a[...,:3]*al,a[...,3:]],axis=2)
    pim=Image.fromarray(pm.astype(np.uint8),'RGBA')
    small=np.asarray(pim.resize((W,H),Image.LANCZOS)).astype(float)
    alpha=small[...,3]
    rgb=np.where(alpha[...,None]>0, small[...,:3]/np.maximum(alpha[...,None],1)*255,0)
    rgb=np.clip(rgb,0,255)
    mask=alpha>110
    rgbim=Image.fromarray(rgb.astype(np.uint8),'RGB')
    # boost saturation/contrast slightly
    from PIL import ImageEnhance
    rgbim=ImageEnhance.Color(rgbim).enhance(1.15)
    rgbim=ImageEnhance.Contrast(rgbim).enhance(1.1)
    q=rgbim.quantize(colors=colors,method=Image.MEDIANCUT,dither=Image.NONE).convert('RGB')
    qa=np.asarray(q)
    out=np.zeros((H+2,W+2,4),np.uint8)
    out[1:-1,1:-1,:3]=qa; out[1:-1,1:-1,3]=mask*255
    # outline
    m=out[...,3]>0
    nb=np.zeros_like(m)
    nb[1:,:]|=m[:-1,:]; nb[:-1,:]|=m[1:,:]; nb[:,1:]|=m[:,:-1]; nb[:,:-1]|=m[:,1:]
    ol=nb&~m
    out[ol]=[24,16,20,255]
    return Image.fromarray(out,'RGBA')
def clean_components(im, min_frac=0.01):
    a=np.array(im); m=a[...,3]>0
    h,w=m.shape; lab=np.zeros((h,w),int); n=0; sizes=[0]
    for y0 in range(h):
        for x0 in np.where(m[y0]&(lab[y0]==0))[0]:
            if lab[y0,x0]: continue
            n+=1; q=deque([(y0,x0)]); lab[y0,x0]=n; s=0
            while q:
                y,x=q.popleft(); s+=1
                for dy,dx in ((1,0),(-1,0),(0,1),(0,-1)):
                    ny,nx=y+dy,x+dx
                    if 0<=ny<h and 0<=nx<w and m[ny,nx] and not lab[ny,nx]:
                        lab[ny,nx]=n; q.append((ny,nx))
            sizes.append(s)
    tot=m.sum(); keep=np.array([s>=min_frac*tot for s in sizes]); keep[0]=False
    a[~keep[lab],3]=0
    out=Image.fromarray(a,'RGBA'); return out.crop(out.getbbox())
