#!/usr/bin/env python3
"""
Generate three sketchbook-style card images for the About page:
- image_1.png: Photo card with cherry blossom profile photo (polaroid-style) - 468x580
- image_2.png: Name/info card (envelope-style with typewriter text) - 1232x636
- image_3.png: Small stamp/tag card with WeChat ID - 540x128

Style: Cream #F2F2F1 background, perfectly straight black 2px border (matching original SVG),
typewriter font (Special Elite), polaroid photo, minimal decorative elements.
"""
from PIL import Image, ImageDraw, ImageFont
import random
import math
import os

random.seed(42)

CREAM = (242, 242, 241)
BLACK = (0, 0, 0)
GRAY = (140, 140, 140)
DARK_GRAY = (80, 80, 80)
WHITE_PAPER = (250, 250, 248)
RED_STAMP = (170, 55, 55)

FONT_DIR = "/workspace/public/fonts"
IMG_DIR = "/workspace/public/images"

def load_font(name, size):
    path = os.path.join(FONT_DIR, name)
    try:
        return ImageFont.truetype(path, size)
    except Exception as e:
        print(f"Warning: could not load {name}: {e}")
        return ImageFont.load_default()

def draw_clean_border(draw, box, width=2):
    """Draw a perfectly straight rectangle border matching the original SVG style."""
    x1, y1, x2, y2 = box
    draw.rectangle([x1, y1, x2, y2], outline=BLACK, width=width)

def text_width(draw, text, font):
    bbox = draw.textbbox((0, 0), text, font=font)
    return bbox[2] - bbox[0]

def text_height(draw, text, font):
    bbox = draw.textbbox((0, 0), text, font=font)
    return bbox[3] - bbox[1]


def generate_image_1():
    """Photo card - 117x145 @4x = 468x580, polaroid with cherry blossom photo."""
    SCALE = 4
    W, H = 117 * SCALE, 145 * SCALE
    img = Image.new('RGB', (W, H), CREAM)
    draw = ImageDraw.Draw(img)

    bw = 2 * SCALE
    margin = 1
    # Outer rectangle (cream fill, black stroke), matching SVG: M1 1h115v143H1z
    draw.rectangle([margin, margin, W - margin - 1, H - margin - 1], fill=CREAM, outline=BLACK, width=bw)

    # Photo area with white polaroid border
    pad = 8 * SCALE
    photo_area_x = margin + bw + pad
    photo_area_y = margin + bw + pad
    photo_area_w = W - margin*2 - bw*2 - pad*2
    bottom_white = 26 * SCALE
    photo_area_h = H - margin*2 - bw*2 - pad - bottom_white - 8*SCALE

    # White border for polaroid
    draw.rectangle([photo_area_x, photo_area_y,
                    photo_area_x + photo_area_w, photo_area_y + photo_area_h + bottom_white],
                   fill=WHITE_PAPER)

    # Load and embed profile photo
    photo_path = os.path.join(IMG_DIR, "profile.jpg")
    photo = Image.open(photo_path).convert('RGB')
    pw, ph = photo.size
    target_ratio = photo_area_w / photo_area_h
    img_ratio = pw / ph
    if img_ratio > target_ratio:
        new_w = int(ph * target_ratio)
        left = (pw - new_w) // 2
        photo = photo.crop((left, 0, left + new_w, ph))
    else:
        new_h = int(pw / target_ratio)
        top = (ph - new_h) // 3
        photo = photo.crop((0, top, pw, top + new_h))
    photo = photo.resize((photo_area_w, photo_area_h), Image.LANCZOS)
    img.paste(photo, (photo_area_x, photo_area_y))

    # Typewriter caption under photo
    font_cap = load_font("SpecialElite.ttf", int(8 * SCALE))
    caption = "Jackie Li"
    tw = text_width(draw, caption, font_cap)
    cap_x = photo_area_x + (photo_area_w - tw) // 2
    cap_y = photo_area_y + photo_area_h + 8 * SCALE
    draw.text((cap_x, cap_y), caption, fill=BLACK, font=font_cap)

    out_path = os.path.join(IMG_DIR, "image_1.png")
    img.save(out_path, 'PNG', dpi=(300, 300))
    print(f"Generated {out_path} ({W}x{H})")


