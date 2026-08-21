from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.modules.mascotas.router import router as mascotas_router
from app.modules.auth.router import router as auth_router
from app.modules.chat.router import router as chat_router
from app.modules.citas.router import router as citas_router
from app.modules.historial.router import router as historial_router
from app.modules.veterinarios.router import router as veterinarios_router
from app.modules.auth.models import Cliente
from app.modules.mascotas.models import Mascota
from app.modules.historial.models import HistorialMedico
from app.core.config import settings
from sqlalchemy import text

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    with engine.connect() as conn:
        # mascota_id, fecha y hora admiten NULL a propósito: la máquina de estados
        # conversacional inserta la fila al iniciar el flujo y la completa paso a paso.
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS citas (
                id SERIAL PRIMARY KEY,
                cliente_id INTEGER NOT NULL REFERENCES clientes(id),
                mascota_id INTEGER REFERENCES mascotas(id),
                veterinario_id INTEGER REFERENCES clientes(id),
                fecha DATE,
                hora TIME,
                servicio VARCHAR(100),
                estado VARCHAR(20),
                notas TEXT,
                calendar_event_id VARCHAR(255),
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        """))
        # Columnas incorporadas después de la creación original de la tabla.
        for ddl in (
            "ALTER TABLE citas ADD COLUMN IF NOT EXISTS veterinario_id INTEGER REFERENCES clientes(id)",
            "ALTER TABLE citas ADD COLUMN IF NOT EXISTS servicio VARCHAR(100)",
            "ALTER TABLE citas ADD COLUMN IF NOT EXISTS notas TEXT",
            "ALTER TABLE citas ADD COLUMN IF NOT EXISTS calendar_event_id VARCHAR(255)",
        ):
            conn.execute(text(ddl))
        conn.commit()
    yield

app = FastAPI(title="VetFlow API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    # Authentication travels in the Authorization header, not in cookies,
    # so the browser never needs to send credentials cross-origin.
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(mascotas_router, prefix="/api")
app.include_router(chat_router, prefix="/api")
app.include_router(citas_router, prefix="/api")
app.include_router(historial_router, prefix="/api")
app.include_router(veterinarios_router, prefix="/api")