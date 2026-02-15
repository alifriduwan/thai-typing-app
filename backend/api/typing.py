from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from extensions import db
from models import TypingLesson, TypingLevel, TypingProgress
import unicodedata

bp = Blueprint("typing", __name__, url_prefix="/api/typing")

@bp.get("/state")
@jwt_required(optional=True)
def typing_state():
    uid = get_jwt_identity()
    
    total_levels = db.session.query(func.max(TypingLevel.global_index)).scalar() or 1

    if not uid:
        return jsonify({
            "max_completed_global": 0,
            "next_global": 1,
            "total_global": total_levels
        })

    uid = int(uid)

    max_global = (
        db.session.query(func.max(TypingProgress.global_index))
        .filter(TypingProgress.user_id == uid)
        .scalar()
    ) or 0

    return jsonify({
        "max_completed_global": int(max_global),
        "next_global": int(max_global + 1),
        "total_global": int(total_levels)
    })

@bp.get("/lessons")
@jwt_required(optional=True)
def list_lessons():
    rows = TypingLesson.query.order_by(TypingLesson.lesson_number.asc()).all()
    return jsonify([
        {
            "lesson_id": r.lesson_number,
            "title": r.title or f"บทเรียน {r.lesson_number}"
        }
        for r in rows
    ])

@bp.get("/lesson/<int:lesson_id>")
@jwt_required(optional=True)
def get_lesson_detail(lesson_id):
    lesson = TypingLesson.query.filter_by(lesson_number=lesson_id).first()
    if not lesson:
        return jsonify({"error": "lesson not found"}), 404

    levels = (
        TypingLevel.query
        .filter_by(lesson_id=lesson.id)
        .order_by(TypingLevel.level_index.asc())
        .all()
    )

    return jsonify({
        "lesson_id": lesson.lesson_number,
        "title": lesson.title,
        "levels": [
            {
                "level": lv.level_index,
                "global_index": lv.global_index,
                "has_hand_images": lv.has_hand_images
            }
            for lv in levels
        ]
    })


@bp.get("/level/<int:lesson_id>/<int:level_index>")
@jwt_required(optional=True)
def get_level(lesson_id, level_index):

    lesson = TypingLesson.query.filter_by(lesson_number=lesson_id).first()
    if not lesson:
        return jsonify({"error": "lesson not found"}), 404

    level = TypingLevel.query.filter_by(
        lesson_id=lesson.id,
        level_index=level_index
    ).first()

    if not level:
        return jsonify({"error": "level not found"}), 404

    uid = get_jwt_identity()
    if uid:
        uid = int(uid)

        max_global = (
            db.session.query(func.max(TypingProgress.global_index))
            .filter(TypingProgress.user_id == uid)
            .scalar()
        ) or 0

        if level.global_index > max_global + 1:
            return jsonify({
                "error": "locked",
                "allowed_global": int(max_global + 1)
            }), 403

    return jsonify({
        "lesson_id": lesson_id,
        "level_index": level_index,
        "global_index": level.global_index,
        "raw_chars": level.raw_chars,
        "display_chars": level.display_chars,
        "has_hand_images": level.has_hand_images
    })


@bp.post("/complete")
@jwt_required()
def complete_level():
    uid = int(get_jwt_identity())
    data = request.get_json() or {}

    lesson_id = int(data.get("lesson_id") or 0)
    level_index = int(data.get("level_index") or 0)
    wpm = int(data.get("wpm") or 0)
    accuracy = int(data.get("accuracy") or 0)
    mistakes = int(data.get("mistakes") or 0)
    stars = int(data.get("stars") or 1)

    lesson = TypingLesson.query.filter_by(lesson_number=lesson_id).first()
    if not lesson:
        return jsonify({"error": "lesson not found"}), 404

    level = TypingLevel.query.filter_by(
        lesson_id=lesson.id,
        level_index=level_index
    ).first()

    if not level:
        return jsonify({"error": "level not found"}), 404

    global_idx = level.global_index

    max_global = (
        db.session.query(func.max(TypingProgress.global_index))
        .filter(TypingProgress.user_id == uid)
        .scalar()
    ) or 0

    if global_idx > max_global + 1:
        return jsonify({
            "error": "locked",
            "expected_next_global": max_global + 1
        }), 403

    row = TypingProgress.query.filter_by(
        user_id=uid,
        global_index=global_idx
    ).first()

    if row:
        row.attempts += 1
        row.wpm = wpm
        row.accuracy = accuracy
        row.mistakes = mistakes
        row.stars = stars
    else:
        row = TypingProgress(
            user_id=uid,
            lesson_id=lesson.id,
            level_index=level_index,
            global_index=global_idx,
            wpm=wpm,
            accuracy=accuracy,
            mistakes=mistakes,
            stars=stars,
            attempts=1
        )
        db.session.add(row)

    db.session.commit()

    return jsonify({
        "ok": True,
        "unlocked_next": True,
        "next_global": global_idx + 1
    })


@bp.get("/analysis/map_chars")
def map_char_to_lessons():
    lessons = TypingLesson.query.order_by(TypingLesson.lesson_number).all()
    mapping = {}

    def normalize(char):
        if not char:
            return ""
        return unicodedata.normalize("NFC", char).strip()

    def split_chars(raw):
        """แยกพยางค์ไทยเป็นตัวอักษรเดี่ยว + normalize"""
        return [normalize(ch) for ch in raw if normalize(ch) != ""]

    for lesson in lessons:
        levels = TypingLevel.query.filter_by(lesson_id=lesson.id).all()

        for lv in levels:
            if not lv.raw_chars:
                continue

            for raw in lv.raw_chars:
                for ch in split_chars(raw):  
                    if ch not in mapping:
                        mapping[ch] = set()
                    mapping[ch].add(lesson.lesson_number)

    mapping = {ch: sorted(list(lesson_ids)) for ch, lesson_ids in mapping.items()}
    return jsonify(mapping)

@bp.get("/progress")
@jwt_required()
def get_progress():
    uid = int(get_jwt_identity())

    rows = TypingProgress.query.filter_by(user_id=uid).all()

    return jsonify([
        {
            "global_index": r.global_index,
            "stars": r.stars
        }
        for r in rows
    ])
