from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.util import Inches, Pt
import os

# ── Colors ─────────────────────────────────────────────────────
ACCENT    = RGBColor(0xD2, 0x6F, 0x3D)   # warm orange
DARK      = RGBColor(0x2D, 0x21, 0x17)   # near-black
LIGHT     = RGBColor(0xFB, 0xF5, 0xEE)   # cream background
MUTED     = RGBColor(0x6F, 0x5C, 0x4D)   # warm gray
WHITE     = RGBColor(0xFF, 0xFF, 0xFF)
BG_DARK   = RGBColor(0x3B, 0x24, 0x14)   # dark brown for dark slides
CARD_BG   = RGBColor(0xFF, 0xFC, 0xF7)   # off-white card

SLIDE_W = Inches(13.333)
SLIDE_H = Inches(7.5)

SCREENSHOTS = {
    "multi_guest": "/Users/shreyamanjucha/.gemini/antigravity/brain/6ddb46bf-277b-4462-87d9-453655886deb/multi_guest_tabs_1775244919066.png",
    "nav_open"   : "/Users/shreyamanjucha/.gemini/antigravity/brain/6ddb46bf-277b-4462-87d9-453655886deb/expanded_navigation_menu_1775245651609.png",
    "mumbai_sug" : "/Users/shreyamanjucha/.gemini/antigravity/brain/6ddb46bf-277b-4462-87d9-453655886deb/mumbai_suggestions_final_1775245269727.png",
    "ai_final"   : "/Users/shreyamanjucha/.gemini/antigravity/brain/6ddb46bf-277b-4462-87d9-453655886deb/successful_ai_suggestions_1775244162116.png",
    "miami_final": "/Users/shreyamanjucha/.gemini/antigravity/brain/6ddb46bf-277b-4462-87d9-453655886deb/definitive_miami_verification_1775242012121.png",
}

prs = Presentation()
prs.slide_width  = SLIDE_W
prs.slide_height = SLIDE_H

BLANK = prs.slide_layouts[6]  # blank

# ── Helper Functions ─────────────────────────────────────────────

def add_bg(slide, color: RGBColor):
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = color

def add_rect(slide, l, t, w, h, fill_color, border_color=None, radius=None):
    shape = slide.shapes.add_shape(
        1,  # MSO_SHAPE_TYPE.RECTANGLE
        Inches(l), Inches(t), Inches(w), Inches(h)
    )
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill_color
    if border_color:
        shape.line.color.rgb = border_color
        shape.line.width = Pt(1)
    else:
        shape.line.fill.background()
    return shape

def add_text(slide, text, l, t, w, h, size=18, bold=False, color=DARK,
             align=PP_ALIGN.LEFT, italic=False, wrap=True):
    txb = slide.shapes.add_textbox(Inches(l), Inches(t), Inches(w), Inches(h))
    txb.word_wrap = wrap
    tf = txb.text_frame
    tf.word_wrap = wrap
    p = tf.paragraphs[0]
    p.alignment = align
    run = p.add_run()
    run.text = text
    run.font.size  = Pt(size)
    run.font.bold  = bold
    run.font.color.rgb = color
    run.font.italic = italic
    return txb

def add_image_safe(slide, path, l, t, w, h):
    if path and os.path.exists(path):
        slide.shapes.add_picture(path, Inches(l), Inches(t), Inches(w), Inches(h))
    else:
        # placeholder box
        add_rect(slide, l, t, w, h, RGBColor(0xF0, 0xE8, 0xDF))
        add_text(slide, "[screenshot]", l + 0.1, t + h / 2 - 0.2, w - 0.2, 0.4,
                 size=10, color=MUTED, align=PP_ALIGN.CENTER)

def add_accent_bar(slide, left=0.5, top=1.15, width=1.5, height=0.05):
    add_rect(slide, left, top, width, height, ACCENT)

def add_slide_number(slide, num):
    add_text(slide, str(num), 12.8, 7.1, 0.4, 0.3,
             size=9, color=MUTED, align=PP_ALIGN.RIGHT)

