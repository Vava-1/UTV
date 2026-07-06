"""
Email service for UNA TANTUM VOCE.
Uses Gmail SMTP by default. Gracefully disabled when EMAIL_USER/EMAIL_PASS are not set.

To enable:
  1. Enable 2FA on your Gmail account
  2. Create an App Password at https://myaccount.google.com/apppasswords
  3. Set EMAIL_USER=your@gmail.com and EMAIL_PASS=your-app-password in .env
  4. Set EMAIL_ENABLED=True in .env
"""

import smtplib
import ssl
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import List, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

# ─── HTML Email Templates ────────────────────────────────────────────────────

ORDER_CONFIRMATION_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {{ font-family: 'Georgia', serif; background: #f8f4ee; color: #1a1410; margin: 0; padding: 0; }}
    .container {{ max-width: 600px; margin: 40px auto; background: #ffffff; border: 1px solid #e8dcc8; }}
    .header {{ background: #1a1410; padding: 32px; text-align: center; }}
    .header h1 {{ color: #c9a96e; font-size: 24px; letter-spacing: 3px; margin: 0; }}
    .header p {{ color: #7a6e62; font-size: 12px; letter-spacing: 2px; margin: 8px 0 0; }}
    .body {{ padding: 40px; }}
    .body h2 {{ color: #1a1410; font-size: 20px; }}
    .order-item {{ border-bottom: 1px solid #e8dcc8; padding: 12px 0; display: flex; justify-content: space-between; }}
    .total {{ font-weight: bold; font-size: 18px; color: #c9a96e; padding-top: 16px; }}
    .footer {{ background: #f0e9dc; padding: 24px; text-align: center; font-size: 12px; color: #7a6e62; }}
    .btn {{ display: inline-block; background: #c9a96e; color: #1a1410; padding: 12px 32px; text-decoration: none; font-weight: bold; letter-spacing: 1px; margin-top: 24px; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>UNA TANTUM VOCE</h1>
      <p>MUSIC DEVELOPMENT FOR ALL</p>
    </div>
    <div class="body">
      <h2>Order Confirmed ✓</h2>
      <p>Dear {customer_name},</p>
      <p>Thank you for your purchase. Your order <strong>#{order_id}</strong> has been confirmed.</p>
      <h3>Order Summary</h3>
      {items_html}
      <div class="total">Total: ${total_amount} {currency}</div>
      <br>
      <a href="{frontend_url}/orders" class="btn">VIEW MY ORDERS</a>
    </div>
    <div class="footer">
      <p>© 2024 UNA TANTUM VOCE. All rights reserved.</p>
      <p>Music Development for All</p>
    </div>
  </div>
</body>
</html>
"""

WELCOME_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {{ font-family: 'Georgia', serif; background: #f8f4ee; color: #1a1410; margin: 0; padding: 0; }}
    .container {{ max-width: 600px; margin: 40px auto; background: #ffffff; border: 1px solid #e8dcc8; }}
    .header {{ background: #1a1410; padding: 32px; text-align: center; }}
    .header h1 {{ color: #c9a96e; font-size: 24px; letter-spacing: 3px; margin: 0; }}
    .body {{ padding: 40px; }}
    .btn {{ display: inline-block; background: #c9a96e; color: #1a1410; padding: 12px 32px; text-decoration: none; font-weight: bold; letter-spacing: 1px; margin-top: 16px; }}
    .footer {{ background: #f0e9dc; padding: 24px; text-align: center; font-size: 12px; color: #7a6e62; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>UNA TANTUM VOCE</h1>
    </div>
    <div class="body">
      <h2>Welcome, {name}!</h2>
      <p>You've successfully subscribed to the UNA TANTUM VOCE newsletter.</p>
      <p>You'll receive updates about new compositions, concerts, publications, and exclusive content.</p>
      <a href="{frontend_url}/discover" class="btn">EXPLORE OUR MUSIC</a>
    </div>
    <div class="footer">
      <p>© 2024 UNA TANTUM VOCE</p>
      <p><a href="{frontend_url}/unsubscribe?email={email}">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
"""

NEWSLETTER_WRAPPER = """
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {{ font-family: 'Georgia', serif; background: #f8f4ee; color: #1a1410; margin: 0; padding: 0; }}
    .container {{ max-width: 600px; margin: 40px auto; background: #ffffff; border: 1px solid #e8dcc8; }}
    .header {{ background: #1a1410; padding: 32px; text-align: center; }}
    .header h1 {{ color: #c9a96e; font-size: 22px; letter-spacing: 3px; margin: 0; }}
    .content {{ padding: 40px; }}
    .footer {{ background: #f0e9dc; padding: 24px; text-align: center; font-size: 12px; color: #7a6e62; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>UNA TANTUM VOCE</h1>
    </div>
    <div class="content">
      {content}
    </div>
    <div class="footer">
      <p>© 2024 UNA TANTUM VOCE — Music Development for All</p>
      <p><a href="{frontend_url}/unsubscribe?email={{email}}">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
"""


# ─── Email Sending Functions ──────────────────────────────────────────────────

def _send_email(
    to_email: str,
    subject: str,
    html_body: str,
    text_body: Optional[str] = None
) -> bool:
    """
    Core email sending function via SMTP.
    Returns True on success, False on failure.
    Email is silently skipped if EMAIL_ENABLED is False.
    """
    if not settings.EMAIL_ENABLED or not settings.EMAIL_USER or not settings.EMAIL_PASS:
        logger.info(f"[Email] Skipped (EMAIL_ENABLED=False). Would send to: {to_email} | Subject: {subject}")
        return True  # Silent skip — don't fail operations due to email

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.EMAIL_FROM
        msg["To"] = to_email

        if text_body:
            msg.attach(MIMEText(text_body, "plain", "utf-8"))
        msg.attach(MIMEText(html_body, "html", "utf-8"))

        context = ssl.create_default_context()
        with smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT) as server:
            server.ehlo()
            server.starttls(context=context)
            server.login(settings.EMAIL_USER, settings.EMAIL_PASS)
            server.sendmail(settings.EMAIL_USER, to_email, msg.as_string())

        logger.info(f"[Email] Sent to {to_email}: {subject}")
        return True

    except Exception as e:
        logger.error(f"[Email] Failed to send to {to_email}: {e}")
        return False


def _send_bulk_email(
    recipients: List[str],
    subject: str,
    html_body: str,
    text_body: Optional[str] = None
) -> dict:
    """Send to multiple recipients. Returns summary stats."""
    if not settings.EMAIL_ENABLED or not settings.EMAIL_USER or not settings.EMAIL_PASS:
        logger.info(f"[Email] Bulk send skipped (EMAIL_ENABLED=False). Would send to {len(recipients)} recipients.")
        return {"sent": 0, "failed": 0, "skipped": len(recipients)}

    sent = 0
    failed = 0

    try:
        context = ssl.create_default_context()
        with smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT) as server:
            server.ehlo()
            server.starttls(context=context)
            server.login(settings.EMAIL_USER, settings.EMAIL_PASS)

            for email in recipients:
                try:
                    msg = MIMEMultipart("alternative")
                    msg["Subject"] = subject
                    msg["From"] = settings.EMAIL_FROM
                    msg["To"] = email

                    if text_body:
                        msg.attach(MIMEText(text_body, "plain", "utf-8"))
                    msg.attach(MIMEText(html_body, "html", "utf-8"))

                    server.sendmail(settings.EMAIL_USER, email, msg.as_string())
                    sent += 1
                except Exception as e:
                    logger.error(f"[Email] Failed to send to {email}: {e}")
                    failed += 1

    except Exception as e:
        logger.error(f"[Email] Bulk send failed: {e}")
        return {"sent": sent, "failed": len(recipients) - sent, "error": str(e)}

    return {"sent": sent, "failed": failed}


# ─── Convenience Functions ────────────────────────────────────────────────────

def send_order_confirmation(
    to_email: str,
    customer_name: str,
    order_id: int,
    items: List[dict],
    total_amount: float,
    currency: str = "USD"
) -> bool:
    """Send order confirmation email with itemized receipt."""
    items_html = ""
    for item in items:
        items_html += f"""
        <div class="order-item">
          <span>{item.get('title', 'Item')}</span>
          <span>${item.get('price', 0):.2f}</span>
        </div>
        """

    html = ORDER_CONFIRMATION_TEMPLATE.format(
        customer_name=customer_name or "Valued Customer",
        order_id=order_id,
        items_html=items_html,
        total_amount=f"{total_amount:.2f}",
        currency=currency,
        frontend_url=settings.FRONTEND_URL
    )

    return _send_email(
        to_email=to_email,
        subject=f"UNA TANTUM VOCE — Order Confirmation #{order_id}",
        html_body=html,
        text_body=f"Order #{order_id} confirmed. Total: ${total_amount:.2f} {currency}"
    )


def send_welcome_email(to_email: str, name: Optional[str] = None) -> bool:
    """Send welcome email to new newsletter subscriber."""
    html = WELCOME_TEMPLATE.format(
        name=name or "Music Lover",
        email=to_email,
        frontend_url=settings.FRONTEND_URL
    )

    return _send_email(
        to_email=to_email,
        subject="Welcome to UNA TANTUM VOCE — Music Development for All",
        html_body=html,
        text_body=f"Welcome! You've subscribed to UNA TANTUM VOCE newsletter."
    )


def send_newsletter(
    recipients: List[str],
    subject: str,
    body_html: str,
    body_text: Optional[str] = None
) -> dict:
    """Send newsletter to all active subscribers."""
    # Wrap content in branded template
    wrapped_html = NEWSLETTER_WRAPPER.format(
        content=body_html,
        frontend_url=settings.FRONTEND_URL
    )

    return _send_bulk_email(
        recipients=recipients,
        subject=f"UNA TANTUM VOCE — {subject}",
        html_body=wrapped_html,
        text_body=body_text
    )
