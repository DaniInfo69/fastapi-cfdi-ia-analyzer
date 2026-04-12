from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from ..services import AIService

router = APIRouter(prefix="/api/ai", tags=["AI Fiscal Analysis"])

@router.post("/analyze-health")
async def analyze_fiscal_health_endpoint(
    tax_status_cert: UploadFile = File(...),
    compliance_opinion: UploadFile = File(...),
    bylaws: Optional[UploadFile] = File(None),
    employees: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    additional_context: Optional[str] = Form(None)
):
    # Validate that required files are PDFs
    for uploaded_file in [tax_status_cert, compliance_opinion]:
        if not uploaded_file.filename.lower().endswith('.pdf'):
            raise HTTPException(
                status_code=400, 
                detail=f"File {uploaded_file.filename} must be a PDF."
            )

    try:
        # Read files into memory buffers
        tax_status_bytes = await tax_status_cert.read()
        compliance_bytes = await compliance_opinion.read()
        
        # Extract text from mandatory documents
        tax_status_text = AIService.extract_text_from_pdf(tax_status_bytes)
        compliance_text = AIService.extract_text_from_pdf(compliance_bytes)
        
        # Extract text from optional bylaws
        bylaws_text = "Not provided."
        if bylaws and bylaws.filename.lower().endswith('.pdf'):
            bylaws_bytes = await bylaws.read()
            bylaws_text = AIService.extract_text_from_pdf(bylaws_bytes, max_pages=10)

        # Consolidate extra information
        context = (
            f"Employees: {employees or 'N/A'}. "
            f"Location: {location or 'N/A'}. "
            f"{additional_context or ''}"
        )

        # Perform AI analysis
        result = AIService.analyze_fiscal_health(
            tax_status_text, compliance_text, bylaws_text, context
        )

        return {
            "message": "Analysis completed successfully",
            "data": result
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")