# ═══════════════════════════════════════════════════════════════
# SLIDE 1 — Cover
# ═══════════════════════════════════════════════════════════════
s = prs.slides.add_slide(BLANK)
add_bg(s, BG_DARK)

# orange blob decoration
add_rect(s, -0.5, -0.5, 5, 4, RGBColor(0xAB, 0x4D, 0x21))
add_rect(s, 9, 4, 5, 5, RGBColor(0x1A, 0x38, 0x2A))

add_text(s, "PERSONALIZED PARTY DRINK GUIDE", 1, 1.6, 9, 0.5,
         size=11, bold=True, color=RGBColor(0xD2, 0x6F, 0x3D), align=PP_ALIGN.LEFT)
add_text(s, "Sipwise", 1, 2.15, 10, 1.6,
         size=80, bold=True, color=WHITE, align=PP_ALIGN.LEFT)
add_text(s, "AI-Powered Drink & Party Planning Assistant", 1, 3.9, 10, 0.6,
         size=20, color=RGBColor(0xD4, 0xC8, 0xBC), align=PP_ALIGN.LEFT)

add_text(s, "Built with  Next.js · TypeScript · OpenAI · 5,000+ Drink Catalog",
         1, 6.5, 11, 0.5, size=12, color=RGBColor(0x8B, 0x7B, 0x70), align=PP_ALIGN.LEFT)

# ═══════════════════════════════════════════════════════════════
# SLIDE 2 — The Problem
# ═══════════════════════════════════════════════════════════════
s = prs.slides.add_slide(BLANK)
add_bg(s, LIGHT)
add_rect(s, 0, 0, 13.333, 1.0, ACCENT)
add_text(s, "THE PROBLEM", 0.5, 0.2, 6, 0.6,
         size=13, bold=True, color=WHITE)

problems = [
    ("🎉", "Planning a party with alcohol is complicated"),
    ("🌍", "Which brands are even available in my city?"),
    ("🤧", "Guests have allergies, dislikes, and different budgets"),
    ("🍹", "Too little or too much — no safe pacing plan"),
    ("😕", "Generic internet suggestions aren't personalized"),
]

for i, (icon, text) in enumerate(problems):
    y = 1.4 + i * 1.0
    add_rect(s, 0.6, y, 12.1, 0.8, CARD_BG, RGBColor(0xE0, 0xD0, 0xC0))
    add_text(s, icon, 0.9, y + 0.1, 0.6, 0.6, size=24)
    add_text(s, text, 1.7, y + 0.1, 11, 0.6, size=18, color=DARK)

add_slide_number(s, 2)

# ═══════════════════════════════════════════════════════════════
# SLIDE 3 — What is Sipwise?
# ═══════════════════════════════════════════════════════════════
s = prs.slides.add_slide(BLANK)
add_bg(s, LIGHT)
add_rect(s, 0, 0, 13.333, 1.0, DARK)
add_text(s, "WHAT IS SIPWISE?", 0.5, 0.2, 8, 0.6, size=13, bold=True, color=ACCENT)

add_text(s, "One Prompt → Full Party Plan", 0.5, 1.2, 12, 0.8,
         size=36, bold=True, color=DARK)
add_accent_bar(s, 0.5, 2.15, 4)

add_text(s,
    "You describe your party in plain English. Sipwise responds with curated drink picks, "
    "a safe pacing timeline, and regionally-available alternatives — all personalised for every guest.",
    0.5, 2.4, 7.5, 1.2, size=16, color=MUTED)

bullets = [
    ("🍸", "3 Curated Drink Picks",  "Matched to group tastes, budget & region"),
    ("⏱️", "Safe Pacing Timeline",   "Water breaks, low-ABV transitions, wind-down"),
    ("🌏", "Regional Alternatives",  "Locally-available fallback for every pick"),
]
for i, (icon, title, desc) in enumerate(bullets):
    y = 3.9 + i * 0.88
    add_text(s, icon + "  " + title, 0.5, y, 5, 0.45, size=16, bold=True, color=DARK)
    add_text(s, desc, 2.1, y + 0.42, 5.5, 0.4, size=13, color=MUTED)

