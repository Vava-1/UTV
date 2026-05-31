"""AI chat service using LangChain, OpenAI, FAISS, and Redis."""

import json
import logging
import os
from typing import List, Optional

from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.chains import ConversationalRetrievalChain
from langchain.text_splitter import RecursiveCharacterTextSplitter

from app.config import settings

logger = logging.getLogger(__name__)

# Global service instance
_ai_service: Optional["AIService"] = None


def get_ai_service() -> "AIService":
    """Get or create the global AI service singleton."""
    global _ai_service
    if _ai_service is None:
        _ai_service = AIService()
    return _ai_service


class AIService:
    """AI-powered chat service with RAG over UTV knowledge base."""

    def __init__(self):
        """Initialize OpenAI embeddings, LLM, and load/create FAISS index."""
        self.embeddings = OpenAIEmbeddings(
            model="text-embedding-3-small",
            openai_api_key=settings.OPENAI_API_KEY,
        )
        self.llm = ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.7,
            openai_api_key=settings.OPENAI_API_KEY,
        )
        self.vector_store = self._load_or_create_knowledge_base()

    def _load_or_create_knowledge_base(self):
        """Load existing FAISS index or create from utv_knowledge.txt."""
        faiss_dir = "/app/data/faiss_index"
        try:
            if os.path.exists(faiss_dir):
                logger.info("Loading existing FAISS index...")
                return FAISS.load_local(
                    faiss_dir, self.embeddings, allow_dangerous_deserialization=True
                )
        except Exception as e:
            logger.warning(f"Could not load existing FAISS index: {e}")

        logger.info("Creating FAISS index from knowledge base...")
        return self._load_knowledge_base()

    def _load_knowledge_base(self):
        """Read utv_knowledge.txt, split, embed, and save FAISS index."""
        kb_path = "/app/app/utv_knowledge.txt"
        if not os.path.exists(kb_path):
            logger.warning(f"Knowledge base not found at {kb_path}, using default")
            docs_text = self._default_knowledge()
        else:
            with open(kb_path, "r", encoding="utf-8") as f:
                docs_text = f.read()

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50,
        )
        docs = splitter.create_documents([docs_text])

        vector_store = FAISS.from_documents(docs, self.embeddings)

        os.makedirs("/app/data", exist_ok=True)
        vector_store.save_local("/app/data/faiss_index")
        return vector_store

    def _default_knowledge(self) -> str:
        """Return default knowledge if file not found."""
        return """Una Tantum Voce (UTV) is a digital platform for classical and gospel music,
philosophical literature, and cultural events. We offer streaming music, digital books,
musical scores, and event tickets. Our platform supports 8 languages including English,
French, Spanish, German, Italian, Portuguese, Kinyarwanda, and Swahili.
We accept payments via Stripe and provide watermarked PDF downloads for purchased books
and scores. Events include concerts, workshops, and cultural gatherings."""

    async def chat(self, message: str, session_id: str, language: str = "en") -> str:
        """Process a chat message with RAG and conversation history.

        Args:
            message: The user's message.
            session_id: Unique session identifier.
            language: ISO language code for response.

        Returns:
            Assistant's response string.
        """
        # Load history from Redis
        history = await self.get_history(session_id)

        # Build system message with language instruction
        system_message = (
            f"You are UTV's helpful assistant. Always respond in {language}. "
            "Be warm, professional, and concise. "
            "Help users with questions about music, books, scores, events, tickets, "
            "downloads, account issues, and platform features."
        )

        # Create retrieval chain
        retriever = self.vector_store.as_retriever(search_kwargs={"k": 4})
        chain = ConversationalRetrievalChain.from_llm(
            llm=self.llm,
            retriever=retriever,
            return_source_documents=False,
            verbose=False,
        )

        # Invoke chain with question and chat history
        result = await chain.ainvoke({
            "question": message,
            "chat_history": history,
        })
        answer = result.get("answer", "I'm sorry, I couldn't process that request.")

        # Save updated history to Redis
        history.append((message, answer))
        await self._save_history(session_id, history)

        return answer

    async def get_history(self, session_id: str) -> List[tuple]:
        """Get chat history from Redis for a session.

        Returns list of (human_message, ai_message) tuples.
        """
        try:
            import redis.asyncio as redis
            r = redis.from_url(settings.REDIS_URL)
            key = f"chat_history:{session_id}"
            data = await r.get(key)
            await r.close()
            if data:
                return json.loads(data)
        except Exception as e:
            logger.warning(f"Could not load chat history: {e}")
        return []

    async def _save_history(self, session_id: str, history: List[tuple]):
        """Save chat history to Redis with 24-hour TTL."""
        try:
            import redis.asyncio as redis
            r = redis.from_url(settings.REDIS_URL)
            key = f"chat_history:{session_id}"
            # Keep last 50 message pairs
            trimmed = history[-50:]
            await r.setex(key, 86400, json.dumps(trimmed))
            await r.close()
        except Exception as e:
            logger.warning(f"Could not save chat history: {e}")

    async def clear_history(self, session_id: str):
        """Clear chat history for a session."""
        try:
            import redis.asyncio as redis
            r = redis.from_url(settings.REDIS_URL)
            await r.delete(f"chat_history:{session_id}")
            await r.close()
        except Exception as e:
            logger.warning(f"Could not clear chat history: {e}")
