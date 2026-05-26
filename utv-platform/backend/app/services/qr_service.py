"""
QR Code generation service for UNA TANTUM VOCE concert tickets.
Generates QR codes that encode ticket data for venue check-in scanning.
"""
import io
import base64
import logging
import os
from typing import Optional

logger = logging.getLogger(__name__)

try:
    import qrcode
    HAS_QRCODE = True
except ImportError:
    logger.warning("[QR Service] qrcode library not installed. QR codes will be disabled.")
    HAS_QRCODE = False


def generate_ticket_qr_base64(ticket_number: str, concert_id: int, user_email: str) -> Optional[str]:
    """
    Generate a QR code for a concert ticket.
    Returns a base64 data URL string (data:image/png;base64,...) or None on failure.
    The QR encodes a JSON-like verification string for venue scanning.
    """
    payload = f"UTV:TICKET:{ticket_number}:CONCERT:{concert_id}:USER:{user_email}"

    if not HAS_QRCODE:
        logger.info(f"[QR Service] Skipped QR for ticket {ticket_number} (qrcode not installed)")
        return None

    try:
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=10,
            border=4,
        )
        qr.add_data(payload)
        qr.make(fit=True)

        img = qr.make_image(fill_color="#1a1410", back_color="white")

        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)

        b64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        return f"data:image/png;base64,{b64}"

    except Exception as e:
        logger.error(f"[QR Service] Failed to generate QR code for ticket {ticket_number}: {e}")
        return None


def save_qr_to_local(ticket_number: str, concert_id: int, user_email: str) -> Optional[str]:
    """
    Generate QR code and save to local uploads/qrcodes/ folder.
    Returns the relative URL path (/uploads/qrcodes/ticket_XXX.png) or None on failure.
    """
    if not HAS_QRCODE:
        return None

    try:
        payload = f"UTV:TICKET:{ticket_number}:CONCERT:{concert_id}:USER:{user_email}"

        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=10,
            border=4,
        )
        qr.add_data(payload)
        qr.make(fit=True)

        img = qr.make_image(fill_color="#1a1410", back_color="white")

        # Save to uploads/qrcodes/
        qr_dir = os.path.join("uploads", "qrcodes")
        os.makedirs(qr_dir, exist_ok=True)

        safe_ticket_number = ticket_number.replace(" ", "_").replace("/", "-")
        filename = f"ticket_{safe_ticket_number}.png"
        filepath = os.path.join(qr_dir, filename)

        img.save(filepath)
        logger.info(f"[QR Service] Saved QR code to {filepath}")

        return f"/uploads/qrcodes/{filename}"

    except Exception as e:
        logger.error(f"[QR Service] Failed to save QR code for ticket {ticket_number}: {e}")
        return None
