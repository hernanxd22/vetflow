from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional


TIPOS_VALIDOS = ["consulta", "vacuna", "cirugia", "tratamiento", "otro"]


class HistorialCreate(BaseModel):
    fecha:       date
    tipo:        str
    descripcion: str
    diagnostico: Optional[str] = None
    tratamiento: Optional[str] = None
    notas:       Optional[str] = None


class HistorialUpdate(BaseModel):
    fecha:       Optional[date] = None
    tipo:        Optional[str] = None
    descripcion: Optional[str] = None
    diagnostico: Optional[str] = None
    tratamiento: Optional[str] = None
    notas:       Optional[str] = None


class HistorialResponse(BaseModel):
    id:          int
    mascota_id:  int
    fecha:       date
    tipo:        str
    descripcion: str
    diagnostico: Optional[str] = None
    tratamiento: Optional[str] = None
    notas:       Optional[str] = None
    created_at:  Optional[datetime] = None

    model_config = {"from_attributes": True}
