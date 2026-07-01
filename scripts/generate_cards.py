#!/usr/bin/env python3
"""
Generate sketchbook-style card images for the About page, matching the original website exactly.
- image_1.png: Photo card with cherry blossom profile photo (polaroid-style)
- image_2.png: Bilingual info card (Chinese + English, two-column layout)
- image_3.png: Small WeChat stamp/tag

Style matches original SVG: Cream #F2F2F1 background, black border,
typewriter English font (Special Elite), serif Chinese font (Noto Serif SC).
No extra decorative elements beyond what the original has.
"""
from PIL import Image, ImageDraw, ImageFont
import os

CREAM = (242, 242, 241)
BLACK = (0, 0, 0)
GRAY = (129, 129, 129)
WHITE_PAPER = (250, 250, 248)

FONT_DIR = "/workspace/public/fonts"
IMG_DIR = "/workspace/public/images"


def load_font(name, size):
    path = os.path.join(FONT_DIR, name)
    try:
        return ImageFont.truetype(path, size)
    except Exception as e:
        print(f"Warning: could not load {name} at size {size}: {e}")
        return ImageFont.load_default()


def text_width(draw, text, font):
    bbox = draw.textbbox((0, 0), text, font=font)
    return bbox[2] - bbox[0]


def text_bbox(draw, text, font):
    return draw.textbbox((0, 0), text, font=font)


def rounded_rect(draw, box, radius, fill=None, outline=None, width=1):
    """Draw a rounded rectangle. PIL's ImageDraw.rounded_rectangle exists in newer versions."""
    x1, y1, x2, y2 = box
    r = radius
    if hasattr(draw, 'rounded_rectangle'):
        draw.rounded_rectangle(box, radius=r, fill=fill, outline=outline, width=width)
    else:
        if fill:
            draw.rectangle([x1 + r, y1, x2 - r, y2], fill=fill)
            draw.rectangle([x1, y1 + r, x2, y2 - r], fill=fill)
            draw.pieslice([x1, y1, x1 + 2*r, y1 + 2*r], 180, 270, fill=fill)
            draw.pieslice([x2 - 2*r, y1, x2, y1 + 2*r], 270, 360, fill=fill)
            draw.pieslice([x1, y2 - 2*r, x1 + 2*r, y2], 90, 180, fill=fill)
            draw.pieslice([x2 - 2*r, y2 - 2*r, x2, y2], 0, 90, fill=fill)
        if outline and width > 0:
            draw.arc([x1, y1, x1 + 2*r, y1 + 2*r], 180, 270, fill=outline, width=width)
            draw.arc([x2 - 2*r, y1, x2, y1 + 2*r], 270, 360, fill=outline, width=width)
            draw.arc([x1, y2 - 2*r, x1 + 2*r, y2], 90, 180, fill=outline, width=width)
            draw.arc([x2 - 2*r, y2 - 2*r, x2, y2], 0, 90, fill=outline, width=width)
            draw.line([x1 + r, y1, x2 - r, y1], fill=outline, width=width)
            draw.line([x1 + r, y2, x2 - r, y2], fill=outline, width=width)
            draw.line([x1, y1 + r, x1, y2 - r], fill=outline, width=width)
            draw.line([x2, y1 + r, x2, y2 - r], fill=outline, width=width)


def generate_image_1():
    """Photo card - cherry blossom photo preserved at original 960x720 size.
    Layout matches original image_1.svg: cream background, black border,
    white polaroid area, bottom caption 'Jackie Li'."""
    photo_path = os.path.join(IMG_DIR, "607B97BBAD6B53FF8C5D48388347E988.jpg")
    photo = Image.open(photo_path).convert('RGB')
    photo_w, photo_h = photo.size
    print(f"Original photo size: {photo_w}x{photo_h}")

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

    draw.rectangle([photo_area_x, photo_area_y,
                    photo_area_x + photo_w, photo_area_y + photo_h + bottom_white],
                   fill=WHITE_PAPER)

    img.paste(photo, (photo_area_x, photo_area_y))

    font_cap = load_font("SpecialElite.ttf", font_size)
    caption = "Jackie Li"
    tw = text_width(draw, caption, font_cap)
    cap_x = photo_area_x + (photo_w - tw) // 2
    bbox = text_bbox(draw, caption, font_cap)
    cap_h = bbox[3] - bbox[1]
    cap_y = photo_area_y + photo_h + (bottom_white - cap_h) // 2 - bbox[1]
    draw.text((cap_x, cap_y), caption, fill=BLACK, font=font_cap)

    out_path = os.path.join(IMG_DIR, "image_1.png")
    img.save(out_path, 'PNG', dpi=(300, 300))
    print(f"Generated {out_path} ({W}x{H}), border={bw}px, pad={pad}px, bottom_white={bottom_white}px")
    return W, H


