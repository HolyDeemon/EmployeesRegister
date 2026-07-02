from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class UserResponse(BaseModel):
    id: int
    name: str
    surname: str
    patronymic: Optional[str] = None
    birth_date: datetime
    phone: Optional[str] = None
    gender: bool

    class Config:
        from_attributes = True
