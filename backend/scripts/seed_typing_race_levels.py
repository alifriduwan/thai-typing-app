import os, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT))

from dotenv import load_dotenv
load_dotenv(ROOT / ".env")

from app import create_app
from extensions import db
from models import TypingRaceLevel

BASE_TEXTS = [
    "เมื่อถึงวันหยุด ฉันชอบตื่นสาย หลังจากล้างหน้าแปรงฟัน ฉันเดินไปที่ห้องครัวเพื่อหาอะไรกิน",
    "การเดินทางด้วยรถไฟเป็นการผจญภัยที่น่าตื่นเต้นเสมอ การได้มองดูทิวทัศน์ข้างทางที่เปลี่ยนไปทำให้รู้สึกเพลิดเพลิน",
    "ปรัชญาเศรษฐกิจพอเพียงเป็นรากฐานของชีวิต ซึ่งสร้างความพอประมาณ สมดุล และภูมิคุ้มกันตนเอง",
]

DATA = []
for i in range(1, 51):
    text = BASE_TEXTS[(i - 1) % len(BASE_TEXTS)]
    bot_wpm = 30 + (i - 1) * 2 
    DATA.append({"level": i, "text": text, "bot_wpm": bot_wpm})

app = create_app()
with app.app_context():
    for d in DATA:
        row = TypingRaceLevel.query.filter_by(level=d["level"]).first()
        if row:
            row.text = d["text"]
            row.bot_wpm = d["bot_wpm"]
            row.is_active = True
        else:
            db.session.add(TypingRaceLevel(**d))
    db.session.commit()
    total = TypingRaceLevel.query.count()
    print(f"Seeded/updated {len(DATA)} typing race levels. Total rows now = {total}.")
