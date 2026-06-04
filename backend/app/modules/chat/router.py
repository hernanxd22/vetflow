from fastapi import APIRouter
from app.modules.chat.schemas import ChatRequest, ChatResponse
from app.modules.chat.service import enviar_mensaje

router = APIRouter(prefix="/chat", tags=["Chat"])

# router.py
@router.post("/", response_model=ChatResponse)
async def chat(data: ChatRequest):  # agregar async
    return await enviar_mensaje(data)  # agregar await