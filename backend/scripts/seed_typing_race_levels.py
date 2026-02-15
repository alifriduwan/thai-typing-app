from extensions import db
from models import TypingRaceLevel

BASE_TEXTS = [
    "เมื่อถึงวันหยุด ฉันชอบตื่นสาย หลังจากล้างหน้าแปรงฟัน ฉันเดินไปที่ห้องครัวเพื่อหาอะไรกิน",
    "การเดินทางด้วยรถไฟเป็นการผจญภัยที่น่าตื่นเต้นเสมอ การได้มองดูทิวทัศน์ข้างทางที่เปลี่ยนไปทำให้รู้สึกเพลิดเพลิน",
    "ปรัชญาเศรษฐกิจพอเพียงเป็นรากฐานของชีวิต ซึ่งสร้างความพอประมาณ สมดุล และภูมิคุ้มกันตนเอง",
]

# เตรียมข้อมูล
DATA = []
for i in range(1, 51):
    text = BASE_TEXTS[(i - 1) % len(BASE_TEXTS)]
    bot_wpm = 30 + (i - 1) * 2
    DATA.append({
        "level": i,
        "text": text,
        "bot_wpm": bot_wpm,
        "is_active": True
    })


def run():
    # กัน seed ซ้ำ
    if TypingRaceLevel.query.first():
        print("Typing race levels already seeded")
        return

    inserted = 0
    for d in DATA:
        db.session.add(TypingRaceLevel(**d))
        inserted += 1

    db.session.commit()
    print(f"Seeded typing race levels: {inserted}")
