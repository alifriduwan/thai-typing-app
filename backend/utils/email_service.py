import smtplib
from email.mime.text import MIMEText
from flask import current_app


def send_reset_email(to_email: str, reset_link: str):
    """
    ส่งอีเมลสำหรับ reset password
    """

    body = f"""
คุณได้ทำการขอรีเซ็ตรหัสผ่าน

คลิกลิงก์ด้านล่างเพื่อเปลี่ยนรหัสผ่าน:
{reset_link}

ลิงก์นี้จะหมดอายุภายใน 30 นาที

หากคุณไม่ได้เป็นผู้ขอ กรุณาเพิกเฉยอีเมลฉบับนี้
"""

    msg = MIMEText(body, _charset="utf-8")
    msg["Subject"] = "Reset your password"
    msg["From"] = current_app.config["MAIL_FROM"]
    msg["To"] = to_email

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(
            current_app.config["MAIL_USERNAME"],
            current_app.config["MAIL_PASSWORD"]
        )
        server.send_message(msg)
