# backend/app/routers/fiscal_router.py
from fastapi import APIRouter, HTTPException
from ..services.fiscal_service import FiscalService

router = APIRouter(
    prefix="/api/v1/fiscal",
    tags=["Fiscal"]
)

# Instanciamos el servicio de manera global en el módulo del router
fiscal_service = FiscalService()

@router.get("/regimes")
async def get_fiscal_regimes():
    try:
        regimes = fiscal_service.get_all_regimes()
        return {"data": regimes}
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error al procesar los regímenes fiscales: {str(e)}"
        )