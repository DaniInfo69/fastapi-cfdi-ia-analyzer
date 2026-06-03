# app/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base, SessionLocal
from app import models
from app.models import User
from app.services.auth_service import AuthService

# Importaciones relativas (¡como lo tenías antes!)
from .routers import ai_router
from .routers import fiscal_router
from .routers import user_router
from .routers import auth_router


# Evento de ciclo de vida (Lifespan) para darle tiempo a la BD de iniciar correctamente
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Crear todas las tablas en la base de datos si no existen
    models.Base.metadata.create_all(bind=engine)
    
    # 2. Abrir una sesión de la base de datos temporalmente
    db = SessionLocal()
    try:
        # 3. Comprobar si el usuario AdminDaniel ya existe
        admin_exists = db.query(User).filter(User.username == "AdminDaniel").first()
        
        # 4. Si no existe, lo creamos
        if not admin_exists:
            hashed_pw = AuthService.get_password_hash("12345")
            new_admin = User(
                username="AdminDaniel",
                hashed_password=hashed_pw,
                role="admin"
            )
            db.add(new_admin)
            db.commit()
            print("Usuario 'AdminDaniel' creado correctamente en el primer inicio.")
    except Exception as e:
        print(f"Error al intentar crear el usuario por defecto: {e}")
    finally:
        # 5. Cerrar la sesión obligatoriamente
        db.close()
        
    yield # Aquí el servidor se queda en escucha y comienza a recibir peticiones


app = FastAPI(
    title="CFDI Analyzer API",
    description="API to analyze CFDI files using OpenAI API.",
    version="1.0.0",
    lifespan=lifespan # Conectamos el ciclo de vida a la aplicación
)

# CORS 
origins = [
    "http://localhost:3000", # REACT_APP_PORT
    "http://localhost:5173", # DEFAULT_PORT
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"], 
    allow_headers=["*"],
)

app.include_router(ai_router.router)
app.include_router(fiscal_router.router)
app.include_router(user_router.router)
app.include_router(auth_router.router)

@app.get("/", tags=["Health Check"])
def root():
    return {"status": "online", "message": "CFDI Parser API is running"}