add_image_safe(s, SCREENSHOTS["ai_final"], 8.3, 1.1, 4.6, 6.0)
add_slide_number(s, 3)

# ═══════════════════════════════════════════════════════════════
# SLIDE 4 — 5-Page App Overview
# ═══════════════════════════════════════════════════════════════
s = prs.slides.add_slide(BLANK)
add_bg(s, LIGHT)
add_rect(s, 0, 0, 13.333, 1.0, ACCENT)
add_text(s, "APPLICATION OVERVIEW", 0.5, 0.2, 8, 0.6, size=13, bold=True, color=WHITE)

pages = [
    ("🏠", "Start Here",  "/",          "Type your party prompt and get AI suggestions"),
    ("👤", "My Taste",    "/contacts",  "Manage your profile and unlimited guest profiles"),
    ("🎪", "Party Setup", "/drafts",    "Set event name, date, city, people count"),
    ("📅", "Party Plan",  "/itinerary", "View AI-generated drink timeline for the night"),
    ("🔑", "Local Picks", "/settings",  "Enter your OpenAI API key"),
]
cols = [(0.4, 2.4), (2.7, 4.7), (5.0, 7.0), (7.3, 9.3), (9.6, 11.6)]
for i, (icon, name, route, desc) in enumerate(pages):
    x = cols[i][0]
    add_rect(s, x, 1.2, 2.2, 5.8, CARD_BG, RGBColor(0xE8, 0xD8, 0xCC))
    add_text(s, icon, x + 0.8, 1.5, 0.6, 0.6, size=28, align=PP_ALIGN.CENTER)
    add_text(s, name, x + 0.1, 2.3, 2.0, 0.5, size=15, bold=True, color=DARK, align=PP_ALIGN.CENTER)
    add_text(s, route, x + 0.1, 2.8, 2.0, 0.35, size=10, color=ACCENT, align=PP_ALIGN.CENTER)
    add_rect(s, x + 0.55, 3.15, 1.1, 0.04, ACCENT)
    add_text(s, desc, x + 0.1, 3.35, 2.0, 2.5, size=11, color=MUTED, align=PP_ALIGN.CENTER)

add_slide_number(s, 4)

# ═══════════════════════════════════════════════════════════════
# SLIDE 5 — Multi-Profile Guest Management
# ═══════════════════════════════════════════════════════════════
s = prs.slides.add_slide(BLANK)
add_bg(s, LIGHT)
add_rect(s, 0, 0, 13.333, 1.0, DARK)
add_text(s, "FEATURE: MULTI-PROFILE GUEST MANAGEMENT", 0.5, 0.2, 10, 0.6, size=13, bold=True, color=ACCENT)

add_text(s, "Every guest. Every preference. All balanced.", 0.5, 1.2, 7, 0.7,
         size=30, bold=True, color=DARK)
add_accent_bar(s, 0.5, 2.05, 5)

add_text(s, "Per-profile settings:", 0.5, 2.3, 5, 0.45, size=14, bold=True, color=DARK)
prefs = [
    "• Name  (e.g. Alice, Bob, Charlie)",
    "• Taste Preferences  (Citrus, Sweet, Bubbly, Light, Herbal…)",
    "• Allergy Notes  (gluten, dairy, nuts…)",
    "• Alcohol Tolerance  (Low / Medium / High)",
    "• Budget Tier  (Value / Mid / Premium)",
    "• Categories to Avoid  (Whiskey, Gin, Tequila…)",
]
for i, line in enumerate(prefs):
    add_text(s, line, 0.7, 2.8 + i * 0.52, 6.5, 0.5, size=14, color=MUTED)

add_text(s, "✅  Profiles persist in localStorage — no login required.", 0.5, 6.2, 7, 0.4,
         size=12, bold=True, color=ACCENT)

