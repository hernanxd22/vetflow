from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List
from app.modules.citas.schemas import CitaClienteResponse, CitaAdminResponse


def get_citas_cliente(cliente_id: int, db: Session) -> List[CitaClienteResponse]:
    sql = text("""
        SELECT c.id, c.fecha::text, c.hora::text, c.estado, m.nombre AS mascota_nombre
        FROM citas c
        JOIN mascotas m ON c.mascota_id = m.id
        WHERE c.cliente_id = :cliente_id AND c.estado = 'confirmado'
        AND (c.fecha > CURRENT_DATE OR (c.fecha = CURRENT_DATE AND c.hora >= CURRENT_TIME AT TIME ZONE 'America/Argentina/Buenos_Aires'))
        ORDER BY c.fecha ASC, c.hora ASC
    """)
    result = db.execute(sql, {"cliente_id": cliente_id})
    rows = result.fetchall()
    return [
        CitaClienteResponse(
            id=row[0], fecha=row[1], hora=row[2],
            estado=row[3], mascota_nombre=row[4]
        )
        for row in rows
    ]


def get_citas_admin(db: Session) -> List[CitaAdminResponse]:
    sql = text("""
        SELECT c.id, c.fecha::text, c.hora::text, c.estado,
               m.nombre AS mascota_nombre,
               cl.nombre || ' ' || cl.apellido AS cliente_nombre
        FROM citas c
        JOIN mascotas m ON c.mascota_id = m.id
        JOIN clientes cl ON c.cliente_id = cl.id
        WHERE c.estado = 'confirmado'
        ORDER BY c.fecha ASC, c.hora ASC
    """)
    result = db.execute(sql)
    rows = result.fetchall()
    return [
        CitaAdminResponse(
            id=row[0], fecha=row[1], hora=row[2],
            estado=row[3], mascota_nombre=row[4], cliente_nombre=row[5]
        )
        for row in rows
    ]
