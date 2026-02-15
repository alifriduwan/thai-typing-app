from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from extensions import db
from models import SpellingProgress
from models import SpellingLevel

bp = Blueprint("spelling", __name__, url_prefix="/api/spelling")

@bp.get("/state")
@jwt_required()
def spelling_state():
    uid = int(get_jwt_identity())
    max_completed = (
        db.session.query(db.func.max(SpellingProgress.level))
        .filter(SpellingProgress.user_id == uid)
        .scalar()
    ) or 0

    next_level = max_completed + 1
    if next_level < 1:
        next_level = 1

    return jsonify({
        "max_completed_level": int(max_completed),
        "next_level": int(next_level),
    })


@bp.post("/complete")
@jwt_required()
def complete():
    uid = int(get_jwt_identity())
    data = request.get_json() or {}
    level = int(data.get("level") or 0)
    correct = bool(data.get("correct"))

    if level <= 0:
        return jsonify({"error": "invalid level"}), 400

    max_completed = db.session.query(func.coalesce(func.max(SpellingProgress.level), 0))\
                              .filter(SpellingProgress.user_id == uid).scalar() or 0
    expected_next = max_completed + 1

    if not correct:
        row = SpellingProgress.query.filter_by(user_id=uid, level=level).first()
        if row:
            row.attempts = (row.attempts or 0) + 1
            db.session.commit()
        return jsonify({"ok": True, "unlocked_next": False})

    if level > expected_next:
        return jsonify({"error": f"level {level} is locked, next allowed is {expected_next}"}), 400

    row = SpellingProgress.query.filter_by(user_id=uid, level=level).first()
    if row:
        row.attempts = (row.attempts or 0) + 1
    else:
        row = SpellingProgress(user_id=uid, level=level, attempts=1)
        db.session.add(row)
    db.session.commit()

    return jsonify({"ok": True, "unlocked_next": True, "next_level": level + 1})

@bp.get("/levels")
def list_levels():
    rows = (SpellingLevel.query
            .filter_by(is_active=True)
            .order_by(SpellingLevel.level.asc())
            .all())
    return jsonify([
        {"id": r.level, "name": f"Level {r.level}"}
        for r in rows
    ])

@bp.get("/level/<int:level>")
@jwt_required(optional=True)
def get_level(level: int):
    row = SpellingLevel.query.filter_by(level=level, is_active=True).first()
    if not row:
        return jsonify({"error": "level not found"}), 404

    uid = get_jwt_identity()
    if uid:
        uid = int(uid)
        max_completed = (
            db.session.query(func.max(SpellingProgress.level))
            .filter(SpellingProgress.user_id == uid)
            .scalar()
        ) or 0
        if level > max_completed + 1:
            return jsonify({
                "error": "locked",
                "allowed_next": int(max_completed + 1),
            }), 403

    return jsonify({
        "level": row.level,
        "correctWord": row.correct_word,
        "options": row.options,
    })