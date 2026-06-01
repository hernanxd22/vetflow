from pydantic import BaseModel
from datetime import date
from typing import Optional

class MascotaCreate(BaseModel):
    nombre:           str
    especie:          str
    raza:             Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    peso:             Optional[float] = None
    notas_medicas:    Optional[str] = None

class MascotaUpdate(BaseModel):
    nombre:           Optional[str] = None
    especie:          Optional[str] = None
    raza:             Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    peso:             Optional[float] = None
    notas_medicas:    Optional[str] = None

class MascotaResponse(BaseModel):
    id:               int
    cliente_id:       int
    nombre:           str
    especie:          str
    raza:             Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    peso:             Optional[float] = None
    notas_medicas:    Optional[str] = None

    model_config = {"from_attributes": True}