from flask import current_app
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail


def send_reset_email(to_email: str, reset_link: str):
    message = Mail(
        from_email=current_app.config["MAIL_FROM"],
        to_emails=to_email,
        subject="Reset your password",
        html_content=f"""
        <p>คุณได้ทำการขอรีเซ็ตรหัสผ่าน</p>
        <p>คลิกลิงก์ด้านล่าง:</p>
        <p><a href="{reset_link}">{reset_link}</a></p>
        <p>ลิงก์จะหมดอายุใน 30 นาที</p>
        """
    )

    sg = SendGridAPIClient(current_app.config["SENDGRID_API_KEY"])
    sg.send(message)
