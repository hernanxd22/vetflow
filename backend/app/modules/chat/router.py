from fastapi import APIRouter
from app.modules.chat.schemas import ChatRequest, ChatResponse
from app.modules.chat.service import enviar_mensaje

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("/", response_model=ChatResponse)
def chat(data: ChatRequest):
    return enviar_mensaje(data)