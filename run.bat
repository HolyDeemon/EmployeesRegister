@echo off
title Employees Register
cd /d "%~dp0"
echo Запуск установки и сервера...
echo.

echo [1/6] Активация venv...
call venv\Scripts\activate
echo.

echo [2/6] Установка зависимостей...
pip install -r requirements.txt
echo.

echo [3/6] Создание миграции...
python -m alembic revision --autogenerate -m "auto_migration"
echo.

echo [4/6] Применение миграций...
python -m alembic upgrade head
echo.

echo [5/6] Запуск сервера...
start /b python main.py
echo.

echo [6/6] Открытие браузера...
timeout /t 3 >nul
start msedge http://127.0.0.1:8000
echo.

echo Готово! Приложение запущено.
pause