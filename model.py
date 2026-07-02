from sqlalchemy import Integer, String, Boolean,  LargeBinary
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from sqlalchemy import DateTime

from database import Base

class User(Base):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    img_full: Mapped[str] = mapped_column(LargeBinary, nullable=True)
    img_thumbnail: Mapped[str] = mapped_column(LargeBinary, nullable=True)

    name: Mapped[str] = mapped_column(String(50), nullable=False)
    surname: Mapped[str] = mapped_column(String(50), nullable=False)
    patronymic: Mapped[str] = mapped_column(String(50), nullable=True)

    birth_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    phone: Mapped[str] = mapped_column(String(20), nullable=True)

    gender: Mapped[bool] = mapped_column(Boolean, nullable=False)

