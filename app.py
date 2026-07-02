import base64

from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse, HTMLResponse, Response
from fastapi.exceptions import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from DAO import UsersDAO
from datetime import datetime

from schemas import UserResponse

app = FastAPI()
app.mount('/static', StaticFiles(directory='static'), name='static')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Разрешить запросы с любых источников. Можете ограничить список доменов
    allow_credentials=True,
    allow_methods=["*"],  # Разрешить все методы (GET, POST, PUT, DELETE и т.д.)
    allow_headers=["*"],  # Разрешить все заголовки
)

templates = Jinja2Templates(directory='template')

@app.head("/")

@app.get("/", response_class=HTMLResponse, summary="Таблица сотрудников")
async def get_table(request: Request):
    return templates.TemplateResponse(request, "view.html")


@app.get("/employees/", response_model=list[UserResponse], summary="Сотрудники")
async def get_employees():
    users = await UsersDAO.find_all()
    print([user.name for user in users])
    return users


@app.get("/employees/{id}", response_model=UserResponse, summary="Сотрудники")
async def get_employee(id : int):
    user = await UsersDAO.find_one_or_none_by_id(id)
    print(user.name)
    return user


@app.get("/employees/{id}/image")
async def get_employee_image(id: int):
    user = await UsersDAO.find_one_or_none_by_id(id)

    if not user or not user.img_full:
        raise HTTPException(status_code=404)

    # Добавляем заголовки для кеширования
    return Response(
        content=user.img_full,
        media_type="image/jpeg",
        headers={
            "Cache-Control": "public, max-age=86400",  # Кеш на 24 часа
            "ETag": f'"{hash(user.img_full)}"'
        }
    )

@app.post("/employees/new", summary="Создание сотрудника")
async def add_new(request: Request):
    data = await request.json()

    image_bytes = None
    if data.get("image_base64"):
        try:
            image_bytes = base64.b64decode(data["image_base64"])
        except Exception as e:
            raise HTTPException(400, f"Ошибка декодирования изображения: {e}")

    if data.get("birth_date"):
        birth_date = datetime.fromisoformat(data.get("birth_date"))
    else:
        raise HTTPException(status_code=400, detail="birth_date is required")

    await UsersDAO.add(
        img_full = image_bytes,
        name= data.get("name"),
        surname=data.get("surname"),
        patronymic= data.get("patronymic"),
        birth_date= birth_date,
        phone= data.get("phone"),
        gender= data.get("gender")
    )
    raise HTTPException(status_code=200)

@app.put("/employees/edit/{id}", summary="Редактировать сотрудника")
async def edit_employee(request: Request, id: int):
    data = await request.json()

    image_base64 = data.get("img_full")
    image_bytes = None
    image_thumb_bytes = None
    if image_base64 != None:
        image_bytes = base64.b64decode(image_base64)
    print(image_bytes, image_thumb_bytes)

    birth_date_str = data.get("birth_date")
    if birth_date_str:
        birth_date = datetime.fromisoformat(birth_date_str)
    else:
        raise HTTPException(status_code=400, detail="birth_date is required")

    edited = await UsersDAO.update_by_id(data_id=id,
        img_full= image_bytes,
        name=data.get("name"),
        surname=data.get("surname"),
        patronymic=data.get("patronymic"),
        birth_date=birth_date,
        phone=data.get("phone"),
        gender=data.get("gender")
    )
    if edited:
        return HTTPException(status_code=200)
    else:
        return HTTPException(status_code=400)


@app.delete("/employees/delete/{id}", summary="Удалить сотрудника")
async def delete_employee(id: int):
    deleted = await UsersDAO.delete_by_id(id)
    if deleted:
        return HTTPException(status_code=200)
    else:
        return HTTPException(status_code=400)


#редактирование
@app.get("/edit/{id}", response_class=HTMLResponse, summary="Редактирование сотрудника")
async def get_view(request: Request, id: int):
    user = await UsersDAO.find_one_or_none_by_id(id)

    if user == None:
        context = {"error": "Сотрудник не найден"}
    else:
        context = {"employee": user}

    return templates.TemplateResponse(
        request=request,
        name="edit.html",
        context=context
    )


#новый
@app.get("/edit", response_class=HTMLResponse, summary="Создание сотрудника")
async def get_table(request: Request):
    return templates.TemplateResponse(request, "edit.html")
