import os

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt")

    db_url = os.getenv("DATABASE_URL")

    if db_url and db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

    SQLALCHEMY_DATABASE_URI = db_url or "sqlite:///app.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Email config
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
    MAIL_FROM = os.getenv("MAIL_FROM")
    FRONTEND_URL = os.getenv("FRONTEND_URL")
    SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")

