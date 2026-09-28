import sys; import os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from spr import cutout, pixelize, clean_components, D
from chibi import chibi
from PIL import Image
import numpy as np
def prep(k):
    if k=='miasma':
        # background removal on crop limited to x<540, then mirror left half for right wing
        full=cutout_nocrop('1.webp',(0,60,600,1000))
        a=np.array(full); a[:,540:,3]=0
        cx=293
        W=2*cx+2; canvas=np.zeros((a.shape[0],W,4),np.uint8)
        left=a[:,:cx]; mir=left[:,::-1]
        canvas[:,cx:cx+mir.shape[1]]=mir  # mirrored behind
        orig=a[:,:min(W,a.shape[1])]
        m=orig[...,3]>0
        canvas[:,:orig.shape[1]][m]=orig[m]
        im=Image.fromarray(canvas,'RGBA'); return clean_components(im)
    if k=='verai': return clean_components(cutout_nocrop('2.webp',(0,60,540,1010)))
    if k=='raine': return clean_components(cutout_nocrop('3.webp',(0,50,330,790)))
def cutout_nocrop(p,b):
    import spr
    im=Image.open(D+'source/'+p).convert('RGB').crop(b)
    c=spr.cutout(p,b)
    # re-place into uncropped frame using bbox of non-bg
    a=np.asarray(im).astype(int); nb=(np.abs(a-255).max(axis=2)>=38)
    ys=np.where(nb.any(1))[0]; xs=np.where(nb.any(0))[0]
    out=Image.new('RGBA',im.size,(0,0,0,0)); out.paste(c,(xs[0],ys[0])); return out
CHIN={'miasma':255-60,'verai':200-60,'raine':175-50}
