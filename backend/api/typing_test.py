from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from extensions import db
from models import TypingTestSession

bp = Blueprint("typing_test", __name__, url_prefix="/api/typing_test")


@bp.post("/submit")
@jwt_required()
def submit():
    uid = int(get_jwt_identity())
    data = request.get_json() or {}

    level         = (data.get("level") or "").lower()
    time_sec      = int(data.get("time_sec") or 0)
    text_id       = data.get("text_id")
    wpm           = int(data.get("wpm") or 0)
    accuracy      = int(data.get("accuracy") or 0)
    correct_chars = int(data.get("correct_chars") or 0)
    total_chars   = int(data.get("total_chars") or 0)

    if level not in ("easy", "medium", "hard"):
        return jsonify({"error": "invalid level"}), 400
    if time_sec <= 0 or wpm < 0 or accuracy < 0 or total_chars < 0:
        return jsonify({"error": "invalid payload"}), 400

    row = TypingTestSession(
        user_id=uid,
        level=level,
        time_sec=time_sec,
        text_id=int(text_id) if text_id else None,
        wpm=wpm,
        accuracy=accuracy,
        correct_chars=correct_chars,
        total_chars=total_chars,
    )
    db.session.add(row)
    db.session.commit()
    return jsonify({"ok": True, "id": row.id})


@bp.get("/me/summary")
@jwt_required()
def my_summary():
    """
    สรุปผลเฉลี่ยรายวัน (ล่าสุด N วัน) + ค่าเฉลี่ยรวมช่วงนั้น แยกตาม level
    Response:
    {
      "avg_speed": 42,
      "avg_accuracy": 95,
      "history": [
        {
          "date": "25/07",
          "level": "easy",
          "ความเร็ว (wpm)": 35,
          "ความแม่นยำ (%)": 92
        },
        ...
      ]
    }
    """
    uid = int(get_jwt_identity())
    days = int(request.args.get("days", 7))
    if days <= 0 or days > 90:
        days = 7

    since = datetime.utcnow() - timedelta(days=days)

    # ค่าเฉลี่ยรวมทุก level
    overall = db.session.query(
        func.avg(TypingTestSession.wpm),
        func.avg(TypingTestSession.accuracy),
    ).filter(
        TypingTestSession.user_id == uid,
        TypingTestSession.created_at >= since
    ).first()

    avg_speed    = int(round(overall[0])) if overall and overall[0] is not None else 0
    avg_accuracy = int(round(overall[1])) if overall and overall[1] is not None else 0

    # group by วัน + level
    day_col = func.date_trunc('day', TypingTestSession.created_at)
    rows = db.session.query(
        day_col.label("day"),
        TypingTestSession.level,
        func.avg(TypingTestSession.wpm).label("avg_wpm"),
        func.avg(TypingTestSession.accuracy).label("avg_acc"),
    ).filter(
        TypingTestSession.user_id == uid,
        TypingTestSession.created_at >= since
    ).group_by(
        day_col,
        TypingTestSession.level
    ).order_by(day_col.asc()).all()

    history = []
    for r in rows:
        d = r.day.date() if hasattr(r.day, "date") else r.day
        history.append({
            "date":           d.strftime("%d/%m"),
            "level":          r.level,
            "ความเร็ว (wpm)": int(round(r.avg_wpm)) if r.avg_wpm is not None else 0,
            "ความแม่นยำ (%)": int(round(r.avg_acc)) if r.avg_acc is not None else 0,
        })

    return jsonify({
        "avg_speed":    avg_speed,
        "avg_accuracy": avg_accuracy,
        "history":      history,
    })