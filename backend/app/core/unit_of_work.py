from sqlalchemy.orm import Session
from app.modules.mascotas.repository import MascotaRepository
from app.modules.auth.repository import ClienteRepository

class UnitOfWork:
    def __init__(self, db: Session):
        self.db = db
        self.mascotas = MascotaRepository(db)
        self.clientes = ClienteRepository(db)

    def commit(self):
        self.db.commit()

    def rollback(self):
        self.db.rollback()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            self.rollback()
        else:
            self.commit()