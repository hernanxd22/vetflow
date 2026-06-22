from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.modules.citas.schemas import CitaClienteResponse, CitaAdminResponse
from app.modules.citas.service import get_citas_cliente, get_citas_admin
from typing import List

router = APIRouter(prefix="/citas", tags=["Citas"])


@router.get("/", response_model=List[CitaClienteResponse])
def citas_cliente(cliente_id: int, db: Session = Depends(get_db)):
    return get_citas_cliente(cliente_id, db)


@router.get("/admin", response_model=List[CitaAdminResponse])
def citas_admin(db: Session = Depends(get_db)):
    return get_citas_admin(db)