add_image_safe(s, SCREENSHOTS["multi_guest"], 7.5, 1.1, 5.4, 6.0)
add_slide_number(s, 5)

# ═══════════════════════════════════════════════════════════════
# SLIDE 6 — Regional Intelligence
# ═══════════════════════════════════════════════════════════════
s = prs.slides.add_slide(BLANK)
add_bg(s, LIGHT)
add_rect(s, 0, 0, 13.333, 1.0, ACCENT)
add_text(s, "FEATURE: STRICT REGIONAL INTELLIGENCE", 0.5, 0.2, 10, 0.6, size=13, bold=True, color=WHITE)

add_text(s, "The right drink for the right city.", 0.5, 1.2, 8, 0.6,
         size=32, bold=True, color=DARK)
add_accent_bar(s, 0.5, 1.95, 4.5)

regions = [
    ("🇮🇳", "Mumbai / India",  "Royal Stag · Sula · Old Monk · Bira 91"),
    ("🇺🇸", "Miami / USA",     "Tito's Vodka · Bud Light · Jack Daniel's"),
    ("🇧🇷", "Brazil",          "Cachaça · Brahma · local beach staples"),
    ("🌍", "Global Fallback", "Well-known international brands only"),
]
for i, (flag, city, brands) in enumerate(regions):
    y = 2.3 + i * 1.0
    add_rect(s, 0.5, y, 7.0, 0.85, CARD_BG, RGBColor(0xE0, 0xD0, 0xC0))
    add_text(s, flag, 0.7, y + 0.05, 0.6, 0.7, size=26)
    add_text(s, city, 1.5, y + 0.05, 2.8, 0.45, size=14, bold=True, color=DARK)
    add_text(s, brands, 1.5, y + 0.45, 5.8, 0.35, size=12, color=MUTED)

add_text(s, "❌  Completely blocks out-of-region brands from appearing in results.",
         0.5, 6.4, 10, 0.4, size=12, bold=True, color=RGBColor(0xAB, 0x4D, 0x21))

add_image_safe(s, SCREENSHOTS["miami_final"], 8.0, 1.3, 4.9, 5.8)
add_slide_number(s, 6)

# ═══════════════════════════════════════════════════════════════
# SLIDE 7 — 5000+ Drink Catalog
# ═══════════════════════════════════════════════════════════════
s = prs.slides.add_slide(BLANK)
add_bg(s, BG_DARK)
add_text(s, "DATA: 5,000+ DRINK CATALOG", 0.5, 0.3, 10, 0.6,
         size=13, bold=True, color=ACCENT)

add_text(s, "5,000+", 0.5, 0.85, 6, 1.3, size=88, bold=True, color=WHITE)
add_text(s, "Curated Alcohol Entries", 0.5, 2.2, 6, 0.55,
         size=22, color=RGBColor(0xD4, 0xC8, 0xBC))

add_accent_bar(s, 0.5, 2.9, 3)

fields = [
    ("Name", "Bacardi Breezer"),
    ("Category", "Rum / Cooler"),
    ("ABV", "4.8%"),
    ("Price Tier", "Value"),
    ("Country", "Global"),
    ("Taste Notes", "Fruity, Sweet, Tropical"),
    ("Allergen Notes", "Contains gluten"),
    ("Low ABV flag", "true"),
]
add_text(s, "Catalog Fields:", 0.5, 3.15, 4, 0.4, size=13, bold=True, color=ACCENT)
for i, (field, val) in enumerate(fields):
    y = 3.65 + i * 0.44
    add_text(s, field, 0.6, y, 2.2, 0.4, size=12, bold=True, color=RGBColor(0xD4, 0xC8, 0xBC))
    add_text(s, val,   2.9, y, 3.5, 0.4, size=12, color=RGBColor(0xD2, 0x6F, 0x3D))

