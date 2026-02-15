from flask import Blueprint, request, jsonify
from sqlalchemy import func
from models import TypingText

bp = Blueprint("typing_text_api", __name__, url_prefix="/api/typing_text")

@bp.get("/random")
def random_text():
    level = (request.args.get("level") or "medium").lower()
    try:
        time_sec = int(request.args.get("time") or 60)
    except ValueError:
        time_sec = 60

    q = (TypingText.query
         .filter(TypingText.is_active.is_(True),
                 TypingText.level == level,
                 TypingText.time_sec == time_sec))

    row = q.order_by(func.random()).first()
    if not row:
        return jsonify({"error": "no_text_for_selection"}), 404

    return jsonify({
        "id": row.id,
        "level": row.level,
        "time": row.time_sec,
        "text": row.text,
    })
