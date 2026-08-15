from fastapi import HTTPException, status
from passlib.context import CryptContext
from app.core.security import create_access_token
from app.core.unit_of_work import UnitOfWork
from app.modules.auth.schemas import RegisterRequest, LoginRequest, AuthResponse

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:

    def register(self, data: RegisterRequest, uow: UnitOfWork) -> AuthResponse:
        with uow:
            if uow.clientes.get_by_username(data.username):
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El usuario ya existe")
            if uow.clientes.get_by_dni(data.dni):
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El DNI ya está registrado")

            hashed = pwd_context.hash(data.password)
            cliente = uow.clientes.create(
                nombre=data.nombre, apellido=data.apellido,
                dni=data.dni, telefono=data.telefono,
                username=data.username, hashed_password=hashed
            )
            return AuthResponse(
                cliente_id=cliente.id, nombre=cliente.nombre,
                apellido=cliente.apellido, dni=cliente.dni, username=cliente.username,
                rol=cliente.rol,
                access_token=create_access_token(cliente.id)
            )

    def login(self, data: LoginRequest, uow: UnitOfWork) -> AuthResponse:
        cliente = uow.clientes.get_by_username(data.username)
        if not cliente or not pwd_context.verify(data.password, cliente.password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario o contraseña incorrectos")

        if cliente.estado and cliente.estado != "activo":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="La cuenta está desactivada")

        return AuthResponse(
            cliente_id=cliente.id, nombre=cliente.nombre,
            apellido=cliente.apellido, dni=cliente.dni, username=cliente.username,
            rol=cliente.rol,
            access_token=create_access_token(cliente.id)
        )

auth_service = AuthService()
