# backend/app/models.py
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    hashed_password = Column(String(200))
    role = Column(String(20), default="cliente") # Roles: "admin" o "cliente"
    ai_uses = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    analyses = relationship("AnalysisHistory", back_populates="owner")

class AnalysisHistory(Base):
    __tablename__ = "analysis_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    fiscal_regime = Column(String(100))
    risk_level = Column(String, default="Unknown")
    deductible = Column(String, default="Unknown")
    summary = Column(Text, default="")
    legal_justification = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="analyses")