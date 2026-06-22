from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.modules.mascotas.router import router as mascotas_router
from app.modules.auth.router import router as auth_router
from app.modules.chat.router import router as chat_router
from app.modules.citas.router import router as citas_router

app = FastAPI(title="VetFlow API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(mascotas_router, prefix="/api")
app.include_router(chat_router, prefix="/api")
app.include_router(citas_router, prefix="/api")