import os, sys, random
from pathlib import Path
from datetime import datetime

ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT))

from dotenv import load_dotenv
load_dotenv(ROOT / ".env")

from app import create_app
from extensions import db
from models import TypingText

LEVELS = ["easy", "medium", "hard"]
TIMES = [60, 180, 300]     
EACH_COUNT = 25           

def target_words_for_time(sec: int) -> int:
    if sec <= 60:   return 40
    if sec <= 180:  return 80
    return 120

EASY_WORD_BANK = [
    "กา", "กบ", "ปลา", "ปู", "งู", "ลิง", "มด", "เต่า", "หนู", "หมี",
    "บ้าน", "รถ", "ถุง", "ดิน", "ฟ้า", "ดาว", "โต๊ะ", "เก้าอี้", "หนังสือ", "ปากกา",
    "มือ", "ตา", "ปาก", "หู", "ผม", "ไฟ", "น้ำ", "ขนม", "ข้าว", "ผลไม้",
    "เดิน", "วิ่ง", "นั่ง", "ยืน", "กิน", "ดื่ม", "อ่าน", "เขียน", "เล่น", "จับ",
    "และ", "กับ", "หรือ", "ที่", "ใน", "บน", "ใต้", "หน้า", "หลัง", "ข้าง",
]

EASY_WORD_BANK = [w for w in EASY_WORD_BANK if all(ch not in "่้๊๋์" for ch in w)]

EASY_PATTERNS = [
    ["คำนาม", "กริยา"],
    ["คำนาม", "กริยา", "คำนาม"],
    ["คำนาม", "อยู่", "ที่", "คำนาม"],
    ["คำนาม", "และ", "คำนาม", "กริยา"],
    ["คำนาม", "กับ", "คำนาม", "กริยา", "คำนาม"],
]

EASY_NOUNS = [w for w in EASY_WORD_BANK if w in {
    "กา","กบ","ปลา","ปู","งู","ลิง","มด","เต่า","หนู","หมี",
    "บ้าน","รถ","ถุง","ดิน","ฟ้า","ดาว","โต๊ะ","เก้าอี้","หนังสือ","ปากกา",
    "มือ","ตา","ปาก","หู","ผม","ไฟ","น้ำ","ขนม","ข้าว","ผลไม้",
}]
EASY_VERBS = [w for w in EASY_WORD_BANK if w in {"เดิน","วิ่ง","นั่ง","ยืน","กิน","ดื่ม","อ่าน","เขียน","เล่น","จับ"}]
EASY_PREPS = [w for w in EASY_WORD_BANK if w in {"ที่","ใน","บน","ใต้","หน้า","หลัง","ข้าง"}]
EASY_CONJ  = [w for w in EASY_WORD_BANK if w in {"และ","กับ","หรือ"}]

def make_easy_sentence():
    pat = random.choice(EASY_PATTERNS)
    out = []
    for token in pat:
        if token == "คำนาม":
            out.append(random.choice(EASY_NOUNS))
        elif token == "กริยา":
            out.append(random.choice(EASY_VERBS))
        elif token in {"ที่","ใน","บน","ใต้","หน้า","หลัง","ข้าง"}:
            out.append(token)
        elif token == "อยู่":
            out.append("อยู่")
        elif token in {"และ","กับ","หรือ"}:
            out.append(token)
        else:
            out.append(random.choice(EASY_NOUNS))
    return " ".join(out)

def build_easy_article(target_words: int) -> str:
    words = []
    while len(words) < target_words:
        s = make_easy_sentence()
        words.extend(s.split())
    return " ".join(words[:target_words])


