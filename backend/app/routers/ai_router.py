# backend/app/routers/ai_router.py
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, Header
from typing import Optional
from sqlalchemy.orm import Session

from ..services.ai_service import AIService
from app.database import get_db
import app.models as models

router = APIRouter(prefix="/api/v1/ai", tags=["AI Fiscal Analysis"])

# Límite fijo de 5 por usuario de por vida
TOTAL_LIMIT_PER_USER = 5

@router.post("/analyze-health")
async def analyze_fiscal_health_endpoint(
    db: Session = Depends(get_db),
    x_access_token: Optional[str] = Header(None), # <--- Se espera el token en los headers
    tax_status_cert: UploadFile = File(...),
    compliance_opinion: UploadFile = File(...),
    bylaws: Optional[UploadFile] = File(None),
    fiscal_regime: Optional[str] = Form(None),
    general_context: Optional[str] = Form(None)
):
    # 1. Validar Token y Usuario
    if not x_access_token:
        raise HTTPException(status_code=401, detail="Se requiere un token de acceso (x-access-token).")

    user = db.query(models.User).filter(models.User.access_token == x_access_token).first()
    if not user:
        raise HTTPException(status_code=401, detail="Token de acceso inválido.")

    # 2. Validar límite estricto de usos
    if user.ai_uses >= TOTAL_LIMIT_PER_USER:
        raise HTTPException(status_code=429, detail="Has superado tu límite de 5 análisis gratuitos.")

    # 3. Validar PDFs (tu código original se mantiene)
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

        # 4. Actualizar Base de Datos (Sumar uso y vincular historial al usuario)
        user.ai_uses += 1

        db_record = models.AnalysisHistory(
            user_id=user.id, # <--- Se guarda el ID del usuario
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
            "queries_remaining": TOTAL_LIMIT_PER_USER - user.ai_uses
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# Actualizamos también el endpoint del historial
@router.get("/history")
async def get_analysis_history(
    x_access_token: Optional[str] = Header(None), 
    db: Session = Depends(get_db)
):
    if not x_access_token:
        raise HTTPException(status_code=401, detail="Token requerido para ver el historial.")
        
    user = db.query(models.User).filter(models.User.access_token == x_access_token).first()
    if not user:
        raise HTTPException(status_code=401, detail="Token inválido.")

    # Trae SOLO los análisis pertenecientes a este usuario
    records = db.query(models.AnalysisHistory).filter(
        models.AnalysisHistory.user_id == user.id
    ).order_by(models.AnalysisHistory.created_at.desc()).all()
    
    return {"data": records}