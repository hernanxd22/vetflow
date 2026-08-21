from pydantic import BaseModel
from typing import Optional


# A cita is built incrementally by the n8n workflow: the row is inserted with
# only cliente_id and estado, and mascota_id, fecha and hora are filled in over
# the following turns of the conversation. Any row that is still mid-flow — or
# whose mascota was deleted — therefore carries NULLs. These fields are optional
# so that one incomplete row can never fail validation for the whole response.
class CitaClienteResponse(BaseModel):
    id: int
    fecha: Optional[str] = None
    hora: Optional[str] = None
    estado: str
    mascota_id: Optional[int] = None
    mascota_nombre: Optional[str] = None


class CitaAdminResponse(CitaClienteResponse):
    cliente_id: int
    cliente_nombre: str
    veterinario_nombre: Optional[str] = None


class CitaVetResponse(BaseModel):
    id: int
    fecha: Optional[str] = None
    hora: Optional[str] = None
    estado: str
    mascota_id: Optional[int] = None
    mascota_nombre: Optional[str] = None
    cliente_nombre: str
