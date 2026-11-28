from fastapi import APIRouter, Depends

from app.config import Database
from app.deps import db

router = APIRouter(tags=["health"])


@router.get("/healthz")
async def healthz() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/readyz")
async def readyz(database: Database = Depends(db)) -> dict[str, str]:  # noqa: B008
    async with database.service_tx() as conn:
        await conn.fetchval("select 1")
    return {"status": "ready"}
