from pydantic import BaseModel
from typing import Optional


class CitaClienteResponse(BaseModel):
    id: int
    fecha: str
    hora: str
    estado: str
    mascota_id: int
    mascota_nombre: str


class CitaAdminResponse(CitaClienteResponse):
    cliente_id: int
    cliente_nombre: str


class CitaVetResponse(BaseModel):
    id: int
    fecha: str
    hora: str
    estado: str
    mascota_nombre: str
    cliente_nombre: str
