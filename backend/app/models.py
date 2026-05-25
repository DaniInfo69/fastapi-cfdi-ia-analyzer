from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from app.database import Base

class AnalysisHistory(Base):
    __tablename__ = "analysis_history"

    id = Column(Integer, primary_key=True, index=True)
    ip_address = Column(String(50), index=True)
    fiscal_regime = Column(String(100))
    nivel_riesgo = Column(String(20))
    deducible = Column(String(50))
    resumen = Column(Text)
    justificacion_legal = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())