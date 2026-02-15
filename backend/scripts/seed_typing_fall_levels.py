import os, sys
from pathlib import Path
import random

ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT))

from dotenv import load_dotenv
load_dotenv(ROOT / ".env")

from app import create_app
from extensions import db
from models import TypingFallLevel

EASY_WORDS = [
    "แมว","หมา","บ้าน","น้ำ","ไฟ","ปลา","ข้าว","มือ","ตา","ปาก",
    "ดิน","ฟ้า","ดาว","ไม้","รถ","โต๊ะ","เก้าอี้","หนังสือ","ปากกา","ยางลบ"
]
MEDIUM_WORDS = [
    "เรียนรู้","ความรัก","ธรรมชาติ","ความสุข","ความฝัน","วันหยุด","ครอบครัว",
    "สถานี","รถไฟฟ้า","ตลาดนัด","กิจกรรม","อารมณ์","ภูเขา","ชายหาด","สำนักข่าว"
]
HARD_WORDS = [
    "ปรากฏการณ์","ทรัพยากร","วินิจฉัย","ศรัทธา","อนุญาต","อัศจรรย์","อัธยาศัย",
    "สังเกต","บูรณาการ","เทคโนโลยี","พหุวัฒนธรรม","ปรัชญา","เศรษฐกิจพอเพียง","จิตวิทยา"
]

def build_word_pool(level: int):
    if level <= 10:
        pool = EASY_WORDS * 3 + MEDIUM_WORDS
    elif level <= 20:
        pool = EASY_WORDS + MEDIUM_WORDS * 3 + HARD_WORDS
    else:
        pool = MEDIUM_WORDS + HARD_WORDS * 4
    random.shuffle(pool)
    return pool

def params_for_level(level: int):
    fall_speed = 8.0 - (level - 1) * (5.0 / 29.0)
    spawn_interval_ms = int(1400 - (level - 1) * (1050 / 29))
    max_concurrent = 1 + (level - 1) // 7
    target_words = 10 + (level - 1) * (30 / 29)

    return {
        "fall_speed": round(max(1.5, fall_speed), 2),
        "spawn_interval_ms": max(300, spawn_interval_ms),
        "max_concurrent": min(5, max_concurrent),
        "target_words": int(round(target_words)),
    }

DATA = []
for lv in range(1, 31):
    p = params_for_level(lv)
    pool = build_word_pool(lv)
    DATA.append({
        "level": lv,
        "fall_speed": p["fall_speed"],
        "spawn_interval_ms": p["spawn_interval_ms"],
        "max_concurrent": p["max_concurrent"],
        "target_words": p["target_words"],
        "word_pool": pool,
        "is_active": True,
    })

app = create_app()
with app.app_context():
    print("DB URL =", db.engine.url)
    inserted, updated = 0, 0
    for d in DATA:
        row = TypingFallLevel.query.filter_by(level=d["level"]).first()
        if row:
            row.fall_speed        = d["fall_speed"]
            row.spawn_interval_ms = d["spawn_interval_ms"]
            row.max_concurrent    = d["max_concurrent"]
            row.target_words      = d["target_words"]
            row.word_pool         = d["word_pool"]
            row.is_active         = d["is_active"]
            updated += 1
        else:
            db.session.add(TypingFallLevel(**d))
            inserted += 1
    db.session.commit()
    total = TypingFallLevel.query.count()
    print(f"Seeded/updated {len(DATA)} levels. inserted={inserted}, updated={updated}. Total rows now = {total}.")