def generate_image_2():
    """Info/envelope card - 308x159 @4x = 1232x636 with typewriter text."""
    SCALE = 4
    W, H = 308 * SCALE, 159 * SCALE
    img = Image.new('RGB', (W, H), CREAM)
    draw = ImageDraw.Draw(img)

    bw = 2 * SCALE
    margin = 1
    draw.rectangle([margin, margin, W - margin - 1, H - margin - 1], fill=CREAM, outline=BLACK, width=bw)

    pad_x = 16 * SCALE
    pad_y = 12 * SCALE

    font_name = load_font("SpecialElite.ttf", int(14 * SCALE))
    font_title = load_font("SpecialElite.ttf", int(8 * SCALE))
    font_detail = load_font("SpecialElite.ttf", int(7 * SCALE))
    font_tiny = load_font("SpecialElite.ttf", int(5 * SCALE))

    y = pad_y + 2*SCALE

    # Name
    draw.text((pad_x, y), "Jackie Li", fill=BLACK, font=font_name)
    y += 24 * SCALE

    # Horizontal divider line
    line_y = y
    draw.line([(pad_x, line_y), (W - pad_x, line_y)], fill=BLACK, width=SCALE)
    y += 12 * SCALE

    # Title
    draw.text((pad_x, y), "Data Science & Big Data Technology", fill=DARK_GRAY, font=font_title)
    y += 14 * SCALE

    # Contact details
    details = [
        "Wuhan Technology and Business University",
        "Wuhan / Shanghai",
        "l118183365@",
        "linkedin.com/in/jackie-li6699",
    ]
    for d in details:
        draw.text((pad_x, y), d, fill=BLACK, font=font_detail)
        y += 11 * SCALE

    # Red stamp in bottom-right corner (like a personal seal)
    stamp_size = 22 * SCALE
    stamp_pad = 14 * SCALE
    sx = W - pad_x - stamp_size
    sy = H - pad_y - stamp_size
    draw.rectangle([sx, sy, sx + stamp_size, sy + stamp_size], outline=RED_STAMP, width=SCALE)
    # "JL" and date inside stamp
    stamp_text1 = "JL"
    stamp_text2 = "2026"
    tw1 = text_width(draw, stamp_text1, font_tiny)
    tw2 = text_width(draw, stamp_text2, font_tiny)
    draw.text((sx + (stamp_size - tw1)//2, sy + 4*SCALE), stamp_text1, fill=RED_STAMP, font=font_tiny)
    draw.text((sx + (stamp_size - tw2)//2, sy + 12*SCALE), stamp_text2, fill=RED_STAMP, font=font_tiny)

    # Top-right corner mark (small L-shape)
    corner = 8 * SCALE
    cx, cy = W - pad_x, pad_y + 4*SCALE
    draw.line([(cx - corner, cy), (cx, cy)], fill=BLACK, width=SCALE)
    draw.line([(cx, cy), (cx, cy + corner)], fill=BLACK, width=SCALE)

    # Bottom-right corner mark
    cx2, cy2 = W - pad_x, H - pad_y - 4*SCALE
    draw.line([(cx2 - corner, cy2), (cx2, cy2)], fill=BLACK, width=SCALE)
    draw.line([(cx2, cy2), (cx2, cy2 - corner)], fill=BLACK, width=SCALE)

    out_path = os.path.join(IMG_DIR, "image_2.png")
    img.save(out_path, 'PNG', dpi=(300, 300))
    print(f"Generated {out_path} ({W}x{H})")


def generate_image_3():
    """Small tag/stamp - 135x32 @4x = 540x128 with WeChat info."""
    SCALE = 4
    W, H = 135 * SCALE, 32 * SCALE
    img = Image.new('RGB', (W, H), CREAM)
    draw = ImageDraw.Draw(img)

    bw = 2 * SCALE
    margin = 1
    # Matching original SVG: <rect x="0.5" y="0.5" width="133.988" height="31" fill="#F2F2F1" stroke="black"/>
    draw.rectangle([margin, margin, W - margin - 1, H - margin - 1], fill=CREAM, outline=BLACK, width=bw)

    pad_x = 8 * SCALE
    pad_y = 5 * SCALE

    font_main = load_font("SpecialElite.ttf", int(8 * SCALE))
    font_sub = load_font("SpecialElite.ttf", int(6 * SCALE))

    draw.text((pad_x, pad_y), "WeChat: JaQby8888", fill=BLACK, font=font_main)
    draw.text((pad_x, pad_y + 12*SCALE), "Data Analyst | Python | SQL", fill=DARK_GRAY, font=font_sub)

    out_path = os.path.join(IMG_DIR, "image_3.png")
    img.save(out_path, 'PNG', dpi=(300, 300))
    print(f"Generated {out_path} ({W}x{H})")


if __name__ == "__main__":
    random.seed(42)
    generate_image_1()
    random.seed(123)
    generate_image_2()
    random.seed(456)
    generate_image_3()
    print("All cards generated successfully!")
