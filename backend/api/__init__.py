from flask import Blueprint
from .auth import bp as auth_bp
from .spelling import bp as spelling_bp
from .typing_race import bp as typing_race_bp
from .typing_fall import bp as typing_fall_bp
from .typing_text import bp as typing_text_bp
from .typing_test import bp as typing_test_bp
from .typing import bp as typing_bp

api_bp = Blueprint("api_root", __name__)

def register_routes(app):
    api_bp.register_blueprint(auth_bp)
    app.register_blueprint(api_bp)
    app.register_blueprint(spelling_bp)
    app.register_blueprint(typing_race_bp)
    app.register_blueprint(typing_fall_bp)
    app.register_blueprint(typing_text_bp) 
    app.register_blueprint(typing_test_bp)
    app.register_blueprint(typing_bp)
