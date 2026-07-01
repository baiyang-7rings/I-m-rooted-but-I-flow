#!/usr/bin/env python3
"""
Generate sketchbook-style card images for the About page.
All cards match the original website's SVG specifications exactly.
Positions use design units (du) from the original SVG viewBox, scaled by SCALE.
"""
from PIL import Image, ImageDraw, ImageFont
import os

CREAM = (242, 242, 241)
BLACK = (0, 0, 0)
GRAY = (129, 129, 129)
WHITE_PAPER = (250, 250, 248)

FONT_DIR = "/workspace/scripts/fonts"
IMG_DIR = "/workspace/public/images"


def load_font(name, size):
    path = os.path.join(FONT_DIR, name)
    try:
        return ImageFont.truetype(path, size)
    except Exception as e:
        print(f"Warning: could not load {name} at size {size}: {e}")
        return ImageFont.load_default()


def text_size(draw, text, font):
    bbox = draw.textbbox((0, 0), text, font=font)
    return bbox[2] - bbox[0], bbox[3] - bbox[1], bbox[1], bbox[3]


def rounded_rect(draw, box, radius, fill=None, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def find_font_size(draw, text, target_h, font_name, start_size, tolerance=0.5):
    lo, hi = max(1, start_size - 30), start_size + 30
    best_size = start_size
    best_diff = float('inf')
    for _ in range(25):
        mid = (lo + hi) // 2
        font = load_font(font_name, mid)
        _, h, _, _ = text_size(draw, text, font)
        diff = abs(h - target_h)
        if diff < best_diff:
            best_diff = diff
            best_size = mid
        if diff <= tolerance:
            return mid, font
        if h < target_h:
            lo = mid + 1
        else:
            hi = mid - 1
        if lo >= hi:
            break
    return best_size, load_font(font_name, best_size)


def wrap_text_en(draw, text, font, max_w):
    words = text.split(' ')
    lines = []
    cur = ''
    for w in words:
        test = (cur + ' ' + w).strip()
        if text_size(draw, test, font)[0] <= max_w:
            cur = test
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def draw_text_at(draw, x, y_top, text, font, color, target_top_du, s):
    """Draw text so its top pixel lands at y_top (absolute px). Return bottom pixel."""
    _, _, t_top, t_bot = text_size(draw, text, font)
    draw_y = y_top - t_top
    draw.text((x, draw_y), text, fill=color, font=font)
    return draw_y + t_bot


def draw_cn(draw, x, y_du, text, font, s):
    """Draw Chinese text at given du y-position (top edge). Returns bottom px."""
    y_top = int(y_du * s)
    _, _, t_top, t_bot = text_size(draw, text, font)
    draw_y = y_top - t_top
    draw.text((x, draw_y), text, fill=BLACK, font=font)
    return draw_y + t_bot


def draw_en(draw, x, y_du, text, font, s, max_w=None):
    """Draw EN text, possibly wrapped, at given du y-position (top edge of first line).
    Returns (bottom_px, lines).
    Uses fixed line height for wrapped lines based on font metrics."""
    if max_w:
        lines = wrap_text_en(draw, text, font, max_w)
    else:
        lines = [text]
    y_top = int(y_du * s)
    _, _, t_top, t_bot = text_size(draw, text if not max_w else lines[0], font)
    line_h = t_bot - t_top
    line_gap = int(3.5 * s)
    bot = 0
    for i, line in enumerate(lines):
        _, _, lt, lb = text_size(draw, line, font)
        ly = y_top - lt + i * (line_h + line_gap)
        draw.text((x, ly), line, fill=GRAY, font=font)
        bot = max(bot, ly + lb)
    return bot, lines


def generate_image_1():
    photo_path = os.path.join(IMG_DIR, "607B97BBAD6B53FF8C5D48388347E988.jpg")
    photo = Image.open(photo_path).convert('RGB')
    photo_w, photo_h = photo.size

    R_BORDER = 2 / 95
    R_PAD = 8 / 95
    R_BOTTOM = 26 / 95
    R_MARGIN = 1 / 95
    R_FONT = 8 / 95

    bw = max(2, int(round(photo_w * R_BORDER)))
    pad = int(round(photo_w * R_PAD))
    bottom_white = int(round(photo_w * R_BOTTOM))
    margin = max(1, int(round(photo_w * R_MARGIN)))
    font_size = int(round(photo_w * R_FONT))

    W = margin * 2 + bw * 2 + pad * 2 + photo_w
    H = margin * 2 + bw * 2 + pad + photo_h + bottom_white + pad

    img = Image.new('RGB', (W, H), CREAM)
    draw = ImageDraw.Draw(img)
    draw.rectangle([margin, margin, W - margin - 1, H - margin - 1], fill=CREAM, outline=BLACK, width=bw)

    photo_area_x = margin + bw + pad
    photo_area_y = margin + bw + pad
    draw.rectangle([photo_area_x, photo_area_y, photo_area_x + photo_w, photo_area_y + photo_h + bottom_white],
                   fill=WHITE_PAPER)
    img.paste(photo, (photo_area_x, photo_area_y))

    font_cap = load_font("SpecialElite.ttf", font_size)
    caption = "Jackie Li"
    tw, _, tt, tb = text_size(draw, caption, font_cap)
    cap_h = tb - tt
    cap_x = photo_area_x + (photo_w - tw) // 2
    cap_y = photo_area_y + photo_h + (bottom_white - cap_h) // 2 - tt
    draw.text((cap_x, cap_y), caption, fill=BLACK, font=font_cap)

    out = os.path.join(IMG_DIR, "image_1.png")
    img.save(out, 'PNG', dpi=(300, 300))
    print(f"image_1.png: {W}x{H}")
    return W, H


def generate_image_2():
    """
    Info card matching original image_2.svg (viewBox 252x126).
    Exact positions from pixel analysis:
    - Rounded rect: (0.79, 0.79) to (244.07, 125.21), r=7.13, stroke=1.58
    - CN rows top at y=29.0, 56.0, 81.4
    - EN rows top at y=39.1, 66.2, 92.9
    - Left pad: 15.2du, Right col x: 115.9du
    - CN h=7.2du (black, Noto Sans SC Bold)
    - EN h=6.5du (gray #818181, Special Elite)
    - EN line gap: ~3.5du
    """
    DVW, DVH = 252, 126
    SCALE = 6
    W, H = DVW * SCALE, DVH * SCALE
    s = SCALE

    img = Image.new('RGB', (W, H), CREAM)
    draw = ImageDraw.Draw(img)

    rx1 = int(0.79 * s)
    ry1 = int(0.79 * s)
    rx2 = int((0.79 + 243.28) * s)
    ry2 = int((0.79 + 124.42) * s)
    radius = int(7.13 * s)
    bw = max(2, int(round(1.58 * s)))
    rounded_rect(draw, [rx1, ry1, rx2, ry2], radius, fill=CREAM, outline=BLACK, width=bw)

    cn_target_h = int(7.2 * s)
    en_target_h = int(6.5 * s)
    sep = " | "

    cn_size, font_cn = find_font_size(draw, "别名毕业技能武", cn_target_h, "NotoSansSC-Black.ttf", int(8 * s))
    en_size, font_en = find_font_size(draw, "LocationGuangdongSkillsPython", en_target_h, "SpecialElite.ttf", int(8 * s))

    left_pad = int(15.2 * s)
    right_col_x = int(115.9 * s)
    inner_right = rx2 - bw - int(2 * s)

    left_max_w = right_col_x - left_pad - int(3 * s)
    right_max_w = inner_right - right_col_x
    full_w = inner_right - left_pad

    # Row 1: 别名/Name (left) + 居住地/Location (right)
    draw_cn(draw, left_pad, 29.0, "别名" + sep + "Jackie", font_cn, s)
    draw_cn(draw, right_col_x, 29.0, "居住地" + sep + "武汉", font_cn, s)
    draw_en(draw, left_pad, 39.1, "Name" + sep + "Jackie Li", font_en, s)
    draw_en(draw, right_col_x, 39.1, "Location" + sep + "Wuhan", font_en, s)

    # Row 2: 毕业院校/Education (full width)
    draw_cn(draw, left_pad, 56.0, "毕业院校" + sep + "武汉工商学院", font_cn, s)
    draw_en(draw, left_pad, 66.2, "Education" + sep + "Wuhan Technology and Business University",
            font_en, s, max_w=full_w)

    # Row 3: 技能/Skills (full width)
    draw_cn(draw, left_pad, 81.4, "技能" + sep + "数据分析、Python、SQL、机器学习", font_cn, s)
    draw_en(draw, left_pad, 92.9, "Skills" + sep + "Data Analysis, Python, SQL, Machine Learning, Data Viz, Leadership",
            font_en, s, max_w=full_w)

    out = os.path.join(IMG_DIR, "image_2.png")
    img.save(out, 'PNG', dpi=(300, 300))

    _, cvh, _, _ = text_size(draw, "别名毕业", font_cn)
    _, evh, _, _ = text_size(draw, "LocationGuangdongSkillsPython", font_en)
    print(f"image_2.png: {W}x{H} (cn_size={cn_size}->{cvh/s:.1f}du, en_size={en_size}->{evh/s:.1f}du)")
    return W, H


def generate_image_3():
    """
    WeChat stamp matching original image_3.svg (viewBox 135x32).
    Text 'Wechat: JaQby8888' centered in Special Elite, black.
    Original EN text cap+descender height ~9.0du.
    """
    DVW, DVH = 135, 32
    SCALE = 6
    W, H = DVW * SCALE, DVH * SCALE
    s = SCALE

    img = Image.new('RGB', (W, H), CREAM)
    draw = ImageDraw.Draw(img)

    bw = max(1, int(round(1 * s)))
    draw.rectangle([0, 0, W - 1, H - 1], fill=CREAM, outline=BLACK, width=bw)

    text_str = "Wechat: JaQby8888"
    target_h = int(9.0 * s)
    en_size, font_en = find_font_size(draw, text_str, target_h, "SpecialElite.ttf", int(12 * s))

    tw, th, t_top, t_bot = text_size(draw, text_str, font_en)
    tx = (W - tw) // 2
    ty = (H - th) // 2 - t_top
    draw.text((tx, ty), text_str, fill=BLACK, font=font_en)

    out = os.path.join(IMG_DIR, "image_3.png")
    img.save(out, 'PNG', dpi=(300, 300))
    print(f"image_3.png: {W}x{H} (en_size={en_size})")
    return W, H


def generate_image_4():
    """
    Cat card - future companion version (viewBox 214x111).
    Original: cat photo top-right (x=152 y=12 w=54 h=57), 3 rows of fields.
    Our version: photo area with "?" for future cat + faint cat ears, fields use ？/TBD.
    Positions (from original SVG pixel analysis):
    - Rounded rect: (0.76, 0.76) to (213.17, 109.24), r=6.83, stroke=1.52
    - CN rows top at y=28.0, 52.7, 77.9 (h≈7.1du)
    - EN rows top at y=38.4, 63.4, 89.1 (h≈6.5du)
    - Left pad: 13.9du, Right col x: 94.5du
    - Text area right: 149du (before photo area at x=152)
    - CN-EN gap ≈ 3.3du, field gap ≈ 7.5-8.0du
    """
    DVW, DVH = 214, 111
    SCALE = 6
    W, H = DVW * SCALE, DVH * SCALE
    s = SCALE

    img = Image.new('RGB', (W, H), CREAM)
    draw = ImageDraw.Draw(img)

    rx1 = int(0.76 * s)
    ry1 = int(0.76 * s)
    rx2 = int((0.76 + 212.41) * s)
    ry2 = int((0.76 + 108.48) * s)
    radius = int(6.83 * s)
    bw = max(2, int(round(1.52 * s)))
    rounded_rect(draw, [rx1, ry1, rx2, ry2], radius, fill=CREAM, outline=BLACK, width=bw)

    # Photo area
    photo_x = int(152 * s)
    photo_y = int(12 * s)
    photo_w = int(54 * s)
    photo_h = int(57 * s)
    draw.rectangle([photo_x, photo_y, photo_x + photo_w, photo_y + photo_h], fill=WHITE_PAPER)

    cn_target_h = int(7.1 * s)
    en_target_h = int(6.5 * s)

    cn_size, font_cn = find_font_size(draw, "姓名性别品种年", cn_target_h, "NotoSansSC-Black.ttf", int(8 * s))
    en_size, font_en = find_font_size(draw, "FemaleLocationTBDCompanion", en_target_h, "SpecialElite.ttf", int(8 * s))

    # Question mark in photo area - elegant large question mark
    qm_target = int(30 * s)
    qm_size, qm_font = find_font_size(draw, "?", qm_target, "SpecialElite.ttf", int(32 * s))
    qw, qh, qt, qb = text_size(draw, "?", qm_font)
    qx = photo_x + (photo_w - qw) // 2
    qy = photo_y + (photo_h - qh) // 2 - qt
    draw.text((qx, qy), "?", fill=(185, 185, 183), font=qm_font)

    # Faint cat ears peeking from top - subtle triangular outlines
    ear_color = (210, 210, 208)
    ear_w = int(9 * s)
    ear_h = int(12 * s)
    ear_y = photo_y + int(4 * s)
    ear_l_x = photo_x + int(9 * s)
    ear_r_x = photo_x + photo_w - int(9 * s) - ear_w
    ear_stroke = max(1, int(1.0 * s))
    draw.polygon([(ear_l_x, ear_y + ear_h), (ear_l_x + ear_w // 2, ear_y), (ear_l_x + ear_w, ear_y + ear_h)],
                 fill=None, outline=ear_color, width=ear_stroke)
    draw.polygon([(ear_r_x, ear_y + ear_h), (ear_r_x + ear_w // 2, ear_y), (ear_r_x + ear_w, ear_y + ear_h)],
                 fill=None, outline=ear_color, width=ear_stroke)

    left_pad = int(13.9 * s)
    right_col_x = int(94.5 * s)
    text_right = photo_x - int(3 * s)
    left_max_w = right_col_x - left_pad - int(3 * s)
    right_max_w = text_right - right_col_x
    full_w = text_right - left_pad

    sep = " | "

    # Row 1: 姓名/Name (left) + 性别/Gender (right)
    draw_cn(draw, left_pad, 28.0, "姓名" + sep + "？", font_cn, s)
    draw_cn(draw, right_col_x, 28.0, "性别" + sep + "？", font_cn, s)
    draw_en(draw, left_pad, 38.4, "Name" + sep + "TBD", font_en, s)
    draw_en(draw, right_col_x, 38.4, "Gender" + sep + "TBD", font_en, s)

    # Row 2: 出生年份/Birth Year (left) + 出生地/Location (right)
    draw_cn(draw, left_pad, 52.7, "出生年份" + sep + "？", font_cn, s)
    draw_cn(draw, right_col_x, 52.7, "出生地" + sep + "？", font_cn, s)
    draw_en(draw, left_pad, 63.4, "Birth Year" + sep + "TBD", font_en, s)
    draw_en(draw, right_col_x, 63.4, "Location" + sep + "TBD", font_en, s)

    # Row 3: 品种/Breed (full width)
    draw_cn(draw, left_pad, 77.9, "品种" + sep + "未来的伙伴", font_cn, s)
    draw_en(draw, left_pad, 89.1, "Breed" + sep + "Future Companion", font_en, s, max_w=full_w)

    out = os.path.join(IMG_DIR, "image_4.png")
    img.save(out, 'PNG', dpi=(300, 300))
    print(f"image_4.png: {W}x{H} (cn_size={cn_size}, en_size={en_size})")
    return W, H


if __name__ == "__main__":
    generate_image_1()
    generate_image_2()
    generate_image_3()
    generate_image_4()
    print("All cards generated!")
