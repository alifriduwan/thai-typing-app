from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from extensions import db
from models import TypingFallLevel, TypingFallProgress

bp = Blueprint("typing_fall", __name__, url_prefix="/api/typing_fall")

@bp.get("/levels")
def list_levels():
    rows = (TypingFallLevel.query
            .filter_by(is_active=True)
            .order_by(TypingFallLevel.level.asc())
            .all())
    return jsonify([{"id": r.level, "name": f"Level {r.level}"} for r in rows])

@bp.get("/level/<int:level>")
@jwt_required(optional=True)
def get_level(level: int):
    row = TypingFallLevel.query.filter_by(level=level, is_active=True).first()
    if not row:
        return jsonify({"error": "level not found"}), 404

    uid = get_jwt_identity()
    if uid:
        uid = int(uid)
        max_completed = (
            db.session.query(func.max(TypingFallProgress.level))
            .filter(TypingFallProgress.user_id == uid)
            .scalar()
        ) or 0
        if level > max_completed + 1:
            return jsonify({"error": "locked", "allowed_next": int(max_completed + 1)}), 403

    return jsonify({
        "level": row.level,
        "fall_speed": row.fall_speed,
        "spawn_interval_ms": row.spawn_interval_ms,
        "max_concurrent": row.max_concurrent,
        "target_words": row.target_words,
        "word_pool": row.word_pool,
    })

@bp.get("/state")
@jwt_required()
def state():
    uid = int(get_jwt_identity())
    max_completed = (
        db.session.query(func.max(TypingFallProgress.level))
        .filter(TypingFallProgress.user_id == uid)
        .scalar()
    ) or 0
    return jsonify({
        "max_completed_level": int(max_completed),
        "next_level": int(max_completed + 1),
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

    if not correct:
        row = TypingFallProgress.query.filter_by(user_id=uid, level=level).first()
        if row:
            row.attempts = (row.attempts or 0) + 1
            db.session.commit()
        return jsonify({"ok": True, "unlocked_next": False})

    max_completed = db.session.query(func.coalesce(func.max(TypingFallProgress.level), 0))\
                              .filter(TypingFallProgress.user_id == uid).scalar()
    expected_next = max_completed + 1
    if level > expected_next:
        return jsonify({"error": f"level {level} is locked, next allowed is {expected_next}"}), 400

    row = TypingFallProgress.query.filter_by(user_id=uid, level=level).first()
    if not row:
        row = TypingFallProgress(user_id=uid, level=level, attempts=1)
        db.session.add(row)
    else:
        row.attempts = (row.attempts or 0) + 1
    db.session.commit()

    return jsonify({"ok": True, "unlocked_next": True, "next_level": level + 1})
