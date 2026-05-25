from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, Request
from typing import Optional
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from ..services.ai_service import AIService
from app.database import get_db
import app.models as models

router = APIRouter(prefix="/api/v1/ai", tags=["AI Fiscal Analysis"]) # Asegúrate de que el prefijo sea consistente

DAILY_LIMIT = 5

@router.post("/analyze-health")
async def analyze_fiscal_health_endpoint(
    request: Request,
    db: Session = Depends(get_db),
    tax_status_cert: UploadFile = File(...),
    compliance_opinion: UploadFile = File(...),
    bylaws: Optional[UploadFile] = File(None),
    fiscal_regime: Optional[str] = Form(None),
    general_context: Optional[str] = Form(None)
):
    client_ip = request.client.host
    twenty_four_hours_ago = datetime.utcnow() - timedelta(days=1)
    
    recent_queries = db.query(models.AnalysisHistory).filter(
        models.AnalysisHistory.ip_address == client_ip,
        models.AnalysisHistory.created_at >= twenty_four_hours_ago
    ).count()

    if recent_queries >= DAILY_LIMIT:
        raise HTTPException(status_code=429, detail="Has superado el límite de análisis gratuitos por hoy.")

    # Validar PDFs
    for uploaded_file in [tax_status_cert, compliance_opinion]:
        if not uploaded_file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Los archivos deben ser PDF.")

    try:
        tax_status_bytes = await tax_status_cert.read()
        compliance_bytes = await compliance_opinion.read()
        
        tax_status_text = AIService.extract_text_from_pdf(tax_status_bytes)
        compliance_text = AIService.extract_text_from_pdf(compliance_bytes)
        
        bylaws_text = "Not provided."
        if bylaws and bylaws.filename.lower().endswith('.pdf'):
            bylaws_bytes = await bylaws.read()
            bylaws_text = AIService.extract_text_from_pdf(bylaws_bytes, max_pages=10)

        context = f"Régimen Fiscal: {fiscal_regime or 'No especificado'}. Contexto Adicional: {general_context or 'N/A'}"
        
        # Llamada a la IA
        result = AIService.analyze_fiscal_health(tax_status_text, compliance_text, bylaws_text, context)

        # GUARDAR EN LA BASE DE DATOS (NUEVOS CAMPOS)
        db_record = models.AnalysisHistory(
            ip_address=client_ip,
            fiscal_regime=fiscal_regime,
            nivel_riesgo=result.get("nivel_riesgo", "Desconocido"),
            deducible=result.get("deducible", "Desconocido"),
            resumen=result.get("resumen", ""),
            justificacion_legal=result.get("justificacion_legal", "")
        )
        db.add(db_record)
        db.commit()

        return {
            "message": "Analysis completed",
            "data": result,
            "queries_remaining": DAILY_LIMIT - (recent_queries + 1)
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# NUEVO ENDPOINT PARA EL HISTORIAL
@router.get("/history")
async def get_analysis_history(request: Request, db: Session = Depends(get_db)):
    client_ip = request.client.host
    # Trae los últimos 10 análisis realizados por esta IP
    records = db.query(models.AnalysisHistory).filter(
        models.AnalysisHistory.ip_address == client_ip
    ).order_by(models.AnalysisHistory.created_at.desc()).limit(10).all()
    
    return {"data": records} 