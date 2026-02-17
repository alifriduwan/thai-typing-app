from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from extensions import db
from models import User
from datetime import datetime, timedelta
import secrets
from utils.email_service import send_reset_email


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

@bp.post("/forgot-password")
def forgot_password():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip()

    if not email:
        return jsonify({"error": "email required"}), 400

    user = User.query.filter_by(email=email).first()

    # ไม่บอกว่า email มีหรือไม่มี (security)
    if user:
        token = secrets.token_urlsafe(32)
        user.reset_token = token
        user.reset_token_expire = datetime.utcnow() + timedelta(minutes=30)
        db.session.commit()

        reset_link = f"{current_app.config['FRONTEND_URL']}/reset-password/{token}"
        send_reset_email(user.email, reset_link)

    return {"ok": True}


@bp.post("/forgot-password")
def forgot_password():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip()

    if not email:
        return jsonify({"error": "email required"}), 400

    user = User.query.filter_by(email=email).first()

    # ไม่บอกว่า email มีหรือไม่มี (security)
    if user:
        token = secrets.token_urlsafe(32)
        user.reset_token = token
        user.reset_token_expire = datetime.utcnow() + timedelta(minutes=30)
        db.session.commit()

        reset_link = f"{current_app.config['FRONTEND_URL']}/reset-password/{token}"
        send_reset_email(user.email, reset_link)

    return {"ok": True}


@bp.post("/reset-password")
def reset_password():
    data = request.get_json() or {}
    token = (data.get("token") or "").strip()
    password = (data.get("password") or "").strip()

    if not token or not password:
        return jsonify({"error": "token and password required"}), 400

    user = User.query.filter_by(reset_token=token).first()

    if not user:
        return jsonify({"error": "invalid token"}), 400

    if user.reset_token_expire < datetime.utcnow():
        return jsonify({"error": "token expired"}), 400

    user.set_password(password)
    user.reset_token = None
    user.reset_token_expire = None
    db.session.commit()

    return {"ok": True}
