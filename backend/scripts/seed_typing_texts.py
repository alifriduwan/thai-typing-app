from extensions import db
from models import TypingText
from datetime import datetime
import random


LEVELS = ["easy", "medium", "hard"]
TIMES = [60, 180, 300]
EACH_COUNT = 25


def target_words_for_time(sec: int) -> int:
    if sec <= 60:
        return 40
    if sec <= 180:
        return 80
    return 120


# ------------------ EASY GENERATION ------------------

EASY_WORD_BANK = [
    "กา", "กบ", "ปลา", "ปู", "งู", "ลิง", "มด", "เต่า", "หนู", "หมี",
    "บ้าน", "รถ", "ถุง", "ดิน", "ฟ้า", "ดาว", "โต๊ะ", "เก้าอี้", "หนังสือ", "ปากกา",
    "มือ", "ตา", "ปาก", "หู", "ผม", "ไฟ", "น้ำ", "ขนม", "ข้าว", "ผลไม้",
    "เดิน", "วิ่ง", "นั่ง", "ยืน", "กิน", "ดื่ม", "อ่าน", "เขียน", "เล่น", "จับ",
    "และ", "กับ", "หรือ", "ที่", "ใน", "บน", "ใต้", "หน้า", "หลัง", "ข้าง",
]

# เอาวรรณยุกต์ออกสำหรับ easy
EASY_WORD_BANK = [w for w in EASY_WORD_BANK if all(ch not in "่้๊๋์" for ch in w)]

EASY_NOUNS = [
    "กา","กบ","ปลา","ปู","งู","ลิง","มด","เต่า","หนู","หมี",
    "บ้าน","รถ","ถุง","ดิน","ฟ้า","ดาว","โต๊ะ","เก้าอี้","หนังสือ","ปากกา",
    "มือ","ตา","ปาก","หู","ผม","ไฟ","น้ำ","ขนม","ข้าว","ผลไม้"
]

EASY_VERBS = ["เดิน","วิ่ง","นั่ง","ยืน","กิน","ดื่ม","อ่าน","เขียน","เล่น","จับ"]
EASY_PREPS = ["ที่","ใน","บน","ใต้","หน้า","หลัง","ข้าง"]
EASY_CONJ  = ["และ","กับ","หรือ"]

EASY_PATTERNS = [
    ["noun", "verb"],
    ["noun", "verb", "noun"],
    ["noun", "prep", "noun"],
    ["noun", "conj", "noun", "verb"],
]


def make_easy_sentence():
    pattern = random.choice(EASY_PATTERNS)
    words = []
    for token in pattern:
        if token == "noun":
            words.append(random.choice(EASY_NOUNS))
        elif token == "verb":
            words.append(random.choice(EASY_VERBS))
        elif token == "prep":
            words.append(random.choice(EASY_PREPS))
        elif token == "conj":
            words.append(random.choice(EASY_CONJ))
    return " ".join(words)


def build_easy_article(target_words: int) -> str:
    words = []
    while len(words) < target_words:
        words.extend(make_easy_sentence().split())
    return " ".join(words[:target_words])


# ------------------ MEDIUM / HARD ------------------

MEDIUM_BANK = [
    "เมื่อเริ่มคุ้นมือ ให้เพิ่มความเร็วทีละน้อย",
    "อย่าลืมตั้งสมาธิ และพักเป็นระยะเพื่อผ่อนคลาย",
    "พิมพ์ประโยคซ้ำ เพื่อให้กดแป้นได้แม่นยำขึ้น",
    "ฝึกจัดจังหวะหายใจ จะช่วยให้ลื่นไหล",
    "แบ่งช่วงสั้น แล้วค่อยเพิ่มระยะเวลาฝึก",
    "ทำซ้ำอย่างตั้งใจ แม้จะช้าในตอนแรก",
]

HARD_BANK = [
    "ความแม่นยำและความเร็วต้องพัฒนาอย่างสม่ำเสมอ",
    "การวิเคราะห์ข้อบกพร่องช่วยให้ปรับปรุงได้อย่างยั่งยืน",
    "พัฒนาการที่มั่นคงเกิดจากวินัยและการทบทวน",
    "การสังเกตผลหลังฝึกทำให้เห็นจุดแข็งและจุดอ่อน",
    "การบูรณาการแนวคิดช่วยเพิ่มประสิทธิภาพระยะยาว",
]


def bank_for_level(level: str):
    if level == "medium":
        return MEDIUM_BANK
    if level == "hard":
        return HARD_BANK
    return None


TONES = "่้๊๋"
KARAN = "์"


def normalize_text_for_level(text: str, level: str) -> str:
    if level == "easy":
        for ch in TONES + KARAN:
            text = text.replace(ch, "")
    elif level == "medium":
        text = text.replace(KARAN, "")
    return text


def build_article_from_bank(level: str, bank, target_words: int, seed_num: int) -> str:
    random.seed(seed_num)
    parts = []
    while sum(len(p.split()) for p in parts) < target_words:
        parts.append(random.choice(bank))
    words = " ".join(parts).split()
    words = words[:target_words]
    text = " ".join(words)
    return normalize_text_for_level(text, level)


# ------------------ MAIN SEED ------------------

def run():
    # กัน seed ซ้ำ
    if TypingText.query.first():
        print("Typing texts already seeded")
        return

    inserted = 0

    for level in LEVELS:
        for tsec in TIMES:
            target_words = target_words_for_time(tsec)

            for i in range(EACH_COUNT):
                seed_num = hash((level, tsec, i)) & 0xffffffff

                if level == "easy":
                    text = build_easy_article(target_words)
                    text = normalize_text_for_level(text, "easy")
                else:
                    bank = bank_for_level(level)
                    text = build_article_from_bank(level, bank, target_words, seed_num)

                row = TypingText(
                    level=level,
                    time_sec=tsec,
                    text=text,
                    is_active=True,
                    created_at=datetime.utcnow()
                )
                db.session.add(row)
                inserted += 1

    db.session.commit()
    total = TypingText.query.count()
    print(f"Seeded typing texts: inserted={inserted}, total_rows={total}")
