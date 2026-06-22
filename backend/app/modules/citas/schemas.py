from pydantic import BaseModel
from typing import Optional


class CitaClienteResponse(BaseModel):
    id: int
    fecha: str
    hora: str
    estado: str
    mascota_nombre: str


class CitaAdminResponse(CitaClienteResponse):
    cliente_nombre: str
