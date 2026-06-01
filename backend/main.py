from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.modules.mascotas.router import router as mascotas_router
from app.modules.auth.router import router as auth_router

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

@app.get("/")
def root():
    return {"status": "VetFlow API running"}