def generate_image_2():
    """Info card matching original image_2.svg exactly:
    - Rounded corners, black border, cream background
    - Two-column bilingual layout (Chinese bold + gray English subtitles)
    - Fields: 别名/Name, 居住地/Location, 毕业院校/Education, 技能/Skills
    - No extra decorations (no stamps, lines, corner marks)
    """
    # Work in design units matching original SVG viewBox 252x126, scale by 4
    DVW, DVH = 252, 126
    SCALE = 4
    W, H = DVW * SCALE, DVH * SCALE

    img = Image.new('RGB', (W, H), CREAM)
    draw = ImageDraw.Draw(img)

    # Original SVG specs: rect x=0.79 y=0.79 w=243.28 h=124.42 rx=7.13 stroke=1.58
    s = SCALE
    rect_x1 = int(0.79 * s)
    rect_y1 = int(0.79 * s)
    rect_x2 = int((0.79 + 243.28) * s)
    rect_y2 = int((0.79 + 124.42) * s)
    rx = int(7.13 * s)
    bw = max(2, int(round(1.58 * s)))

    rounded_rect(draw, [rect_x1, rect_y1, rect_x2, rect_y2], rx,
                 fill=CREAM, outline=BLACK, width=bw)

    # Font sizes (in design units, scaled by s)
    cn_size = int(10 * s)
    en_size = int(6.5 * s)

    font_cn_bold = load_font("NotoSerifSC-Bold.ttf", cn_size)
    font_cn_reg = load_font("NotoSerifSC-Regular.ttf", cn_size)
    font_en = load_font("SpecialElite.ttf", en_size)

    # Content area bounds (inside the border, past the rounded corners)
    # Vertical borders are at rect_x1+bw/2 and rect_x2-bw/2
    # Horizontal flat area starts after the corner radius at top/bottom
    border_inset = bw // 2
    inner_x1 = rect_x1 + border_inset
    inner_y1 = rect_y1 + rx + border_inset
    inner_x2 = rect_x2 - border_inset
    inner_y2 = rect_y2 - rx - border_inset
    inner_w = inner_x2 - inner_x1
    inner_h = inner_y2 - inner_y1

    # Padding from inner edge (generous to match original's breathing room)
    pad_x = int(inner_w * 0.08)
    pad_y = int(inner_h * 0.14)

    content_x1 = inner_x1 + pad_x
    content_x2 = inner_x2 - pad_x
    content_w = content_x2 - content_x1

    # Column split - right column starts at ~52% mark
    col2_x = content_x1 + int(content_w * 0.52)

    # Spacing
    cn_en_gap = int(1 * s)
    field_gap = int(10 * s)

    separator = " | "

    def wrap_text(text, font, max_width):
        """Simple word-wrap for English text, returns list of lines."""
        words = text.split(' ')
        lines = []
        current = ''
        for word in words:
            test = (current + ' ' + word).strip()
            if text_width(draw, test, font) <= max_width:
                current = test
            else:
                if current:
                    lines.append(current)
                current = word
        if current:
            lines.append(current)
        return lines

    def draw_field(x, y, cn_label, cn_value, en_label, en_value, max_w):
        """Draw a single field (CN line + EN line(s)) at (x,y). Returns total height."""
        label_text = cn_label + separator
        label_w = text_width(draw, label_text, font_cn_bold)
        draw.text((x, y), label_text, fill=BLACK, font=font_cn_bold)
        draw.text((x + label_w, y), cn_value, fill=BLACK, font=font_cn_reg)

        cn_bbox = text_bbox(draw, label_text + cn_value, font_cn_bold)
        cn_h = cn_bbox[3] - cn_bbox[1]
        en_y = y + cn_h + cn_en_gap

        en_text = en_label + separator + en_value
        en_lines = wrap_text(en_text, font_en, max_w)
        line_h = text_bbox(draw, en_text, font_en)[3] - text_bbox(draw, en_text, font_en)[1]
        for i, line in enumerate(en_lines):
            draw.text((x, en_y + i * (line_h + int(0.5 * s))), line, fill=GRAY, font=font_en)

        total_h = cn_h + cn_en_gap + len(en_lines) * (line_h + int(0.5 * s)) - int(0.5 * s)
        return total_h

    def measure_field(cn_label, cn_value, en_label, en_value, max_w):
        """Measure height of a field without drawing."""
        label_text = cn_label + separator
        cn_bbox = text_bbox(draw, label_text + cn_value, font_cn_bold)
        cn_h = cn_bbox[3] - cn_bbox[1]
        en_text = en_label + separator + en_value
        en_lines = wrap_text(en_text, font_en, max_w)
        line_h = text_bbox(draw, en_text, font_en)[3] - text_bbox(draw, en_text, font_en)[1]
        total_h = cn_h + cn_en_gap + len(en_lines) * (line_h + int(0.5 * s)) - int(0.5 * s)
        return total_h

    gap_between_cols = int(content_w * 0.04)
    left_w = col2_x - content_x1 - gap_between_cols
    right_w = content_x2 - col2_x

    h1 = measure_field("别名", "Jackie", "Name", "Jackie Li", left_w)
    h2 = measure_field("所在地", "武汉 / 上海", "Location", "Wuhan / Shanghai", right_w)
    h3 = measure_field("毕业院校", "武汉工商学院", "Education",
                       "Wuhan Technology and Business University", content_w)
    h4 = measure_field("技能", "数据分析、Python、SQL、机器学习", "Skills",
                       "Data Analysis, Python, SQL, Machine Learning, Data Viz, Leadership", content_w)

    total_content_h = max(h1, h2) + field_gap + h3 + field_gap + h4
    available_h = inner_y2 - inner_y1
    start_y = inner_y1 + (available_h - total_content_h) // 2

    y = start_y

    # Row 1: two columns
    h1 = draw_field(content_x1, y, "别名", "Jackie", "Name", "Jackie Li", left_w)
    h2 = draw_field(col2_x, y, "所在地", "武汉 / 上海", "Location", "Wuhan / Shanghai", right_w)
    row1_h = max(h1, h2)
    y += row1_h + field_gap

    # Row 2: Education
    h3 = draw_field(content_x1, y, "毕业院校", "武汉工商学院", "Education",
                    "Wuhan Technology and Business University", content_w)
    y += h3 + field_gap

    # Row 3: Skills
    h4 = draw_field(content_x1, y, "技能", "数据分析、Python、SQL、机器学习", "Skills",
                    "Data Analysis, Python, SQL, Machine Learning, Data Viz, Leadership",
                    content_w)
    y += h4

    out_path = os.path.join(IMG_DIR, "image_2.png")
    img.save(out_path, 'PNG', dpi=(300, 300))
    print(f"Generated {out_path} ({W}x{H})")
    return W, H


