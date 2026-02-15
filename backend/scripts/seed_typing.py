import os, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT))

from dotenv import load_dotenv
load_dotenv(ROOT / ".env")

from app import create_app
from extensions import db
from models import TypingLesson, TypingLevel


def split_chars(text: str):
    return list(text)


def make_raw_chars(text: str):
    chars = split_chars(text)
    raw = []
    for _ in range(48):
        raw.extend(chars)
    return raw


def make_raw_pair(a: str, b: str):
    raw = []
    for _ in range(48):
        raw.extend(split_chars(a))
        raw.extend(split_chars(b))
    return raw


def make_display_chars(text: str):
    return [text] * 48


DATA = [
    {
        "lesson_number": 1,
        "title": "บทเรียน 1: ด, ่, ด่",
        "levels": [
            {"index": 1, "raw": make_raw_chars("ด"), "display": make_display_chars("ด"), "has_hand": True},
            {"index": 2, "raw": make_raw_chars("่"), "display": make_display_chars("่"), "has_hand": True},
            {"index": 3, "raw": make_raw_pair("ด", "่"), "display": make_display_chars("ด่"), "has_hand": False},
        ],
    },
    {
        "lesson_number": 2,
        "title": "บทเรียน 2: ก, า, กา",
        "levels": [
            {"index": 1, "raw": make_raw_chars("ก"), "display": make_display_chars("ก"), "has_hand": True},
            {"index": 2, "raw": make_raw_chars("า"), "display": make_display_chars("า"), "has_hand": True},
            {"index": 3, "raw": make_raw_pair("ก", "า"), "display": make_display_chars("กา"), "has_hand": False},
        ],
    },
    {
        "lesson_number": 3,
        "title": "บทเรียน 3: ห, ส, หส",
        "levels": [
            {"index": 1, "raw": make_raw_chars("ห"), "display": make_display_chars("ห"), "has_hand": True},
            {"index": 2, "raw": make_raw_chars("ส"), "display": make_display_chars("ส"), "has_hand": True},
            {"index": 3, "raw": make_raw_pair("ห", "ส"), "display": make_display_chars("หส"), "has_hand": False},
        ],
    },
    {
        "lesson_number": 4,
        "title": "บทเรียน 4: ฟ, ว, ฟว",
        "levels": [
            {"index": 1, "raw": make_raw_chars("ฟ"), "display": make_display_chars("ฟ"), "has_hand": True},
            {"index": 2, "raw": make_raw_chars("ว"), "display": make_display_chars("ว"), "has_hand": True},
            {"index": 3, "raw": make_raw_pair("ฟ", "ว"), "display": make_display_chars("ฟว"), "has_hand": False},
        ],
    },
    {
        "lesson_number": 5,
        "title": "บทเรียน 5: พ, อ, พอ",
        "levels": [
            {"index": 1, "raw": make_raw_chars("พ"), "display": make_display_chars("พ"), "has_hand": True},
            {"index": 2, "raw": make_raw_chars("อ"), "display": make_display_chars("อ"), "has_hand": True},
            {"index": 3, "raw": make_raw_pair("พ", "อ"), "display": make_display_chars("พอ"), "has_hand": False},
        ],
    },
    {
        "lesson_number": 6,
        "title": "บทเรียน 6: ท, ี, ที",
        "levels": [
            {"index": 1, "raw": make_raw_chars("ท"), "display": make_display_chars("ท"), "has_hand": True},
            {"index": 2, "raw": make_raw_chars("ี"), "display": make_display_chars("ี"), "has_hand": True},
            {"index": 3, "raw": make_raw_pair("ท", "ี"), "display": make_display_chars("ที"), "has_hand": False},
        ],
    },
    {
        "lesson_number": 7,
        "title": "บทเรียน 7: ก, ำ, กำ",
        "levels": [
            {"index": 1, "raw": make_raw_chars("ก"), "display": make_display_chars("ก"), "has_hand": True},
            {"index": 2, "raw": make_raw_chars("ำ"), "display": make_display_chars("ำ"), "has_hand": True},
            {"index": 3, "raw": make_raw_chars("กำ"), "display": make_display_chars("กำ"), "has_hand": False},
        ],
    },
     {
        "lesson_number": 8,
        "title": "บทเรียน 8: แ, ม, แม",
        "levels": [
            {"index": 1, "raw": make_raw_chars("แ"),   "display": make_display_chars("แ"),   "has_hand": True},
            {"index": 2, "raw": make_raw_chars("ม"),   "display": make_display_chars("ม"),   "has_hand": True},
            {"index": 3, "raw": make_raw_pair("แ", "ม"), "display": make_display_chars("แม"), "has_hand": False},
        ]
    },
    {
        "lesson_number": 9,
        "title": "บทเรียน 9: ไ, ป, ไป",
        "levels": [
            {"index": 1, "raw": make_raw_chars("ไ"),   "display": make_display_chars("ไ"),   "has_hand": True},
            {"index": 2, "raw": make_raw_chars("ป"),   "display": make_display_chars("ป"),   "has_hand": True},
            {"index": 3, "raw": make_raw_pair("ไ", "ป"), "display": make_display_chars("ไป"), "has_hand": False},
        ]
    },
    {
        "lesson_number": 10,
        "title": "บทเรียน 10: น, ใ, ใน",
        "levels": [
            {"index": 1, "raw": make_raw_chars("น"),   "display": make_display_chars("น"),   "has_hand": True},
            {"index": 2, "raw": make_raw_chars("ใ"),   "display": make_display_chars("ใ"),   "has_hand": True},
            {"index": 3, "raw": make_raw_pair("ใ", "น"), "display": make_display_chars("ใน"), "has_hand": False},
        ]
    },
    {
        "lesson_number": 11,
        "title": "บทเรียน 11: ๆ, ผ, ผๆ",
        "levels": [
            {"index": 1, "raw": make_raw_chars("ๆ"),   "display": make_display_chars("ๆ"),   "has_hand": True},
            {"index": 2, "raw": make_raw_chars("ผ"),   "display": make_display_chars("ผ"),   "has_hand": True},
            {"index": 3, "raw": make_raw_pair("ผ", "ๆ"), "display": make_display_chars("ผๆ"), "has_hand": False},
        ]
    },
    {
        "lesson_number": 12,
        "title": "บทเรียน 12: ฝ, ย, ยฝ",
        "levels": [
            {"index": 1, "raw": make_raw_chars("ฝ"),   "display": make_display_chars("ฝ"),   "has_hand": True},
            {"index": 2, "raw": make_raw_chars("ย"),   "display": make_display_chars("ย"),   "has_hand": True},
            {"index": 3, "raw": make_raw_pair("ฝ", "ย"), "display": make_display_chars("ฝย"), "has_hand": False},
        ]
    },
    {
        "lesson_number": 13,
        "title": "บทเรียน 13: ง, บ, งบ",
        "levels": [
            {"index": 1, "raw": make_raw_chars("ง"),   "display": make_display_chars("ง"),   "has_hand": True},
            {"index": 2, "raw": make_raw_chars("บ"),   "display": make_display_chars("บ"),   "has_hand": True},
            {"index": 3, "raw": make_raw_pair("ง", "บ"), "display": make_display_chars("งบ"), "has_hand": False},
        ]
    },
    {
        "lesson_number": 14,
        "title": "บทเรียน 14: ล, บ, ลบ",
        "levels": [
            {"index": 1, "raw": make_raw_chars("ล"),   "display": make_display_chars("ล"),   "has_hand": True},
            {"index": 2, "raw": make_raw_chars("บ"),   "display": make_display_chars("บ"),   "has_hand": True},
            {"index": 3, "raw": make_raw_pair("ล", "บ"), "display": make_display_chars("ลบ"), "has_hand": False},
        ]
    },
    {
        "lesson_number": 15,
        "title": "บทเรียน 15: เ, ะ, เะ",
        "levels": [
            {"index": 1, "raw": make_raw_chars("เ"),   "display": make_display_chars("เ"),   "has_hand": True},
            {"index": 2, "raw": make_raw_chars("ะ"),   "display": make_display_chars("ะ"),   "has_hand": True},
            {"index": 3, "raw": make_raw_pair("เ", "ะ"), "display": make_display_chars("เะ"), "has_hand": False},
        ]
    },
    {
    "lesson_number": 16,
    "title": "บทเรียน 16: ล, ้, ล้",
    "levels": [
        {"index": 1, "raw": make_raw_chars("ล"), "display": make_display_chars("ล"), "has_hand": True},
        {"index": 2, "raw": make_raw_chars("้"), "display": make_display_chars("้"), "has_hand": True},
        {"index": 3, "raw": make_raw_pair("ล", "้"), "display": make_display_chars("ล้"), "has_hand": False},
    ]
    },
    {
    "lesson_number": 17,
    "title": "บทเรียน 17: ก, ิ, กิ",
    "levels": [
        {"index": 1, "raw": make_raw_chars("ล"), "display": make_display_chars("ล"), "has_hand": True},
        {"index": 2, "raw": make_raw_chars("ิ"), "display": make_display_chars("ิ"), "has_hand": True},
        {"index": 3, "raw": make_raw_pair("ล", "ิ"), "display": make_display_chars("ลิ"), "has_hand": False},
    ]
    },
    {
    "lesson_number": 18,
    "title": "บทเรียน 18: ด, ั, ดั",
    "levels": [
        {"index": 1, "raw": make_raw_chars("ด"), "display": make_display_chars("ด"), "has_hand": True},
        {"index": 2, "raw": make_raw_chars("ั"), "display": make_display_chars("ั"), "has_hand": True},
        {"index": 3, "raw": make_raw_pair("ด", "ั"), "display": make_display_chars("ดั"), "has_hand": False},
    ]
    }
    ,
{
    "lesson_number": 19,
    "title": "บทเรียน 19: ร, ื, รื",
    "levels": [
        {"index": 1, "raw": make_raw_chars("ร"), "display": make_display_chars("ร"), "has_hand": True},
        {"index": 2, "raw": make_raw_chars("ื"), "display": make_display_chars("ื"), "has_hand": True},
        {"index": 3, "raw": make_raw_pair("ร", "ื"), "display": make_display_chars("รื"), "has_hand": False},
    ]
}
,
{
    "lesson_number": 20,
    "title": "บทเรียน 20: ถ, ุ, ถุ",
    "levels": [
        {"index": 1, "raw": make_raw_chars("ถ"), "display": make_display_chars("ถ"), "has_hand": True},
        {"index": 2, "raw": make_raw_chars("ุ"), "display": make_display_chars("ุ"), "has_hand": True},
        {"index": 3, "raw": make_raw_pair("ถ", "ุ"), "display": make_display_chars("ถุ"), "has_hand": False},
    ]
},
{
    "lesson_number": 21,
    "title": "บทเรียน 21: ภ, ุ, ภุ",
    "levels": [
        {"index": 1, "raw": make_raw_chars("ภ"), "display": make_display_chars("ภ"), "has_hand": True},
        {"index": 2, "raw": make_raw_chars("ุ"), "display": make_display_chars("ุ"), "has_hand": True},
        {"index": 3, "raw": make_raw_pair("ภ", "ุ"), "display": make_display_chars("ภุ"), "has_hand": False},
    ]
},
    {
        "lesson_number": 22,
        "title": "บทเรียน 22: ค, ต, คต",
        "levels": [
            {"index": 1, "raw": make_raw_chars("ค"),   "display": make_display_chars("ค"),   "has_hand": True},
            {"index": 2, "raw": make_raw_chars("ต"),   "display": make_display_chars("ต"),   "has_hand": True},
            {"index": 3, "raw": make_raw_pair("ค", "ต"), "display": make_display_chars("คต"), "has_hand": False},
        ]
    },
    {
        "lesson_number": 23,
        "title": "บทเรียน 23: จ, ข, จข",
        "levels": [
            {"index": 1, "raw": make_raw_chars("จ"),   "display": make_display_chars("จ"),   "has_hand": True},
            {"index": 2, "raw": make_raw_chars("ข"),   "display": make_display_chars("ข"),   "has_hand": True},
            {"index": 3, "raw": make_raw_pair("จ", "ข"), "display": make_display_chars("จข"), "has_hand": False},
        ]
    },
    {
        "lesson_number": 24,
        "title": "บทเรียน 24: ข, ช, ขช",
        "levels": [
            {"index": 1, "raw": make_raw_chars("ข"),   "display": make_display_chars("ข"),   "has_hand": True},
            {"index": 2, "raw": make_raw_chars("ช"),   "display": make_display_chars("ช"),   "has_hand": True},
            {"index": 3, "raw": make_raw_pair("ข", "ช"), "display": make_display_chars("ขช"), "has_hand": False},
        ]
    },
    {
        "lesson_number": 25,
        "title": "บทเรียน 25: ณ, ญ, ณญ",
        "levels": [
            {"index": 1, "raw": make_raw_chars("ณ"),   "display": make_display_chars("ณ"),   "has_hand": True},
            {"index": 2, "raw": make_raw_chars("ญ"),   "display": make_display_chars("ญ"),   "has_hand": True},
            {"index": 3, "raw": make_raw_pair("ณ", "ญ"), "display": make_display_chars("ณญ"), "has_hand": False},
        ]
    },
    {
        "lesson_number": 26,
        "title": "บทเรียน 26: ญ, ฐ, ญฐ",
        "levels": [
            {"index": 1, "raw": make_raw_chars("ญ"),   "display": make_display_chars("ญ"),   "has_hand": True},
            {"index": 2, "raw": make_raw_chars("ฐ"),   "display": make_display_chars("ฐ"),   "has_hand": True},
            {"index": 3, "raw": make_raw_pair("ญ", "ฐ"), "display": make_display_chars("ญฐ"), "has_hand": False},
        ]
    },
    {
        "lesson_number": 27,
        "title": "บทเรียน 27: ศ, ฒ, ศฒ",
        "levels": [
            {"index": 1, "raw": make_raw_chars("ศ"),   "display": make_display_chars("ศ"),   "has_hand": True},
            {"index": 2, "raw": make_raw_chars("ฒ"),   "display": make_display_chars("ฒ"),   "has_hand": True},
            {"index": 3, "raw": make_raw_pair("ศ", "ฒ"), "display": make_display_chars("ศฒ"), "has_hand": False},
        ]
    },
 {
    "lesson_number": 28,
    "title": "บทเรียน 28: ด, ู, ดู",
    "levels": [
        {"index": 1, "raw": make_raw_chars("ด"), "display": make_display_chars("ด"), "has_hand": True},
        {"index": 2, "raw": make_raw_chars("ู"), "display": make_display_chars("ู"), "has_hand": True},
        {"index": 3, "raw": make_raw_pair("ด", "ู"), "display": make_display_chars("ดู"), "has_hand": False},
    ]
},
    {
        "lesson_number": 29,
        "title": "บทเรียน 29: ธ, โ, โธ",
        "levels": [
            {"index": 1, "raw": make_raw_chars("ธ"),   "display": make_display_chars("ธ"),   "has_hand": True},
            {"index": 2, "raw": make_raw_chars("โ"),   "display": make_display_chars("โ"),   "has_hand": True},
            {"index": 3, "raw": make_raw_pair("โ", "ธ"), "display": make_display_chars("โธ"), "has_hand": False},
        ]
    },
    {
        "lesson_number": 30,
        "title": "บทเรียน 30: ษ, า, ษา",
        "levels": [
            {"index": 1, "raw": make_raw_chars("ษ"),   "display": make_display_chars("ษ"),   "has_hand": True},
            {"index": 2, "raw": make_raw_chars("า"),   "display": make_display_chars("า"),   "has_hand": True},
            {"index": 3, "raw": make_raw_pair("ษ", "า"), "display": make_display_chars("ษา"), "has_hand": False},
        ]
    },
    {
        "lesson_number": 31,
        "title": "บทเรียน 31: ฎ, ฏ, ฎฏ",
        "levels": [
            {"index": 1, "raw": make_raw_chars("ฎ"),   "display": make_display_chars("ฎ"),   "has_hand": True},
            {"index": 2, "raw": make_raw_chars("ฏ"),   "display": make_display_chars("ฏ"),   "has_hand": True},
            {"index": 3, "raw": make_raw_pair("ฎ", "ฏ"), "display": make_display_chars("ฎฏ"), "has_hand": False},
        ]
    },
    {
        "lesson_number": 32,
        "title": "บทเรียน 32: ฉ, ซ, ฉซ",
        "levels": [
            {"index": 1, "raw": make_raw_chars("ฉ"),   "display": make_display_chars("ฉ"),   "has_hand": True},
            {"index": 2, "raw": make_raw_chars("ซ"),   "display": make_display_chars("ซ"),   "has_hand": True},
            {"index": 3, "raw": make_raw_pair("ฉ", "ซ"), "display": make_display_chars("ฉซ"), "has_hand": False},
        ]
    },
    {
        "lesson_number": 33,
        "title": "บทเรียน 33: ฆ, ฑ, ฆฑ",
        "levels": [
            {"index": 1, "raw": make_raw_chars("ฆ"),   "display": make_display_chars("ฆ"),   "has_hand": True},
            {"index": 2, "raw": make_raw_chars("ฑ"),   "display": make_display_chars("ฑ"),   "has_hand": True},
            {"index": 3, "raw": make_raw_pair("ฆ", "ฑ"), "display": make_display_chars("ฆฑ"), "has_hand": False},
        ]
    },
{
    "lesson_number": 34,
    "title": "บทเรียน 34: ฮ, ้, ฮ้",
    "levels": [
        {"index": 1, "raw": make_raw_chars("ฮ"), "display": make_display_chars("ฮ"), "has_hand": True},
        {"index": 2, "raw": make_raw_chars("้"), "display": make_display_chars("้"), "has_hand": True},
        {"index": 3, "raw": make_raw_pair("ฮ", "้"), "display": make_display_chars("ฮ้"), "has_hand": False},
    ]
},
    {
        "lesson_number": 35,
        "title": "บทเรียน 35: ฬ, ฮ, ฬฮ",
        "levels": [
            {"index": 1, "raw": make_raw_chars("ฬ"),   "display": make_display_chars("ฬ"),   "has_hand": True},
            {"index": 2, "raw": make_raw_chars("ฮ"),   "display": make_display_chars("ฮ"),   "has_hand": True},
            {"index": 3, "raw": make_raw_pair("ฬ", "ฮ"), "display": make_display_chars("ฬฮ"), "has_hand": False},
        ]
    },
{
    "lesson_number": 36,
    "title": "บทเรียน 36: ด, ๊, ด๊",
    "levels": [
        {"index": 1, "raw": make_raw_chars("ด"), "display": make_display_chars("ด"), "has_hand": True},
        {"index": 2, "raw": make_raw_chars("๊"), "display": make_display_chars("๊"), "has_hand": True},
        {"index": 3, "raw": make_raw_pair("ด", "๊"), "display": make_display_chars("ด๊"), "has_hand": False},
    ]
},
    {
        "lesson_number": 37,
        "title": "บทเรียน 37: ฯ, ฌ, ฌฯ",
        "levels": [
            {"index": 1, "raw": make_raw_chars("ฯ"),   "display": make_display_chars("ฯ"),   "has_hand": True},
            {"index": 2, "raw": make_raw_chars("ฌ"),   "display": make_display_chars("ฌ"),   "has_hand": True},
            {"index": 3, "raw": make_raw_pair("ฯ", "ฌ"), "display": make_display_chars("ฯฌ"), "has_hand": False},
        ]
    },
{
    "lesson_number": 38,
    "title": "บทเรียน 38: บ, ๋, บ๋",
    "levels": [
        {"index": 1, "raw": make_raw_chars("บ"), "display": make_display_chars("บ"), "has_hand": True},
        {"index": 2, "raw": make_raw_chars("๋"), "display": make_display_chars("๋"), "has_hand": True},
        {"index": 3, "raw": make_raw_pair("บ", "๋"), "display": make_display_chars("บ๋"), "has_hand": False},
    ]
},
{
    "lesson_number": 39,
    "title": "บทเรียน 39: ร, ์, ร์",
    "levels": [
        {"index": 1, "raw": make_raw_chars("ร"), "display": make_display_chars("ร"), "has_hand": True},
        {"index": 2, "raw": make_raw_chars("์"), "display": make_display_chars("์"), "has_hand": True},
        {"index": 3, "raw": make_raw_pair("ร", "์"), "display": make_display_chars("ร์"), "has_hand": False},
    ]
},
    {
        "lesson_number": 40,
        "title": "บทเรียน 40: ๐, ๑, ๐๑",
        "levels": [
            {"index": 1, "raw": make_raw_chars("๐"),   "display": make_display_chars("๐"),   "has_hand": True},
            {"index": 2, "raw": make_raw_chars("๑"),   "display": make_display_chars("๑"),   "has_hand": True},
            {"index": 3, "raw": make_raw_pair("๐", "๑"), "display": make_display_chars("๐๑"), "has_hand": False},
        ]
    },
    {
        "lesson_number": 41,
        "title": "บทเรียน 41: ๒, ๓, ๒๓",
        "levels": [
            {"index": 1, "raw": make_raw_chars("๒"),   "display": make_display_chars("๒"),   "has_hand": True},
            {"index": 2, "raw": make_raw_chars("๓"),   "display": make_display_chars("๓"),   "has_hand": True},
            {"index": 3, "raw": make_raw_pair("๒", "๓"), "display": make_display_chars("๒๓"), "has_hand": False},
        ]
    },
    {
        "lesson_number": 42,
        "title": "บทเรียน 42: ๓, ๔, ๓๔",
        "levels": [
            {"index": 1, "raw": make_raw_chars("๓"),   "display": make_display_chars("๓"),   "has_hand": True},
            {"index": 2, "raw": make_raw_chars("๔"),   "display": make_display_chars("๔"),   "has_hand": True},
            {"index": 3, "raw": make_raw_pair("๓", "๔"), "display": make_display_chars("๓๔"), "has_hand": False},
        ]
    },
    {
        "lesson_number": 43,
        "title": "บทเรียน 43: ๕, ๖, ๕๖",
        "levels": [
            {"index": 1, "raw": make_raw_chars("๕"),   "display": make_display_chars("๕"),   "has_hand": True},
            {"index": 2, "raw": make_raw_chars("๖"),   "display": make_display_chars("๖"),   "has_hand": True},
            {"index": 3, "raw": make_raw_pair("๕", "๖"), "display": make_display_chars("๕๖"), "has_hand": False},
        ]
    },
    {
        "lesson_number": 44,
        "title": "บทเรียน 44: ๗, ๘, ๗๘",
        "levels": [
            {"index": 1, "raw": make_raw_chars("๗"),   "display": make_display_chars("๗"),   "has_hand": True},
            {"index": 2, "raw": make_raw_chars("๘"),   "display": make_display_chars("๘"),   "has_hand": True},
            {"index": 3, "raw": make_raw_pair("๗", "๘"), "display": make_display_chars("๗๘"), "has_hand": False},
        ]
    },
    {
        "lesson_number": 45,
        "title": "บทเรียน 45: ๘, ๙, ๘๙",
        "levels": [
            {"index": 1, "raw": make_raw_chars("๘"),   "display": make_display_chars("๘"),   "has_hand": True},
            {"index": 2, "raw": make_raw_chars("๙"),   "display": make_display_chars("๙"),   "has_hand": True},
            {"index": 3, "raw": make_raw_pair("๘", "๙"), "display": make_display_chars("๘๙"), "has_hand": False},
        ]
    },
]


app = create_app()

with app.app_context():
    print("=== RESET DB ===")
    db.drop_all()
    db.create_all()

    print("=== INSERT DATA ===")
    global_idx = 1

    for lesson_data in DATA:
        lesson = TypingLesson(
            lesson_number=lesson_data["lesson_number"],
            title=lesson_data["title"],
        )
        db.session.add(lesson)
        db.session.flush()

        for lv in lesson_data["levels"]:
            row = TypingLevel(
                lesson_id=lesson.id,
                level_index=lv["index"],
                global_index=global_idx,
                raw_chars=lv["raw"],
                display_chars=lv["display"],
                has_hand_images=lv["has_hand"],
            )
            db.session.add(row)
            global_idx += 1

    db.session.commit()

    print("=====================================")
    print(f"Done! Lessons={TypingLesson.query.count()}, Levels={TypingLevel.query.count()}")
    print("=====================================")
