from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from extensions import db
from models import User

bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@bp.post("/signup")
def signup():
    data = request.get_json() or {}
    username = (data.get("username") or "").strip()
    password = (data.get("password") or "").strip()
    email    = (data.get("email") or "").strip() or None

    if not username or not password:
        return jsonify({"error": "username/password required"}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "username taken"}), 409
    if email and User.query.filter_by(email=email).first():
        return jsonify({"error": "email taken"}), 409

    u = User(username=username, email=email)
    u.set_password(password)
    db.session.add(u); db.session.commit()

    token = create_access_token(identity=str(u.id))
    return jsonify({"id": u.id, "username": u.username, "access_token": token}), 201

@bp.post("/login")
def login():
    data = request.get_json() or {}
    username = (data.get("username") or "").strip()
    password = (data.get("password") or "").strip()
    u = User.query.filter_by(username=username).first()
    if not u or not u.check_password(password):
        return jsonify({"error": "invalid credentials"}), 401
    token = create_access_token(identity=str(u.id))
    return jsonify({"access_token": token, "id": u.id, "username": u.username})

@bp.get("/me")
@jwt_required()
def me():
    uid = int(get_jwt_identity())
    u = User.query.get_or_404(uid)
    return jsonify({"id": u.id, "username": u.username, "email": u.email})


@bp.get("/users")
@jwt_required()
def list_users():
    limit = int(request.args.get("limit", 50))
    users = User.query.order_by(User.id.asc()).limit(limit).all()
    return jsonify([
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "created_at": u.created_at.isoformat() if u.created_at else None
        }
        for u in users
    ])


@bp.get("/test-email")
def test_email():
    from backend.utils.email_service import send_reset_email

    send_reset_email(
        to_email="abdulfeera2@gmail.com",
        reset_link="https://thai-typing-app.vercel.app/reset-password/test-token"
    )

    return {"ok": True}

