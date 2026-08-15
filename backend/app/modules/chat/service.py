import httpx
from app.core.config import settings
from app.modules.chat.schemas import ChatRequest, ChatResponse

async def enviar_mensaje(cliente_id: int, data: ChatRequest) -> ChatResponse:
    # cliente_id comes from the verified access token, never from the request body,
    # so a client cannot drive the conversation of another account.
    headers = {}
    if settings.N8N_WEBHOOK_TOKEN:
        headers["X-VetFlow-Token"] = settings.N8N_WEBHOOK_TOKEN

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            settings.N8N_WEBHOOK_URL,
            json={"cliente_id": cliente_id, "mensaje": data.mensaje},
            headers=headers,
        )
        response.raise_for_status()
        result = response.json()
        return ChatResponse(respuesta=result.get("respuesta", ""))
