# backend/app/routers/user_router.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid
import app.models as models
from app.database import get_db

router = APIRouter(prefix="/api/v1/users", tags=["Users"])

@router.post("/register")
async def register_user(username: str, db: Session = Depends(get_db)):
    # Verificamos si el usuario ya existe
    existing_user = db.query(models.User).filter(models.User.username == username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="El nombre de usuario ya está en uso.")
    
    # Generamos un token UUID único para el usuario
    new_token = str(uuid.uuid4())
    
    new_user = models.User(username=username, access_token=new_token)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {
        "message": "Usuario creado exitosamente",
        "username": new_user.username,
        "access_token": new_user.access_token,
        "ai_uses_remaining": 5
    }