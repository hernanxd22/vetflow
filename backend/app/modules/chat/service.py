import httpx
from app.core.config import settings
from app.modules.chat.schemas import ChatRequest, ChatResponse

async def enviar_mensaje(data: ChatRequest) -> ChatResponse:
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            settings.N8N_WEBHOOK_URL,
            json={"cliente_id": data.cliente_id, "mensaje": data.mensaje}
        )
        response.raise_for_status()
        result = response.json()
        return ChatResponse(respuesta=result.get("respuesta", ""))