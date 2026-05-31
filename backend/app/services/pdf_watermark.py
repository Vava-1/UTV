"""PDF watermarking service using ReportLab and PyPDF2."""

import io
import logging
from typing import Optional

import PyPDF2
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

logger = logging.getLogger(__name__)


def create_watermark_page(email: str) -> bytes:
    """Create a single-page watermark PDF with diagonal UTV branding.

    Args:
        email: The licensed purchaser's email address.

    Returns:
        PDF bytes containing the watermark overlay page.
    """
    packet = io.BytesIO()
    c = canvas.Canvas(packet, pagesize=A4)
    width, height = A4  # 595.27 x 841.89 points

    # Save canvas state
    c.saveState()

    # Set watermark styling - gold color with low alpha
    c.setFillColorRGB(0.78, 0.66, 0.30)  # Gold #C9A84C
    c.setFillAlpha(0.12)

    # Center and rotate for diagonal watermark
    c.translate(width / 2, height / 2)
    c.rotate(45)
    c.setFont("Helvetica-Bold", 42)
    c.drawCentredString(0, 0, "UNA TANTUM VOCE")

    # Restore state for footer text
    c.restoreState()

    # Footer with purchaser info
    c.setFont("Helvetica", 8)
    c.setFillColorRGB(0.4, 0.4, 0.4)
    c.setFillAlpha(1.0)
    footer_text = f"Licensed to: {email} | UTV Platform | Not for redistribution"
    c.drawCentredString(width / 2, 30, footer_text)

    c.save()
    packet.seek(0)
    return packet.getvalue()


def apply_watermark(input_bytes: bytes, email: str) -> bytes:
    """Apply UTV watermark to every page of a PDF.

    Args:
        input_bytes: The original PDF file bytes.
        email: The licensed purchaser's email address.

    Returns:
        Watermarked PDF bytes.
    """
    try:
        reader = PyPDF2.PdfReader(io.BytesIO(input_bytes))
        writer = PyPDF2.PdfWriter()

        # Create watermark page
        wm_bytes = create_watermark_page(email)
        wm_reader = PyPDF2.PdfReader(io.BytesIO(wm_bytes))
        wm_page = wm_reader.pages[0]

        # Apply watermark to each page
        for page in reader.pages:
            page.merge_page(wm_page)
            writer.add_page(page)

        # Write output
        output = io.BytesIO()
        writer.write(output)
        output.seek(0)
        return output.getvalue()

    except Exception as e:
        logger.error(f"Failed to apply watermark: {e}")
        raise


async def watermark_and_upload(
    pdf_url: str,
    email: str,
    order_item_id: str,
    s3_service,
) -> str:
    """Download a PDF, apply watermark, upload to S3, return presigned URL.

    Args:
        pdf_url: Original PDF URL or S3 key.
        email: Purchaser's email for watermark.
        order_item_id: UUID of the order item for naming.
        s3_service: S3Service instance for upload/download.

    Returns:
        Presigned URL to the watermarked PDF (24-hour expiry).
    """
    from urllib.parse import urlparse

    # Extract key from URL if full URL provided
    parsed = urlparse(pdf_url)
    if parsed.netloc:
        # It's a full URL - download it
        import httpx
        async with httpx.AsyncClient() as client:
            resp = await client.get(pdf_url)
            resp.raise_for_status()
            original_bytes = resp.content
    else:
        # It's an S3 key - download via S3 service
        original_bytes = await s3_service.download_file(pdf_url)

    # Apply watermark
    watermarked_bytes = apply_watermark(original_bytes, email)

    # Upload watermarked version
    s3_key = f"watermarked/{order_item_id}.pdf"
    await s3_service.upload_bytes(
        watermarked_bytes, s3_key, content_type="application/pdf"
    )

    # Return 24-hour presigned URL
    return await s3_service.get_presigned_url(s3_key, expiry=86400)