MEDIUM_BANK = [
    "เมื่อเริ่มคุ้นมือ ให้เพิ่มความเร็วทีละน้อย",
    "อย่าลืมตั้งสมาธิ และพักเป็นระยะเพื่อผ่อนคลาย",
    "พิมพ์ประโยคซ้ำๆ เพื่อให้กดแป้นได้แม่นยำขึ้น",
    "ฝึกจัดจังหวะหายใจ จะช่วยให้ลื่นไหลไม่สะดุด",
    "ลองพิมพ์คำที่มีวรรณยุกต์ เช่น เก่ง เข้า เก้า ไม้",
    "ใช้ตัวสะกดท้ายคำอย่างถูกต้อง เช่น เก็บ กางเกง เกาะ",
    "ฝึกกลุ่มคำที่ใช้บ่อยในชีวิตประจำวัน",
    "อ่านประโยคก่อนหนึ่งครั้ง แล้วจึงค่อยพิมพ์",
    "แบ่งช่วงสั้นๆ แล้วค่อยเพิ่มระยะเวลาฝึก",
    "การบันทึกความก้าวหน้าช่วยให้เห็นพัฒนา",
    "ทำซ้ำอย่างตั้งใจ แม้จะช้าในตอนแรก",
    "หากผิดพลาด อย่าท้อถอย ให้แก้ไขและไปต่อ",
    "ค่อยๆ เพิ่มข้อความให้ยาวขึ้นในแต่ละครั้ง",
    "สังเกตนิ้วที่ยังสับสน แล้วฝึกซ้ำจุดนั้น",
    "เมื่อพร้อม ให้ทดสอบด้วยข้อความที่ยาวขึ้น",
]

HARD_BANK = [
    "ความแม่นยำและความเร็วต้องก้าวหน้าอย่างสม่ำเสมอ",
    "การวิเคราะห์ข้อบกพร่องช่วยให้ปรับปรุงได้อย่างยั่งยืน",
    "พัฒนาการที่มั่นคงเกิดจากวินัยและการทบทวนอย่างสม่ำเสมอ",
    "การสังเกตและสรุปผลหลังฝึกทำให้เห็นจุดแข็งและจุดอ่อน",
    "ปรัชญาและวิธีเชิงระบบช่วยเพิ่มประสิทธิภาพระยะยาว",
    "พิพิธภัณฑ์และสาธารณสุขเป็นคำที่มีรูปเขียนซับซ้อน",
    "อัศจรรย์ จิตวิทยา พฤกษศาสตร์ เป็นตัวอย่างคำที่ท้าทาย",
    "การบูรณาการแนวคิดหลากหลายทำให้เกิดองค์ความรู้ใหม่",
    "อุณหภูมิ เศรษฐกิจ สัญลักษณ์ เป็นคำที่ต้องระวังตัวสะกด",
    "คริสต์มาส อนุมัติ และอัตลักษณ์ มีการเขียนที่คล้ายแต่ต่าง",
    "ภาษาและวรรณศิลป์ช่วยหล่อหลอมทักษะการสื่อสาร",
    "พิจารณาข้อมูลและประมวลผลอย่างรอบคอบเสมอ",
    "พหุวัฒนธรรม เทคโนโลยี และบูรณาการ ใช้บ่อยในวิชาการ",
    "พิสูจน์แนวคิดด้วยการทดลองและสะท้อนผลกลับ",
    "เกียรติคุณและอนุสาวรีย์ เป็นคำที่มีรูปสะกดยุ่งยาก",
]

def bank_for_level(level: str):
    if level == "easy":   return None  
    if level == "hard":   return HARD_BANK
    return MEDIUM_BANK


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
    if len(words) > target_words:
        words = words[:target_words]
    text = " ".join(words)
    return normalize_text_for_level(text, level)

def main():
    app = create_app()
    with app.app_context():
        print("DB URL =", db.engine.url)
        inserted, updated = 0, 0

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

                    exists = TypingText.query.filter_by(
                        level=level, time_sec=tsec, text=text
                    ).first()

                    if exists:
                        if not exists.is_active:
                            exists.is_active = True
                        updated += 1
                    else:
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
        print(f"Seeded: inserted={inserted}, updated={updated}, total_rows={total}")

if __name__ == "__main__":
    main()
