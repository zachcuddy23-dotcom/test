import os, sys; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from spr import cutout, pixelize, D
from PIL import Image
import numpy as np
def chibi(im, chin, cx, head_frac=0.42, body_sx=0.62, band=40):
    a=np.asarray(im).astype(np.float32)
    h,w,_=a.shape
    # sy(y): 1 for head, r for body; sx(y): 1 for head, body_sx for body
    head_h=chin
    body_h=h-chin
    r=(head_h*(1-head_frac)/head_frac)/body_h  # body vertical scale so head occupies head_frac
    ys=np.arange(h)
    t=np.clip((ys-(chin-band))/(2*band),0,1); t=t*t*(3-2*t)
    sy=1+(r-1)*t; sx=1+(body_sx-1)*t
    v=np.concatenate([[0],np.cumsum(sy)])[:-1]
    Hout=int(v[-1]+sy[-1]); Wout=w
    out=np.zeros((Hout,Wout,4),np.float32)
    for vo in range(Hout):
        y=np.searchsorted(v,vo,side='right')-1; y=min(max(y,0),h-1)
        xs=np.arange(Wout); src=cx+(xs-cx)/sx[y]
        ok=(src>=0)&(src<w-1)
        si=src[ok].astype(int)
        out[vo,ok]=a[y,si]
    img=Image.fromarray(out.astype(np.uint8),'RGBA')
    return img.crop(img.getbbox())
