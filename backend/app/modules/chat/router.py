from fastapi import APIRouter, Depends
from app.core.security import get_current_user, CurrentUser
from app.modules.chat.schemas import ChatRequest, ChatResponse
from app.modules.chat.service import enviar_mensaje

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("", response_model=ChatResponse)
async def chat(
    data: ChatRequest,
    user: CurrentUser = Depends(get_current_user),
):
    return await enviar_mensaje(user.cliente_id, data)
