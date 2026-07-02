	Чтобы запустить сервер локально подготовьте PostegreSQL базу данных. Для простоты лучше использовать pgAdmin4. Там создайте пользователя postegres c паролем 1234. Создайте базу данных localhost. 
	Затем перейдите в директорию проекта в проводнике. Нажмите там Shift+ПКМ и в выпавшем списке выберите "Открыть окно PowerShell здесь". В окне PowerShell пишите поочереди комманды:
	1) python -m venv venv
	2) venv\Scripts\Activate.ps1
	3) pip install -r requirements.txt
	4) alembic revision --autogenerate -m "1"
	5) alembic upgrade head
	6) python main.py

В последующие разы, чтобы запустить сервер, необходимо выполнить следующую последовательность комманд в окне PowerShell:
	1) venv\Scripts\Activate.ps1
	2) python main.py

Затем запускаете браузер и переходите по ссылке http://127.0.0.1:8000.