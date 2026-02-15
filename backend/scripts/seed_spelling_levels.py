
import os, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT))

from dotenv import load_dotenv
load_dotenv(ROOT / ".env")

from app import create_app
from extensions import db
from models import SpellingLevel

DATA = [
    {"level": 1,  "correct_word": "ปรากฏการณ์", "options": ["ปรากฏการณ์", "ปรากฎการณ์"]},
    {"level": 2,  "correct_word": "ทรัพยากร",   "options": ["ทรัพยากร", "ทรัพย์ยากร"]},
    {"level": 3,  "correct_word": "กะทันหัน",   "options": ["กะทันหัน", "กระทันหัน"]},
    {"level": 4,  "correct_word": "อนุญาต",     "options": ["อนุญาต", "อนุญาติ"]},
    {"level": 5,  "correct_word": "ปฏิบัติ",     "options": ["ปฏิบัติ", "ปฎิบัติ"]},
    {"level": 6,  "correct_word": "สะกด",       "options": ["สะกด", "สกด"]},
    {"level": 7,  "correct_word": "อัธยาศัย",    "options": ["อัธยาศัย", "อัธยาสัย"]},
    {"level": 8,  "correct_word": "บัญชี",       "options": ["บัญชี", "บันชี"]},
    {"level": 9,  "correct_word": "สัญญา",       "options": ["สัญญา", "สันญา"]},
    {"level": 10, "correct_word": "ศาสนา",       "options": ["ศาสนา", "สาสนา"]},
    {"level": 11, "correct_word": "เศรษฐกิจ",    "options": ["เศรษฐกิจ", "เศษฐกิจ"]},
    {"level": 12, "correct_word": "พยากรณ์",     "options": ["พยากรณ์", "พยากร"]},
    {"level": 13, "correct_word": "อุณหภูมิ",     "options": ["อุณหภูมิ", "อุณภูมิ"]},
    {"level": 14, "correct_word": "อิทธิพล",      "options": ["อิทธิพล", "อิธิพล"]},
    {"level": 15, "correct_word": "เฉลี่ย",       "options": ["เฉลี่ย", "เฉลีย"]},
    {"level": 16, "correct_word": "ภูมิศาสตร์",   "options": ["ภูมิศาสตร์", "ภูมิศาตร์"]},
    {"level": 17, "correct_word": "กิเลส",        "options": ["กิเลส", "กิเลศ"]},
    {"level": 18, "correct_word": "วิกฤต",        "options": ["วิกฤต", "วิกฤติ"]},
    {"level": 19, "correct_word": "อัตโนมัติ",     "options": ["อัตโนมัติ", "อัตโนมัติ"]},
    {"level": 20, "correct_word": "สังเกต",       "options": ["สังเกต", "สังเกตุ"]},
    {"level": 21, "correct_word": "โอกาส",        "options": ["โอกาส", "โอกาศ"]},
    {"level": 22, "correct_word": "จักรยาน",      "options": ["จักรยาน", "จักยาน"]},
    {"level": 23, "correct_word": "สะอาด",        "options": ["สะอาด", "สอาด"]},
    {"level": 24, "correct_word": "อารยธรรม",     "options": ["อารยธรรม", "อริยธรรม"]},
    {"level": 25, "correct_word": "อัตลักษณ์",     "options": ["อัตลักษณ์", "อัตลักษ"]},
    {"level": 26, "correct_word": "พิจารณา",      "options": ["พิจารณา", "พิจารนา"]},
    {"level": 27, "correct_word": "คณิตศาสตร์",    "options": ["คณิตศาสตร์", "คณิตศาตร์"]},
    {"level": 28, "correct_word": "วิทยาศาสตร์",   "options": ["วิทยาศาสตร์", "วิทยาศาตร์"]},
    {"level": 29, "correct_word": "สัญลักษณ์",     "options": ["สัญลักษณ์", "สัญลักษ์"]},
    {"level": 30, "correct_word": "นิติบุคคล",     "options": ["นิติบุคคล", "นิติบุคล"]},
    {"level": 31, "correct_word": "กฎหมาย",       "options": ["กฎหมาย", "กฏหมาย"]},
    {"level": 32, "correct_word": "กรกฎาคม",       "options": ["กรกฎาคม", "กรกฏาคม"]},
    {"level": 33, "correct_word": "พฤศจิกายน",     "options": ["พฤศจิกายน", "พฤศิกายน"]},
    {"level": 34, "correct_word": "กันยายน",       "options": ["กันยายน", "กันยาน"]},
    {"level": 35, "correct_word": "สิงหาคม",       "options": ["สิงหาคม", "สิงหาคม"]},
    {"level": 36, "correct_word": "เมษายน",        "options": ["เมษายน", "เมสายน"]},
    {"level": 37, "correct_word": "คริสต์มาส",      "options": ["คริสต์มาส", "คริสมัส"]},
    {"level": 38, "correct_word": "อุโมงค์",        "options": ["อุโมงค์", "อุโมง"]},
    {"level": 39, "correct_word": "ร้อยละ",        "options": ["ร้อยละ", "ร้อยล่ะ"]},
    {"level": 40, "correct_word": "เกษียณ",        "options": ["เกษียณ", "เกษียน"]},
    {"level": 41, "correct_word": "พิพิธภัณฑ์",     "options": ["พิพิธภัณฑ์", "พิพิธพันธ์"]},
    {"level": 42, "correct_word": "อนุมัติ",       "options": ["อนุมัติ", "อนุมัติ"]},
    {"level": 43, "correct_word": "กะเพรา",        "options": ["กะเพรา", "กระเพรา"]},
    {"level": 44, "correct_word": "พิสูจน์",       "options": ["พิสูจน์", "พิสูจ"]},
    {"level": 45, "correct_word": "สาธารณสุข",      "options": ["สาธารณสุข", "สาธารณะสุข"]},
    {"level": 46, "correct_word": "อนุสาวรีย์",     "options": ["อนุสาวรีย์", "อนุสาวรี"]},
    {"level": 47, "correct_word": "เกียรติ",        "options": ["เกียรติ", "เกียรต"]},
    {"level": 48, "correct_word": "อัศจรรย์",       "options": ["อัศจรรย์", "อัศจรร"]},
    {"level": 49, "correct_word": "บรรยากาศ",       "options": ["บรรยากาศ", "บรรยกาศ"]},
    {"level": 50, "correct_word": "กิจกรรม",        "options": ["กิจกรรม", "กิจกรรมณ์"]},
]

app = create_app()
with app.app_context():
    print("DB URL =", db.engine.url)
    for d in DATA:
        row = SpellingLevel.query.filter_by(level=d["level"]).first()
        if row:
            row.correct_word = d["correct_word"]
            row.options = d["options"]
            row.is_active = True
        else:
            db.session.add(SpellingLevel(**d))
    db.session.commit()
    total = SpellingLevel.query.count()
    print(f"Seeded/updated {len(DATA)} levels. Total rows now = {total}.")
