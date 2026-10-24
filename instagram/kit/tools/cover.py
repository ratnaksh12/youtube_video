"""Reel cover: a film frame + a two-line title, kept inside the centre 3:4 (grid) and 4:5 (feed) crops.
  python kit/tools/cover.py <frame.jpg> <fonts dir> <out.jpg> "LINE ONE" "LINE TWO" "SERIES TAG"
"""
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
src, fonts, out = sys.argv[1], sys.argv[2], sys.argv[3]
L1, L2, TAG = (sys.argv[4:7] + ['YOUR BATTERY %', 'IS A GUESS', 'HOW IT ACTUALLY WORKS // 01'][len(sys.argv[4:7]):])
im = Image.open(src).convert('RGB')
W, H = im.size
d = ImageDraw.Draw(im, 'RGBA')
# darken the lower band so the title reads
grad = Image.new('L', (1, H))
for y in range(H): grad.putpixel((0, y), int(max(0, min(1, (y - 1180) / 260)) * 200))
im.paste(Image.new('RGB', (W, H), (5, 3, 16)), (0, 0), grad.resize((W, H)))
big = ImageFont.truetype(f'{fonts}/Rajdhani-Bold.ttf', 132)
mid = ImageFont.truetype(f'{fonts}/Rajdhani-SemiBold.ttf', 56)
mono = ImageFont.truetype(f'{fonts}/ShareTechMono-Regular.ttf', 30)
violet, lime, white = (176, 150, 255), (190, 255, 80), (238, 234, 255)
def center(text, y, font, fill, glow=None):
    w = d.textlength(text, font=font)
    if glow:
        g = Image.new('RGBA', (W, H), (0, 0, 0, 0)); gd = ImageDraw.Draw(g)
        gd.text(((W - w) / 2, y), text, font=font, fill=glow); g = g.filter(ImageFilter.GaussianBlur(14))
        im.paste(g, (0, 0), g)
    ImageDraw.Draw(im).text(((W - w) / 2, y), text, font=font, fill=fill)
def fit(text, size):
    f = ImageFont.truetype(f'{fonts}/Rajdhani-Bold.ttf', size)
    while d.textlength(text, font=f) > W - 120 and size > 60: size -= 4; f = ImageFont.truetype(f'{fonts}/Rajdhani-Bold.ttf', size)
    return f
center(L1, 1290, fit(L1, 132), white, (150, 120, 255, 200))
center(L2, 1418, fit(L2, 132), lime, (150, 255, 60, 170))
center(TAG, 1560, mono, violet)
im.save(out, quality=92)
print(out, im.size)
