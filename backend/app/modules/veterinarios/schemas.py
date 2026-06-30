from pydantic import BaseModel
from typing import Literal, Optional


class VeterinarioResponse(BaseModel):
    id: int
    nombre: str
    apellido: str
    dni: str
    telefono: Optional[str] = None
    username: str
    estado: str

    model_config = {"from_attributes": True}


class VeterinarioUpdate(BaseModel):
    telefono: Optional[str] = None
    estado: Optional[Literal["activo", "desactivado"]] = None