add_rect(s, 7.5, 0.8, 5.3, 6.3, RGBColor(0x24, 0x16, 0x0D))
add_text(s, "CSV → JSON Pipeline", 7.7, 0.95, 5, 0.4, size=13, bold=True, color=ACCENT)
pipeline = [
    "1.  Load alcohol_5000_taste_node.csv",
    "2.  Normalize ABV, country, brand",
    "3.  Parse tasteNotes from comma list",
    "4.  Map priceTier (Budget→Value, etc.)",
    "5.  Set lowAbv flag (ABV ≤ 12.5%)",
    "6.  Merge into alcohol-catalog.json",
]
for i, step in enumerate(pipeline):
    add_text(s, step, 7.7, 1.55 + i * 0.65, 4.8, 0.55, size=13, color=WHITE)

add_slide_number(s, 7)

# ═══════════════════════════════════════════════════════════════
# SLIDE 8 — AI Ranking Engine
# ═══════════════════════════════════════════════════════════════
s = prs.slides.add_slide(BLANK)
add_bg(s, LIGHT)
add_rect(s, 0, 0, 13.333, 1.0, DARK)
add_text(s, "AI ARCHITECTURE: RANKING ENGINE", 0.5, 0.2, 10, 0.6, size=13, bold=True, color=ACCENT)

add_text(s, "Smart pre-ranking. Then AI narration.", 0.5, 1.2, 8, 0.65,
         size=30, bold=True, color=DARK)
add_accent_bar(s, 0.5, 1.98, 5)

scores = [
    ("Taste match (user + all guests)",  "+2 – 5 pts"),
    ("Both user AND a guest prefer it",  "+4 pts"),
    ("Regional origin match",            "+10 pts"),
    ("Allergy conflict",                 "−100 pts"),
    ("Disliked category",                "−50 pts"),
    ("Low ABV (if low-abv mode on)",     "+3 pts"),
    ("Budget match",                     "+1 – 2 pts"),
]
add_text(s, "Scoring Factors", 0.5, 2.3, 4, 0.4, size=14, bold=True, color=DARK)
for i, (factor, pts) in enumerate(scores):
    y = 2.75 + i * 0.54
    add_rect(s, 0.5, y, 5.5, 0.46, CARD_BG, RGBColor(0xE8, 0xD8, 0xCC))
    add_text(s, factor, 0.7, y + 0.03, 4.0, 0.4, size=12, color=DARK)
    col = ACCENT if "−" not in pts else RGBColor(0xCC, 0x44, 0x22)
    add_text(s, pts, 4.7, y + 0.03, 1.2, 0.4, size=12, bold=True, color=col, align=PP_ALIGN.RIGHT)

# Flow diagram
add_rect(s, 7.3, 1.3, 5.6, 5.8, RGBColor(0xF7, 0xEC, 0xDF), RGBColor(0xD2, 0x6F, 0x3D))
flow = [
    "User Prompt + All Profiles",
    "↓",
    "Score 5,000+ catalog drinks",
    "↓",
    "Pick top 12 candidates",
    "↓",
    "Send to GPT-4o-mini",
    "↓",
    "Returns 3 Suggestions +",
    "Summary + Timeline + Tips",
]
for i, line in enumerate(flow):
    bold = "↓" not in line and i not in (0,)
    col = ACCENT if line == "↓" else DARK
    size = 12 if "↓" not in line else 18
    add_text(s, line, 7.5, 1.55 + i * 0.51, 5.2, 0.48,
             size=size, bold=bold, color=col, align=PP_ALIGN.CENTER)

add_slide_number(s, 8)

# ═══════════════════════════════════════════════════════════════
# SLIDE 9 — Tech Stack
# ═══════════════════════════════════════════════════════════════
s = prs.slides.add_slide(BLANK)
add_bg(s, LIGHT)
add_rect(s, 0, 0, 13.333, 1.0, ACCENT)
add_text(s, "TECH STACK", 0.5, 0.2, 6, 0.6, size=13, bold=True, color=WHITE)

