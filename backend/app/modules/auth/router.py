from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.unit_of_work import UnitOfWork
from app.modules.auth.schemas import RegisterRequest, LoginRequest, AuthResponse
from app.modules.auth.service import auth_service

router = APIRouter(prefix="/auth", tags=["Auth"])

def get_uow(db: Session = Depends(get_db)) -> UnitOfWork:
    return UnitOfWork(db)

@router.post("/registro", response_model=AuthResponse, status_code=201)
def register(data: RegisterRequest, uow: UnitOfWork = Depends(get_uow)):
    return auth_service.register(data, uow)

@router.post("/login", response_model=AuthResponse)
def login(data: LoginRequest, uow: UnitOfWork = Depends(get_uow)):
    return auth_service.login(data, uow)