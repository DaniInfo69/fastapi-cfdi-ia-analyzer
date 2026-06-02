# backend/app/routers/auth_router.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
import jwt

from app.database import get_db
import app.models as models
from ..services.auth_service import AuthService, SECRET_KEY, ALGORITHM

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])

# Esto le dice a FastAPI dónde buscar el token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

class UserCreate(BaseModel):
    username: str
    password: str
    role: str = "cliente" # Por defecto se crean clientes

# --- DEPENDENCIA PARA PROTEGER RUTAS ---
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Token inválido")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Token expirado o inválido")
        
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    return user

# 1. LOGIN (Devuelve Access y Refresh Token)
@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not AuthService.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")

    access_token = AuthService.create_access_token(data={"sub": user.username, "role": user.role})
    refresh_token = AuthService.create_refresh_token(data={"sub": user.username})

    return {
        "access_token": access_token, 
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "role": user.role,
        "username": user.username
    }

# 2. CREAR USUARIOS (SOLO ADMIN)
@router.post("/create-user")
async def create_user(
    new_user: UserCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="No tienes permisos para crear usuarios")
        
    existing = db.query(models.User).filter(models.User.username == new_user.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="El usuario ya existe")

    hashed_pw = AuthService.get_password_hash(new_user.password)
    db_user = models.User(username=new_user.username, hashed_password=hashed_pw, role=new_user.role)
    db.add(db_user)
    db.commit()
    return {"message": f"Usuario {new_user.username} creado exitosamente como {new_user.role}."}

# 3. CREAR EL PRIMER ADMIN (Endpoint temporal/oculto)
@router.post("/setup-first-admin")
async def setup_first_admin(new_admin: UserCreate, db: Session = Depends(get_db)):
    # Solo permite crear si no hay NINGÚN usuario en la base de datos
    if db.query(models.User).count() > 0:
        raise HTTPException(status_code=400, detail="Ya existen usuarios. Usa el panel de admin.")
    
    hashed_pw = AuthService.get_password_hash(new_admin.password)
    # Forzamos el rol a admin
    db_user = models.User(username=new_admin.username, hashed_password=hashed_pw, role="admin")
    db.add(db_user)
    db.commit()
    return {"message": "Primer administrador creado con éxito. Ya puedes iniciar sesión."}