from sqlalchemy.orm import Session
from app.modules.auth.models import Cliente
from typing import Optional

class ClienteRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_username(self, username: str) -> Optional[Cliente]:
        return self.db.query(Cliente).filter(Cliente.username == username).first()

    def get_by_dni(self, dni: str) -> Optional[Cliente]:
        return self.db.query(Cliente).filter(Cliente.dni == dni).first()

    def create(self, nombre: str, apellido: str, dni: str, telefono: str, username: str, hashed_password: str) -> Cliente:
        cliente = Cliente(
            nombre=nombre, apellido=apellido, dni=dni,
            telefono=telefono, username=username, password=hashed_password
        )
        self.db.add(cliente)
        self.db.flush()
        return cliente