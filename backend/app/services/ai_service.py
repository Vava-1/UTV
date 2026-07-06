"""
UTV AI Assistant Service.

ARCHITECTURE: Direct OpenAI Chat Completions with full knowledge base in system prompt.
This is a deliberate simplification — the knowledge base is ~10 short paragraphs,
so a vector DB (FAISS) and LangChain are over-engineering that caused deployment crashes.

The system prompt embeds the entire knowledge base. If OPENAI_API_KEY is not set
or the API call fails, we fall back to a keyword-matching response system.
"""

import os
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

# Try to import OpenAI, fall back to simple keyword matcher if not available
try:
    from openai import OpenAI
    HAS_OPENAI = True
except ImportError:
    logger.warning("[AI Service] OpenAI package not installed. Using keyword fallback only.")
    HAS_OPENAI = False

from app.core.config import settings


# ─── Knowledge Base (embedded in system prompt) ──────────────────────────────
UTV_KNOWLEDGE_BASE = """
You are the UNA TANTUM VOCE (UTV) Assistant, a knowledgeable and elegant concierge 
for the UTV platform. You help users discover music, books, scores, and concerts. 
You answer questions about UTV's mission, values, and services with warmth and sophistication.

KNOWLEDGE BASE:

1. MISSION: UNA TANTUM VOCE (UTV) is an integrated artistic and educational initiative 
that bridges classical music and gospel music with formative philosophical literature. 
The name "Una Tantum Voce" is Latin for "One Single Voice", representing the unity 
of artistic expression and intellectual formation.

2. SERVICES: UTV serves as: (a) A music streaming service for classical and gospel music, 
(b) A digital library of philosophical and formative literature, (c) An e-commerce store 
for books and musical scores, (d) A concert ticketing hub for live performances, 
(e) A future academy for music and philosophy education.

3. MUSIC: The platform features works that combine the beauty of classical music traditions 
with the spiritual depth of gospel music. Our sheet music collection includes arrangements 
for choir, solo voice, and instrumental ensembles — SATB, SSA, TTBB voicings.

4. DIGITAL LIBRARY: UTV's digital library contains formative philosophical literature focused 
on personal development, ethical living, spiritual formation, and the integration of faith 
and reason. Authors include classical philosophers and contemporary thinkers.

5. PURCHASING: To purchase books or scores, browse the Books or Scores section, add items 
to your cart, and checkout using secure Stripe payment processing. After purchase, 
downloadable PDFs are watermarked with your email for security.

6. CONCERTS: To attend concerts, visit the Concerts section to view upcoming events. 
Select your concert, choose the number of tickets, and complete purchase. Your digital 
ticket with QR code will be available in your account.

7. LANGUAGES: The UTV platform supports 8 languages: English (EN), French (FR), 
Kinyarwanda (RW), Swahili (SW), Spanish (ES), Portuguese (PT), Italian (IT), and German (DE).
Use the language switcher in the navigation to change your preferred language.

8. SHEET MUSIC: UTV sheet music is available for various voicings: SATB choir, SSA choir, 
TTBB choir, solo voice with piano accompaniment, and instrumental arrangements. 
Genres include classical sacred music, gospel arrangements, and fusion works.

9. SUPPORT: If you need help with your account, orders, or downloads, please contact support 
through this chat or email support@unatantumvoce.org. For technical issues with playback 
or downloads, try refreshing your browser or clearing cache.

10. VISION: UTV's vision is to create a global community where classical and gospel music 
enthusiasts can discover, learn, and grow together. The academy will offer courses in 
music theory, vocal technique, conducting, and philosophical formation.

INSTRUCTIONS:
- Answer concisely (2-4 sentences max) unless the question requires depth.
- Be warm, elegant, and professional — match the UTV brand voice.
- If you don't know something, say so and suggest contacting support.
- Respond in the same language the user is writing in, if possible.
- Never make up information not in the knowledge base.
"""


