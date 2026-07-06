import io
from PyPDF2 import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.colors import HexColor
from PIL import Image
import os
import tempfile


def add_watermark_to_pdf(
    input_pdf_bytes: bytes,
    watermark_text: str,
    logo_path: str = None,
    output_path: str = None
) -> bytes:
    """
    Dynamically add watermark text and logo to a PDF.
    Returns the watermarked PDF as bytes.
    """
    # Read the original PDF
    reader = PdfReader(io.BytesIO(input_pdf_bytes))
    writer = PdfWriter()
    
    # Create watermark PDF with text and logo
    for page_num in range(len(reader.pages)):
        page = reader.pages[page_num]
        width = float(page.mediabox.width)
        height = float(page.mediabox.height)
        
        # Create watermark overlay
        packet = io.BytesIO()
        c = canvas.Canvas(packet, pagesize=(width, height))
        
        # Add semi-transparent watermark text
        c.setFillColor(HexColor("#1a1a2e"))
        c.setFont("Helvetica-Bold", 10)
        c.setFillAlpha(0.6)
        
        # Footer watermark
        footer_text = f"UNA TANTUM VOCE | Licensed to: {watermark_text}"
        c.drawString(50, 30, footer_text)
        
        # Add diagonal watermark text across page
        c.saveState()
        c.translate(width / 2, height / 2)
        c.rotate(45)
        c.setFont("Helvetica-Bold", 40)
        c.setFillAlpha(0.08)
        c.drawString(-200, 0, "UNA TANTUM VOCE")
        c.restoreState()
        
        # Add logo if provided
        if logo_path and os.path.exists(logo_path):
            try:
                c.setFillAlpha(0.5)
                c.drawImage(logo_path, width - 120, 20, width=80, height=30, preserveAspectRatio=True)
            except Exception:
                pass  # Skip logo if it fails
        
        c.save()
        packet.seek(0)
        
        # Merge watermark with original page
        watermark_pdf = PdfReader(packet)
        page.merge_page(watermark_pdf.pages[0])
        writer.add_page(page)
    
    # Write output
    output_buffer = io.BytesIO()
    writer.write(output_buffer)
    output_buffer.seek(0)
    
    return output_buffer.read()


def generate_watermarked_pdf_for_user(
    original_pdf_path: str,
    user_email: str,
    logo_path: str = None
) -> bytes:
    """
    Read original PDF and generate watermarked version for specific user.
    """
    with open(original_pdf_path, "rb") as f:
        pdf_bytes = f.read()
    
    return add_watermark_to_pdf(pdf_bytes, user_email, logo_path)


def get_pdf_page_count(pdf_bytes: bytes) -> int:
    """Get number of pages in a PDF"""
    reader = PdfReader(io.BytesIO(pdf_bytes))
    return len(reader.pages)
