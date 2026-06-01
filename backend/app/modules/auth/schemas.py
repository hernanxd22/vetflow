from pydantic import BaseModel
from typing import Optional

class RegisterRequest(BaseModel):
    nombre:   str
    apellido: str
    dni:      str
    telefono: Optional[str] = None
    username: str
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

class AuthResponse(BaseModel):
    cliente_id: int
    nombre:     str
    apellido:   str
    dni:        str
    username:   str