class UTVAssistantService:
    def __init__(self):
        self.client = None
        self.is_available = False
        
        if HAS_OPENAI and settings.OPENAI_API_KEY:
            try:
                self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
                self.is_available = True
                logger.info("[AI Service] OpenAI client initialized successfully")
            except Exception as e:
                logger.error(f"[AI Service] OpenAI init failed: {e}")
        elif not settings.OPENAI_API_KEY:
            logger.info("[AI Service] OPENAI_API_KEY not set — using keyword fallback")
        
        self.is_mock = not self.is_available

    def ask(self, question: str, chat_history: Optional[List[Dict[str, str]]] = None) -> Dict[str, Any]:
        """Ask the UTV Assistant a question."""
        if self.is_available:
            try:
                return self._ask_openai(question, chat_history)
            except Exception as e:
                logger.error(f"[AI Service] OpenAI call failed: {e}")
                # Fall through to keyword fallback
        
        return self._keyword_fallback(question)

    def _ask_openai(self, question: str, chat_history: Optional[List[Dict[str, str]]] = None) -> Dict[str, Any]:
        """Call OpenAI Chat Completions with the full knowledge base as system prompt."""
        messages = [
            {"role": "system", "content": UTV_KNOWLEDGE_BASE}
        ]
        
        # Add chat history for context (last 6 messages max)
        if chat_history:
            for msg in chat_history[-6:]:
                messages.append({
                    "role": msg.get("role", "user"),
                    "content": msg.get("message", "")
                })
        
        messages.append({"role": "user", "content": question})
        
        response = self.client.chat.completions.create(
            model="gpt-3.5-turbo",  # Cost-effective; upgrade to gpt-4 if needed
            messages=messages,
            temperature=0.7,
            max_tokens=500,
        )
        
        answer = response.choices[0].message.content.strip()
        return {
            "answer": answer,
            "sources": ["UTV Knowledge Base"]
        }

    def _keyword_fallback(self, question: str) -> Dict[str, Any]:
        """Intelligent keyword-based fallback when OpenAI is unavailable."""
        q = question.lower()
        
        if any(w in q for w in ["music", "sing", "song", "audio", "choir", "choral", "satb", "ssa", "ttbb"]):
            ans = "UNA TANTUM VOCE specializes in bridging classical choral works with rich gospel traditions. We have featured recordings and sheet music scores available for SATB, SSA, and TTBB choir arrangements. Visit the Music section to explore our collection."
            src = ["UTV Music Collection"]
        elif any(w in q for w in ["book", "read", "literature", "pdf", "philosophy", "author", "library"]):
            ans = "Our digital library features formative philosophical literature aimed at personal and intellectual growth. All purchased books can be downloaded directly from your Library tab as secure watermarked PDFs. Browse the Books section to discover our collection."
            src = ["UTV Digital Library"]
        elif any(w in q for w in ["ticket", "concert", "live", "performance", "event", "venue"]):
            ans = "You can purchase tickets for all our upcoming live concerts directly under the Concerts tab. Once booked, your digital ticket with QR code will automatically appear in your UTV account. Visit the Concerts page to see upcoming events."
            src = ["Concert Tickets"]
        elif any(w in q for w in ["score", "sheet music", "sheet", "partition", "notation"]):
            ans = "UTV offers sheet music for various voicings including SATB, SSA, and TTBB choirs, as well as solo voice and instrumental arrangements. Browse the Scores section to find and purchase sheet music. Each score is delivered as a PDF."
            src = ["Sheet Music"]
        elif any(w in q for w in ["purchase", "buy", "cart", "checkout", "payment", "price", "cost"]):
            ans = "To purchase books or scores, add items to your cart and checkout using our secure Stripe payment processing. After purchase, downloadable PDFs will be watermarked with your email for security. We accept all major credit cards."
            src = ["How to Purchase"]
        elif any(w in q for w in ["language", "translate", "french", "kinyarwanda", "swahili", "spanish", "portuguese", "italian", "german"]):
            ans = "The UTV platform supports 8 languages: English, French, Kinyarwanda, Swahili, Spanish, Portuguese, Italian, and German. Use the language switcher in the navigation bar to change your preferred language."
            src = ["Languages"]
        elif any(w in q for w in ["hello", "hi", "hey", "greetings", "bonjour", "hola", "ciao"]):
            ans = "Greetings! I am the UNA TANTUM VOCE Concierge. How may I assist your musical or intellectual development today? I can help you discover music, books, scores, and concert tickets."
            src = ["UTV Mission"]
        elif any(w in q for w in ["support", "help", "contact", "issue", "problem", "error"]):
            ans = "If you need help with your account, orders, or downloads, please contact support through this chat or email support@unatantumvoce.org. For technical issues with playback or downloads, try refreshing your browser or clearing your cache."
            src = ["Customer Support"]
        elif any(w in q for w in ["academy", "course", "learn", "education", "training", "school"]):
            ans = "UTV's vision includes a future Academy offering courses in music theory, vocal technique, conducting, and philosophical formation. Stay tuned for updates on our educational programs."
            src = ["Future Academy"]
        else:
            ans = "UNA TANTUM VOCE (Latin for 'One Single Voice') is dedicated to bridging the beauty of classical and gospel music with formative literature. Let me know if you would like assistance with sheet music, books, concert tickets, or digital downloads!"
            src = ["UTV Mission"]

        return {
            "answer": ans,
            "sources": src
        }


# Singleton instance
_utv_assistant: Optional[UTVAssistantService] = None


def get_utv_assistant() -> UTVAssistantService:
    global _utv_assistant
    if _utv_assistant is None:
        _utv_assistant = UTVAssistantService()
    return _utv_assistant
