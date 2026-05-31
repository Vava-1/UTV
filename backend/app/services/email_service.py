"""Email service for transactional emails using SMTP+TLS."""

import logging
from typing import Optional

import emails
from jinja2 import Template

from app.config import settings

logger = logging.getLogger(__name__)


def _base_template(subject: str, content: str) -> str:
    """Generate HTML email with UTV branding.

    Args:
        subject: Email subject line.
        content: HTML body content.

    Returns:
        Full HTML email string.
    """
    return f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{subject}</title>
    <style>
        body {{ margin: 0; padding: 0; font-family: 'Inter', Arial, sans-serif; background: #0A0F1E; color: #B8C2D8; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #0A0F1E, #1A2540); padding: 30px; text-align: center; border-bottom: 3px solid #C9A84C; }}
        .header h1 {{ color: #C9A84C; margin: 0; font-size: 24px; font-family: 'Playfair Display', Georgia, serif; }}
        .header p {{ color: #F0EBE0; margin: 5px 0 0; font-size: 14px; }}
        .body {{ background: #1A2540; padding: 30px; border-radius: 0 0 8px 8px; }}
        .body h2 {{ color: #F0EBE0; font-size: 18px; margin-top: 0; }}
        .body p {{ line-height: 1.6; font-size: 14px; }}
        .cta {{ display: inline-block; background: #C9A84C; color: #0A0F1E; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 15px 0; }}
        .footer {{ text-align: center; padding: 20px; font-size: 12px; color: #666; }}
        .footer a {{ color: #C9A84C; }}
        .divider {{ border: none; border-top: 1px solid #2A3550; margin: 20px 0; }}
        .detail-row {{ display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #2A3550; }}
        .detail-label {{ color: #F0EBE0; font-weight: bold; }}
        .gold {{ color: #C9A84C; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>UNA TANTUM VOCE</h1>
            <p>One Voice, One Time</p>
        </div>
        <div class="body">
            {content}
        </div>
        <div class="footer">
            <p>&copy; 2024 Una Tantum Voce. All rights reserved.</p>
            <p><a href="{settings.FRONTEND_URL}">Visit our platform</a></p>
        </div>
    </div>
</body>
</html>"""


def _send_email(to_email: str, subject: str, html_body: str) -> bool:
    """Send an email via SMTP.

    Args:
        to_email: Recipient email address.
        subject: Email subject.
        html_body: Full HTML email body.

    Returns:
        True if sent successfully.
    """
    if not settings.SMTP_USER or not settings.SMTP_PASS:
        logger.warning("SMTP not configured, skipping email send")
        return False

    try:
        message = emails.Message(
            subject=subject,
            html=html_body,
            mail_from=("UTV Platform", settings.SMTP_USER),
        )
        response = message.send(
            to=to_email,
            smtp={
                "host": settings.SMTP_HOST,
                "port": settings.SMTP_PORT,
                "tls": True,
                "user": settings.SMTP_USER,
                "password": settings.SMTP_PASS,
            },
        )
        logger.info(f"Email sent to {to_email}: {response.status_code}")
        return response.status_code == 250
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        return False


async def send_welcome_email(name: str, to_email: str, verify_url: str) -> bool:
    """Send welcome email with verification link.

    Args:
        name: User's first name.
        to_email: User's email address.
        verify_url: Email verification URL.

    Returns:
        True if sent successfully.
    """
    content = f"""
        <h2>Welcome to Una Tantum Voce, {name}!</h2>
        <p>Thank you for joining our community of classical and gospel music lovers.
        We're excited to have you on board.</p>
        <p>To get started, please verify your email address:</p>
        <a href="{verify_url}" class="cta">Verify My Email</a>
        <p style="font-size: 12px; color: #666;">If you didn't create an account,
        you can safely ignore this email.</p>
    """
    html = _base_template("Welcome to UTV", content)
    return _send_email(to_email, "Welcome to Una Tantum Voce", html)


async def send_order_confirmation_email(order, user) -> bool:
    """Send order confirmation email with download links.

    Args:
        order: Order model instance.
        user: User model instance.

    Returns:
        True if sent successfully.
    """
    items_html = ""
    for item in order.items:
        items_html += f"""
        <div class="detail-row">
            <span class="detail-label">{item.item_type.value.title()} (x{item.quantity})</span>
            <span class="gold">${item.unit_price * item.quantity:.2f}</span>
        </div>
        """

    download_section = ""
    for item in order.items:
        if item.watermarked_url:
            download_section += f"""
            <p><a href="{item.watermarked_url}" class="cta">Download {item.item_type.value.title()}</a></p>
            """

    content = f"""
        <h2>Order Confirmation</h2>
        <p>Thank you for your purchase, {user.first_name or user.username}!</p>
        <p>Your order has been confirmed and is being processed.</p>
        <hr class="divider">
        <div class="detail-row">
            <span class="detail-label">Order ID</span>
            <span>{str(order.id)[:8]}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Status</span>
            <span class="gold">{order.status.value.upper()}</span>
        </div>
        {items_html}
        <div class="detail-row" style="border-top: 2px solid #C9A84C; margin-top: 10px; padding-top: 10px;">
            <span class="detail-label">Total</span>
            <span class="gold" style="font-size: 18px;">${order.total_amount:.2f}</span>
        </div>
        {download_section}
    """
    html = _base_template("Order Confirmation", content)
    return _send_email(user.email, "Your UTV Order Confirmation", html)


async def send_ticket_email(
    name: str,
    to_email: str,
    event_title: str,
    event_date: str,
    venue: str,
    ticket_code: str,
    qr_url: str,
) -> bool:
    """Send ticket email with QR code.

    Args:
        name: User's first name.
        to_email: User's email address.
        event_title: Event title.
        event_date: Formatted event date string.
        venue: Venue name.
        ticket_code: Unique ticket code.
        qr_url: QR code image URL.

    Returns:
        True if sent successfully.
    """
    content = f"""
        <h2>Your Event Ticket</h2>
        <p>Hi {name}, here is your ticket for:</p>
        <div style="background: #0A0F1E; padding: 20px; border-radius: 8px; margin: 15px 0;">
            <h3 style="color: #C9A84C; margin: 0;">{event_title}</h3>
            <p style="margin: 5px 0;">Date: {event_date}</p>
            <p style="margin: 5px 0;">Venue: {venue}</p>
            <p style="margin: 5px 0; font-family: monospace; background: #1A2540; padding: 5px;">
                Code: {ticket_code}
            </p>
        </div>
        <img src="{qr_url}" alt="QR Code" style="max-width: 200px; margin: 15px auto; display: block;">
        <p>Please present this QR code at the entrance. Enjoy the event!</p>
    """
    html = _base_template("Your Event Ticket", content)
    return _send_email(to_email, f"Your Ticket: {event_title}", html)


async def send_password_reset_email(name: str, to_email: str, reset_url: str) -> bool:
    """Send password reset email.

    Args:
        name: User's first name.
        to_email: User's email address.
        reset_url: Password reset URL with token.

    Returns:
        True if sent successfully.
    """
    content = f"""
        <h2>Password Reset Request</h2>
        <p>Hi {name}, we received a request to reset your password.</p>
        <p>Click the button below to set a new password. This link expires in 1 hour.</p>
        <a href="{reset_url}" class="cta">Reset My Password</a>
        <p style="font-size: 12px; color: #666;">If you didn't request a password reset,
        please ignore this email or contact support.</p>
    """
    html = _base_template("Password Reset", content)
    return _send_email(to_email, "UTV Password Reset Request", html)
