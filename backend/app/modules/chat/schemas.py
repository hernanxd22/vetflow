from pydantic import BaseModel
from typing import Optional

class ChatRequest(BaseModel):
    cliente_id: int
    mensaje: str

class ChatResponse(BaseModel):
    respuesta: str