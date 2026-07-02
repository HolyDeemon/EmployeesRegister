import os
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:1234@localhost:5432/EmployeesRegister"
)

Base = declarative_base()
engine = create_async_engine(
    url=DATABASE_URL,
    connect_args= {
        "server_settings": {
            "client_encoding": "UTF8",
        }
    }
)

async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,

)
