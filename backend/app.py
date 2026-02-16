from flask import Flask
from dotenv import load_dotenv
from config import Config
from extensions import init_extensions
from api import register_routes
import models

from sqlalchemy import text
from extensions import db

from scripts.seed_spelling_levels import run as seed_spelling
from scripts.seed_typing_fall_levels import run as seed_fall
from scripts.seed_typing_race_levels import run as seed_race
from scripts.seed_typing_texts import run as seed_typing_texts
from scripts.seed_typing import run as seed_typing

load_dotenv()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    init_extensions(app)
    register_routes(app)

    with app.app_context():
        db.create_all()
        seed_spelling()
        seed_fall()
        seed_race()
        seed_typing_texts()
        seed_typing()

    @app.get("/")
    def index():
        return "Flask is running. Try /api/health"
    
    @app.get("/health")
    def health():
        return {"status": "ok"}

    @app.get("/api/db/health")
    def db_health():
        try:
            with db.engine.connect() as conn:
                dialect = db.engine.name
                dbname  = conn.execute(text("SELECT current_database()")).scalar()
                version = conn.execute(text("SELECT version()")).scalar()
            return {"ok": True, "dialect": dialect, "database": dbname, "version": version}
        except Exception as e:
            return {"ok": False, "error": str(e)}, 500

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host="127.0.0.1", port=5000, debug=True)
