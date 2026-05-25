# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app import models

# Importaciones relativas (¡como lo tenías antes!)
from .routers import ai_router
from .routers import fiscal_router

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CFDI Analyzer API",
    description="API to analyze CFDI files using OpenAI API.",
    version="1.0.0"
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

@app.get("/", tags=["Health Check"])
def root():
    return {"status": "online", "message": "CFDI Parser API is running"}