def generate_image_3():
    """WeChat stamp matching original image_3.svg exactly:
    - Simple rectangle with single black border
    - Cream (#F2F2F1) background
    - 'Wechat: JaQby8888' centered in Special Elite typewriter font
    - Same proportions as original 'Wechat: Apollorpheus'
    """
    DVW, DVH = 135, 32
    SCALE = 4
    W, H = DVW * SCALE, DVH * SCALE

    img = Image.new('RGB', (W, H), CREAM)
    draw = ImageDraw.Draw(img)

    s = SCALE
    bw = int(round(1 * s))
    rect_x1 = int(0.5 * s)
    rect_y1 = int(0.5 * s)
    rect_x2 = int((0.5 + 134) * s)
    rect_y2 = int((0.5 + 31) * s)

    draw.rectangle([rect_x1, rect_y1, rect_x2, rect_y2], fill=CREAM, outline=BLACK, width=bw)

    font_size = int(8 * s)
    font_main = load_font("SpecialElite.ttf", font_size)

    text = "Wechat: JaQby8888"
    tw = text_width(draw, text, font_main)
    bbox = text_bbox(draw, text, font_main)
    th = bbox[3] - bbox[1]

    tx = (W - tw) // 2
    ty = (H - th) // 2 - bbox[1] - 1

    draw.text((tx, ty), text, fill=BLACK, font=font_main)

    out_path = os.path.join(IMG_DIR, "image_3.png")
    img.save(out_path, 'PNG', dpi=(300, 300))
    print(f"Generated {out_path} ({W}x{H})")
    return W, H


if __name__ == "__main__":
    generate_image_1()
    generate_image_2()
    generate_image_3()
    print("All cards generated successfully!")
