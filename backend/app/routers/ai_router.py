# backend/app/routers/ai_router.py
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, Header
from typing import Optional
from sqlalchemy.orm import Session

from app.services.ai_service import AIService
from app.database import get_db
import app.models as models

router = APIRouter(prefix="/api/v1/ai", tags=["AI Fiscal Analysis"])

TOTAL_LIMIT_PER_USER = 5

@router.post("/analyze-health")
async def analyze_fiscal_health_endpoint(
    db: Session = Depends(get_db),
    x_access_token: Optional[str] = Header(None),
    tax_status_cert: UploadFile = File(...),
    compliance_opinion: UploadFile = File(...),
    cfdi_file: UploadFile = File(...), # <-- Añadimos el CFDI como obligatorio
    bylaws: Optional[UploadFile] = File(None),
    fiscal_regime: Optional[str] = Form(None),
    general_context: Optional[str] = Form(None)
):
    if not x_access_token:
        raise HTTPException(status_code=401, detail="Se requiere un token de acceso.")

    user = db.query(models.User).filter(models.User.access_token == x_access_token).first()
    if not user:
        raise HTTPException(status_code=401, detail="Token de acceso inválido.")

    if user.ai_uses >= TOTAL_LIMIT_PER_USER:
        raise HTTPException(status_code=429, detail="Has superado tu límite de 5 análisis gratuitos.")

    # 1. Validar estrictamente los tipos de archivo (PDF y XML)
    for pdf_file in [tax_status_cert, compliance_opinion]:
        if not pdf_file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail=f"El archivo {pdf_file.filename} DEBE ser formato PDF.")
            
    if bylaws and not bylaws.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="El Acta Constitutiva DEBE ser formato PDF.")

    if not cfdi_file.filename.lower().endswith('.xml'):
        raise HTTPException(status_code=400, detail="El CFDI DEBE ser un archivo con formato XML.")

    try:
        # 2. Leer los archivos en memoria
        tax_status_bytes = await tax_status_cert.read()
        compliance_bytes = await compliance_opinion.read()
        cfdi_bytes = await cfdi_file.read()
        
        # 3. Extraer y comprimir texto (Aquí atrapa si el PDF es solo imagen)
        tax_status_text = AIService.extract_text_from_pdf(tax_status_bytes)
        compliance_text = AIService.extract_text_from_pdf(compliance_bytes)
        cfdi_text = AIService.process_xml_cfdi(cfdi_bytes)
        
        bylaws_text = "Not provided."
        if bylaws:
            bylaws_bytes = await bylaws.read()
            bylaws_text = AIService.extract_text_from_pdf(bylaws_bytes, max_pages=10)

        context = f"Régimen Fiscal: {fiscal_regime or 'No especificado'}. Contexto Adicional: {general_context or 'N/A'}"
        
        # 4. Llamada a la IA (pasando el cfdi_text)
        result = AIService.analyze_fiscal_health(
            tax_status_text=tax_status_text, 
            compliance_text=compliance_text, 
            cfdi_text=cfdi_text,
            bylaws_text=bylaws_text, 
            additional_context=context
        )

        user.ai_uses += 1

        db_record = models.AnalysisHistory(
            user_id=user.id,
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
    
    # 5. Atrapar nuestro error personalizado de "Archivo de Imagen"
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error procesando los documentos: {str(e)}")

# ... (Tu código de /history se mantiene igual abajo) ...