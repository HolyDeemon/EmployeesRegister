#!binbash

echo === Starting Employees Register ===

# Применение миграций
echo Running migrations...
alembic upgrade head

# Запуск приложения
echo Starting application...
uvicorn app:app --host 0.0.0.0 --port $PORT