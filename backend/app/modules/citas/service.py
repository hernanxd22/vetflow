from sqlalchemy.orm import Session
from sqlalchemy import text, bindparam
from typing import List
from app.modules.citas.schemas import CitaClienteResponse, CitaAdminResponse, CitaVetResponse


# The n8n workflow inserts a citas row as soon as a conversation starts and
# fills mascota_id, veterinario_id, fecha and hora over the following turns.
# Every abandoned conversation therefore leaves a half-written row behind.
# Only these three states describe an actual appointment; the rest are
# conversation states and must not reach the calendar.
ESTADOS_VISIBLES = ["confirmado", "cancelado", "completado"]


def _estados(sql: str):
    """Compiles a query with an expanding IN clause for ESTADOS_VISIBLES."""
    return text(sql).bindparams(bindparam("estados", expanding=True))


# LEFT JOIN rather than INNER JOIN: a cita whose mascota was deleted still
# belongs in the history, and dropping the row silently would hide it instead.
_SQL_CLIENTE = _estados("""
    SELECT c.id, c.fecha::text, c.hora::text, c.estado, c.mascota_id,
           COALESCE(m.nombre, 'Sin mascota') AS mascota_nombre
    FROM citas c
    LEFT JOIN mascotas m ON c.mascota_id = m.id
    WHERE c.cliente_id = :cliente_id
      AND c.estado IN :estados
    ORDER BY c.fecha DESC NULLS LAST, c.hora DESC NULLS LAST
""")

_SQL_ADMIN = _estados("""
    SELECT c.id, c.fecha::text, c.hora::text, c.estado, c.mascota_id,
           COALESCE(m.nombre, 'Sin mascota') AS mascota_nombre,
           c.cliente_id,
           cl.nombre || ' ' || cl.apellido AS cliente_nombre,
           vet.nombre || ' ' || vet.apellido AS veterinario_nombre
    FROM citas c
    LEFT JOIN mascotas m ON c.mascota_id = m.id
    JOIN clientes cl ON c.cliente_id = cl.id
    LEFT JOIN clientes vet ON c.veterinario_id = vet.id
    WHERE c.estado IN :estados
    ORDER BY c.fecha DESC NULLS LAST, c.hora DESC NULLS LAST
""")

_SQL_VET = _estados("""
    SELECT c.id, c.fecha::text, c.hora::text, c.estado, c.mascota_id,
           COALESCE(m.nombre, 'Sin mascota') AS mascota_nombre,
           cl.nombre || ' ' || cl.apellido AS cliente_nombre
    FROM citas c
    LEFT JOIN mascotas m ON m.id = c.mascota_id
    JOIN clientes cl ON cl.id = c.cliente_id
    WHERE c.veterinario_id = :veterinario_id
      AND c.estado IN :estados
    ORDER BY c.fecha ASC NULLS LAST, c.hora ASC NULLS LAST
""")


def get_citas_cliente(cliente_id: int, db: Session) -> List[CitaClienteResponse]:
    rows = db.execute(
        _SQL_CLIENTE, {"cliente_id": cliente_id, "estados": ESTADOS_VISIBLES}
    ).fetchall()
    return [
        CitaClienteResponse(
            id=row[0], fecha=row[1], hora=row[2],
            estado=row[3], mascota_id=row[4], mascota_nombre=row[5]
        )
        for row in rows
    ]


def get_citas_admin(db: Session) -> List[CitaAdminResponse]:
    rows = db.execute(_SQL_ADMIN, {"estados": ESTADOS_VISIBLES}).fetchall()
    return [
        CitaAdminResponse(
            id=row[0], fecha=row[1], hora=row[2],
            estado=row[3], mascota_id=row[4], mascota_nombre=row[5],
            cliente_id=row[6], cliente_nombre=row[7], veterinario_nombre=row[8]
        )
        for row in rows
    ]


def get_citas_veterinario(veterinario_id: int, db: Session) -> List[CitaVetResponse]:
    rows = db.execute(
        _SQL_VET, {"veterinario_id": veterinario_id, "estados": ESTADOS_VISIBLES}
    ).fetchall()
    return [
        CitaVetResponse(
            id=row[0], fecha=row[1], hora=row[2],
            estado=row[3], mascota_id=row[4], mascota_nombre=row[5],
            cliente_nombre=row[6]
        )
        for row in rows
    ]