add_text(s, "Built for performance & simplicity.", 0.5, 1.2, 8, 0.6,
         size=30, bold=True, color=DARK)
add_accent_bar(s, 0.5, 1.95, 4)

stack = [
    ("Framework",         "Next.js 14  (App Router)",       "🔲"),
    ("Language",          "TypeScript",                      "🔵"),
    ("State",             "React Context + localStorage",    "⚛️"),
    ("AI",                "OpenAI GPT-4o-mini",              "🤖"),
    ("Styling",           "Vanilla CSS  (Glassmorphism)",    "🎨"),
    ("Validation",        "Zod",                             "✅"),
    ("Drink Data",        "Custom JSON (CSV → 5,000+)",      "🍸"),
]
for i, (layer, tech, icon) in enumerate(stack):
    col = 0 if i < 4 else 1
    row = i if i < 4 else i - 4
    x = 0.5 + col * 6.5
    y = 2.35 + row * 1.1
    add_rect(s, x, y, 6.0, 0.9, CARD_BG, RGBColor(0xE0, 0xD2, 0xC4))
    add_text(s, icon + "  " + layer, x + 0.15, y + 0.06, 2.2, 0.4, size=13, bold=True, color=MUTED)
    add_text(s, tech, x + 0.15, y + 0.48, 5.6, 0.38, size=14, bold=False, color=DARK)

add_slide_number(s, 9)

# ═══════════════════════════════════════════════════════════════
# SLIDE 10 — Mobile Navigation
# ═══════════════════════════════════════════════════════════════
s = prs.slides.add_slide(BLANK)
add_bg(s, LIGHT)
add_rect(s, 0, 0, 13.333, 1.0, DARK)
add_text(s, "FEATURE: MOBILE-FIRST NAVIGATION", 0.5, 0.2, 10, 0.6, size=13, bold=True, color=ACCENT)

add_text(s, "App-like. Smooth. Always on top.", 0.5, 1.2, 7, 0.65,
         size=30, bold=True, color=DARK)
add_accent_bar(s, 0.5, 1.98, 4)

bullets = [
    ("☰", "Hamburger Toggle",       "Animated icon transforms into ✕ when open"),
    ("🌫️", "Glassmorphism Card",    "Blurred overlay, soft backdrop — premium look"),
    ("🔗", "Auto-Close on Nav",     "Menu closes the moment a link is clicked"),
    ("📌", "Sticky Positioning",    "Always visible at top as you scroll"),
    ("✨", "Page Highlight",        "Active page is clearly highlighted in the menu"),
]
for i, (icon, title, desc) in enumerate(bullets):
    y = 2.35 + i * 0.9
    add_text(s, icon, 0.5, y, 0.55, 0.65, size=24)
    add_text(s, title, 1.15, y + 0.03, 3.2, 0.42, size=15, bold=True, color=DARK)
    add_text(s, desc, 1.15, y + 0.45, 6.8, 0.4, size=13, color=MUTED)

add_image_safe(s, SCREENSHOTS["nav_open"], 8.0, 1.1, 4.9, 6.0)
add_slide_number(s, 10)

# ═══════════════════════════════════════════════════════════════
# SLIDE 11 — What Makes It Unique
# ═══════════════════════════════════════════════════════════════
s = prs.slides.add_slide(BLANK)
add_bg(s, BG_DARK)
add_text(s, "WHAT MAKES SIPWISE UNIQUE?", 0.5, 0.3, 10, 0.55, size=13, bold=True, color=ACCENT)

