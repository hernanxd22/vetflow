from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Cliente(Base):
    __tablename__ = "clientes"

    id         = Column(Integer, primary_key=True, index=True)
    nombre     = Column(String(100), nullable=False)
    apellido   = Column(String(100), nullable=False)
    dni        = Column(String(10), unique=True, nullable=False)
    telefono   = Column(String(20), nullable=True)
    username   = Column(String(50), unique=True, nullable=False)
    password   = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    mascotas = relationship("Mascota", back_populates="cliente")