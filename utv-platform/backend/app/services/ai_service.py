import os
from typing import List, Dict, Any, Optional
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import FAISS
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
from app.core.config import settings


class UTVAssistantService:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings(
            openai_api_key=settings.OPENAI_API_KEY,
            model="text-embedding-ada-002"
        )
        self.llm = ChatOpenAI(
            openai_api_key=settings.OPENAI_API_KEY,
            model="gpt-4-turbo-preview",
            temperature=0.7,
            max_tokens=1000
        )
        self.vector_store: Optional[FAISS] = None
        self.qa_chain = None
        self._initialize_knowledge_base()
    
    def _initialize_knowledge_base(self):
        """Initialize the knowledge base with UTV's mission and values"""
        # Default knowledge about UTV
        utv_knowledge = [
            Document(
                page_content="""
                UNA TANTUM VOCE (UTV) is an integrated artistic and educational initiative 
                that bridges classical music and gospel music with formative philosophical literature. 
                The name "Una Tantum Voce" is Latin for "One Single Voice", representing the unity 
                of artistic expression and intellectual formation.
                """,
                metadata={"source": "mission", "title": "UTV Mission"}
            ),
            Document(
                page_content="""
                UTV serves as: 1) A music streaming service for classical and gospel music, 
                2) A digital library of philosophical and formative literature, 
                3) An e-commerce store for books and musical scores, 
                4) A concert ticketing hub for live performances, 
                5) A future academy for music and philosophy education.
                """,
                metadata={"source": "about", "title": "UTV Services"}
            ),
            Document(
                page_content="""
                The platform features works that combine the beauty of classical music traditions 
                with the spiritual depth of gospel music. Our sheet music collection includes 
                arrangements for choir, solo voice, and instrumental ensembles.
                """,
                metadata={"source": "music", "title": "UTV Music Collection"}
            ),
            Document(
                page_content="""
                UTV's digital library contains formative philosophical literature focused on 
                personal development, ethical living, spiritual formation, and the integration 
                of faith and reason. Authors include classical philosophers and contemporary 
                thinkers who explore the intersection of art, faith, and human flourishing.
                """,
                metadata={"source": "library", "title": "UTV Digital Library"}
            ),
            Document(
                page_content="""
                To purchase books or scores: Browse the Books or Scores section, add items to your 
                cart, and checkout using our secure Stripe payment processing. After purchase, 
                downloadable PDFs will be watermarked with your email for security.
                """,
                metadata={"source": "help", "title": "How to Purchase"}
            ),
            Document(
                page_content="""
                To attend concerts: Visit the Concerts section to view upcoming events. 
                Select your concert, choose the number of tickets, and complete purchase. 
                Your digital ticket with QR code will be available in your account.
                """,
                metadata={"source": "help", "title": "Concert Tickets"}
            ),
            Document(
                page_content="""
                The UTV platform supports 8 languages: English (EN), French (FR), Kinyarwanda (RW), 
                Swahili (SW), Spanish (ES), Portuguese (PT), Italian (IT), and German (DE).
                Use the language switcher in the navigation to change your preferred language.
                """,
                metadata={"source": "help", "title": "Languages"}
            ),
            Document(
                page_content="""
                UTV sheet music is available for various voicings: SATB choir, SSA choir, 
                TTBB choir, solo voice with piano accompaniment, and instrumental arrangements. 
                Genres include classical sacred music, gospel arrangements, and fusion works.
                """,
                metadata={"source": "scores", "title": "Sheet Music"}
            ),
            Document(
                page_content="""
                If you need help with your account, orders, or downloads, please contact support 
                through this chat or email support@unatantumvoce.org. For technical issues 
                with playback or downloads, try refreshing your browser or clearing cache.
                """,
                metadata={"source": "support", "title": "Customer Support"}
            ),
            Document(
                page_content="""
                UTV's vision is to create a global community where classical and gospel music 
                enthusiasts can discover, learn, and grow together. The academy will offer 
                courses in music theory, vocal technique, conducting, and philosophical formation.
                """,
                metadata={"source": "vision", "title": "Future Academy"}
            ),
        ]
        
        # Split documents into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50
        )
        chunks = text_splitter.split_documents(utv_knowledge)
        
        # Create vector store
        self.vector_store = FAISS.from_documents(chunks, self.embeddings)
        
        # Create QA chain
        custom_prompt = PromptTemplate(
            template="""You are the UNA TANTUM VOCE (UTV) Assistant, a knowledgeable and elegant 
            concierge for the UTV platform. You help users discover music, books, scores, and concerts. 
            You answer questions about UTV's mission, values, and services with warmth and sophistication.
            
            Context from UTV knowledge base:
            {context}
            
            Human: {question}
            
            Assistant: """,
            input_variables=["context", "question"]
        )
        
        self.qa_chain = RetrievalQA.from_chain_type(
            llm=self.llm,
            chain_type="stuff",
            retriever=self.vector_store.as_retriever(search_kwargs={"k": 3}),
            return_source_documents=True,
            chain_type_kwargs={"prompt": custom_prompt}
        )
    
    def add_documents(self, documents: List[Document]):
        """Add new documents to the knowledge base (e.g., book contents)"""
        if self.vector_store:
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=500,
                chunk_overlap=50
            )
            chunks = text_splitter.split_documents(documents)
            self.vector_store.add_documents(chunks)
    
    def ask(self, question: str, chat_history: Optional[List[Dict[str, str]]] = None) -> Dict[str, Any]:
        """Ask the UTV Assistant a question"""
        try:
            result = self.qa_chain({"query": question})
            
            sources = []
            if "source_documents" in result:
                for doc in result["source_documents"]:
                    if "title" in doc.metadata:
                        sources.append(doc.metadata["title"])
            
            return {
                "answer": result["result"],
                "sources": list(set(sources)) if sources else []
            }
        except Exception as e:
            return {
                "answer": f"I apologize, but I'm having trouble accessing my knowledge base at the moment. Please try again later. Error: {str(e)}",
                "sources": []
            }


# Singleton instance
_utv_assistant: Optional[UTVAssistantService] = None


def get_utv_assistant() -> UTVAssistantService:
    global _utv_assistant
    if _utv_assistant is None:
        _utv_assistant = UTVAssistantService()
    return _utv_assistant
