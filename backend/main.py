from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.modules.mascotas.router import router as mascotas_router
from app.modules.auth.router import router as auth_router
from app.modules.chat.router import router as chat_router
from app.modules.citas.router import router as citas_router
from app.modules.historial.router import router as historial_router
from app.modules.auth.models import Cliente
from app.modules.mascotas.models import Mascota
from app.modules.historial.models import HistorialMedico
from app.core.config import settings
from sqlalchemy import text

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    with engine.connect() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS citas (
                id SERIAL PRIMARY KEY,
                cliente_id INTEGER NOT NULL REFERENCES clientes(id),
                mascota_id INTEGER NOT NULL REFERENCES mascotas(id),
                fecha DATE NOT NULL,
                hora TIME NOT NULL,
                estado VARCHAR(20) NOT NULL DEFAULT 'confirmado',
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        """))
        conn.commit()
    yield

app = FastAPI(title="VetFlow API", version="1.0.0", lifespan=lifespan)

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
app.include_router(historial_router, prefix="/api")