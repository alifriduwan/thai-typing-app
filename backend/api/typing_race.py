# api/typing_race.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from extensions import db
from models import TypingRaceLevel, TypingRaceProgress

bp = Blueprint("typing_race", __name__, url_prefix="/api/typing-race")

@bp.get("/levels")
def list_levels():
    rows = TypingRaceLevel.query.filter_by(is_active=True).order_by(TypingRaceLevel.level.asc()).all()
    return jsonify([
        {"id": r.level, "name": f"Level {r.level}", "bot_wpm": r.bot_wpm}
        for r in rows
    ])

@bp.get("/level/<int:level>")
def get_level(level):
    row = TypingRaceLevel.query.filter_by(level=level, is_active=True).first()
    if not row:
        return jsonify({"error": "level not found"}), 404
    return jsonify({
        "level": row.level,
        "text": row.text,
        "bot_wpm": row.bot_wpm,
    })

@bp.post("/complete")
@jwt_required()
def complete_level():
    uid = int(get_jwt_identity())
    data = request.get_json() or {}
    level = int(data.get("level") or 0)
    accuracy = int(data.get("accuracy") or 0)
    winner = data.get("winner")

    if level <= 0:
        return jsonify({"error": "invalid level"}), 400

    row = TypingRaceProgress.query.filter_by(user_id=uid, level=level).first()
    if row:
        row.attempts += 1
        row.accuracy = accuracy
        row.winner = winner
    else:
        row = TypingRaceProgress(
            user_id=uid,
            level=level,
            accuracy=accuracy,
            winner=winner,
            attempts=1
        )
        db.session.add(row)
    db.session.commit()
    return jsonify({"ok": True})

@bp.get("/state")
@jwt_required()
def state():
    uid = int(get_jwt_identity())
    max_completed = (
        db.session.query(func.coalesce(func.max(TypingRaceProgress.level), 0))
        .filter(TypingRaceProgress.user_id == uid, TypingRaceProgress.winner == "user")
        .scalar()
    ) or 0
    next_level = max_completed + 1
    return jsonify({
        "max_completed_level": int(max_completed),
        "next_level": int(next_level),
    })
