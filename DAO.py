from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.future import select
from database import async_session_maker
from model import User


class BaseDAO:
    model = None

    @classmethod
    async def find_one_or_none_by_id(cls, data_id: int):
        async with async_session_maker() as session:
            query = select(cls.model).filter_by(id=data_id)
            result = await session.execute(query)
            return result.scalar_one_or_none()

    @classmethod
    async def find_all(cls, **filter_by):
        async with async_session_maker() as session:
            query = select(cls.model)
            if filter_by:
                query = query.filter_by(**filter_by)
            result = await session.execute(query)
            return result.scalars().all()

    @classmethod
    async def add(cls, **values):
        async with async_session_maker() as session:
            new_instance = cls.model(**values)
            session.add(new_instance)
            try:
                await session.commit()
                await session.refresh(new_instance)
            except SQLAlchemyError as e:
                await session.rollback()
                raise e
            return new_instance

    @classmethod
    async def delete_by_id(cls, data_id: int):
        async with async_session_maker() as session:
            query = select(cls.model).filter_by(id=data_id)
            result = await session.execute(query)
            try:
                instance = result.scalar_one_or_none()
                if instance != None:
                    await session.delete(instance)
                await session.commit()
                return True
            except SQLAlchemyError as e:
                await session.rollback()
                raise False

    @classmethod
    async def update_by_id(cls, data_id: int, **kwargs):
        async with async_session_maker() as session:
            query = select(cls.model).filter_by(id=data_id)
            result = await session.execute(query)
            try:
                instance = result.scalar_one_or_none()
                for key, value in kwargs.items():
                    if value is None or (isinstance(value, str) and value.lower() == 'none'):
                        continue
                    setattr(instance, key, value)
                await session.commit()
                return True
            except SQLAlchemyError as e:
                await session.rollback()
                return False


class UsersDAO(BaseDAO):
    model = User