points = [
    ("🧠", "Not just a chatbot",
     "The AI works WITH a pre-built scoring engine, not in isolation."),
    ("👥", "Multi-person intelligence",
     "Most apps are single-user. Sipwise balances constraints for an entire group simultaneously."),
    ("🌏", "Regional-first",
     "Suggestions respect local availability — Miami ≠ Mumbai ≠ Brazil."),
    ("🛡️", "Safe hosting built-in",
     "Water cadence, low-ABV mode, and quantity guidance make it a responsible host tool."),
    ("📵", "Offline persistence",
     "All profiles & settings saved locally. No login, no server dependency."),
]
for i, (icon, title, desc) in enumerate(points):
    y = 1.15 + i * 1.18
    add_rect(s, 0.5, y, 12.3, 1.05, RGBColor(0x24, 0x16, 0x0D), RGBColor(0xD2, 0x6F, 0x3D))
    add_text(s, icon, 0.75, y + 0.12, 0.7, 0.8, size=26)
    add_text(s, title, 1.6, y + 0.08, 5, 0.45, size=15, bold=True, color=WHITE)
    add_text(s, desc, 1.6, y + 0.53, 10.8, 0.45, size=13, color=RGBColor(0xD4, 0xC8, 0xBC))

add_slide_number(s, 11)

# ═══════════════════════════════════════════════════════════════
# SLIDE 12 — Future Roadmap
# ═══════════════════════════════════════════════════════════════
s = prs.slides.add_slide(BLANK)
add_bg(s, LIGHT)
add_rect(s, 0, 0, 13.333, 1.0, ACCENT)
add_text(s, "FUTURE ROADMAP", 0.5, 0.2, 6, 0.6, size=13, bold=True, color=WHITE)

add_text(s, "Where Sipwise can go next.", 0.5, 1.2, 7, 0.6,
         size=30, bold=True, color=DARK)
add_accent_bar(s, 0.5, 1.95, 4)

roadmap = [
    ("🔍", "Vector Database",         "Semantic drink search for smarter, fuzzy recommendations"),
    ("📤", "Shareable Party Plan",     "Export as a PDF or send a party-plan link to guests"),
    ("📱", "QR Code for Guests",       "Guests scan a QR to submit their own preferences"),
    ("🧃", "Mocktail Mode",            "Fully non-alcoholic recommendation flow"),
    ("💸", "Budget Calculator",        "Estimate total spend for the entire party"),
    ("🌐", "Multi-language Support",   "Serve global markets with translated suggestions"),
]
cols2 = [0.5, 6.9]
for i, (icon, title, desc) in enumerate(roadmap):
    col = i % 2
    row = i // 2
    x = cols2[col]
    y = 2.45 + row * 1.55
    add_rect(s, x, y, 6.0, 1.35, CARD_BG, RGBColor(0xE0, 0xD0, 0xC0))
    add_text(s, icon, x + 0.2, y + 0.22, 0.6, 0.8, size=28)
    add_text(s, title, x + 1.0, y + 0.12, 4.8, 0.48, size=15, bold=True, color=DARK)
    add_text(s, desc, x + 1.0, y + 0.63, 4.8, 0.55, size=12, color=MUTED)

add_slide_number(s, 12)

# ═══════════════════════════════════════════════════════════════
# SLIDE 13 — Thank You / QA
# ═══════════════════════════════════════════════════════════════
s = prs.slides.add_slide(BLANK)
add_bg(s, BG_DARK)
add_rect(s, -0.5, -0.5, 7, 9, RGBColor(0xAB, 0x4D, 0x21))

add_text(s, "Thank You", 0.5, 1.8, 11, 1.6, size=72, bold=True, color=WHITE, align=PP_ALIGN.LEFT)
add_text(s, "Questions & Demo", 0.5, 3.55, 8, 0.7, size=22, color=RGBColor(0xD4, 0xC8, 0xBC), align=PP_ALIGN.LEFT)
add_rect(s, 0.5, 4.4, 5, 0.06, WHITE)
add_text(s, "Sipwise  ·  Next.js · TypeScript · OpenAI · 5,000+ Drinks",
         0.5, 4.65, 12, 0.4, size=12, color=RGBColor(0x8B, 0x7B, 0x70), align=PP_ALIGN.LEFT)

# Save
out = "/Users/shreyamanjucha/Documents/sipwise/Sipwise_Presentation.pptx"
prs.save(out)
print(f"✅  Saved: {out}")
