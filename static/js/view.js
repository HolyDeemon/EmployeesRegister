const API_URL = '/employees';

let employees = [];
let filteredEmployees = [];

function calculateAge(birthDate) {
    if (!birthDate) return '-';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function formatPhone(phone) {
    if (!phone) return '-';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('7')) {
        return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`;
    }
    if (cleaned.length === 11 && cleaned.startsWith('8')) {
        return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`;
    }
    return phone;
}

function getGenderBadge(gender) {
    if (gender === true) {
        return '<span class="badge-gender badge-male"> Мужской</span>';
    } else if (gender === false) {
        return '<span class="badge-gender badge-female"> Женский</span>';
    }
    return '<span class="badge-gender">-</span>';
}

//Загрузка сотрудников с бэкенда
async function loadEmployees() {
    showLoading(true);
    hideError();
    hideEmpty();

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Ошибка загрузки данных');
        employees = await response.json();

        filteredEmployees = [...employees];
        renderTable(filteredEmployees);
        updateStats(filteredEmployees.length);
        showLoading(false);

    } catch (error) {
        console.error('Ошибка:', error);
        showLoading(false);
        showError();
    }
}

//Фильтры
function applyFilters() {
    const nameQuery = document.getElementById('searchName').value.trim().toLowerCase();
    const phoneQuery = document.getElementById('searchPhone').value.trim();
    const filterMale = document.getElementById('filterMale').checked;
    const filterFemale = document.getElementById('filterFemale').checked;
    const ageFrom = parseInt(document.getElementById('ageFrom').value);
    const ageTo = parseInt(document.getElementById('ageTo').value);

    filteredEmployees = employees.filter(employee => {
        if (nameQuery) {
            const fullName = `${employee.name} ${employee.surname} ${employee.patronymic || ''}`.toLowerCase();
            if (!fullName.includes(nameQuery)) return false;
        }
        if (phoneQuery) {
            const phoneClean = employee.phone ? employee.phone.replace(/\D/g, '') : '';
            const queryClean = phoneQuery.replace(/\D/g, '');
            if (!phoneClean.includes(queryClean)) return false;
        }

        if (filterMale && !filterFemale && employee.gender !== true) return false;
        if (!filterMale && filterFemale && employee.gender !== false) return false;

        const age = calculateAge(employee.birth_date);
        if (!isNaN(ageFrom) && age < ageFrom) return false;
        if (!isNaN(ageTo) && age > ageTo) return false;

        return true;
    });

    renderTable(filteredEmployees);
    updateStats(filteredEmployees.length);
}

// Сброс фильтров
function resetFilters() {
    document.getElementById('searchName').value = '';
    document.getElementById('searchPhone').value = '';
    document.getElementById('filterMale').checked = false;
    document.getElementById('filterFemale').checked = false;
    document.getElementById('ageFrom').value = '';
    document.getElementById('ageTo').value = '';

    filteredEmployees = [...employees];
    renderTable(filteredEmployees);
    updateStats(filteredEmployees.length);
}

// Рендер таблицы
function renderTable(employeesList) {
    const tbody = document.getElementById('tableBody');
    if (!employeesList || employeesList.length === 0) {
        tbody.innerHTML = '';
        showEmpty();
        return;
    }

    hideEmpty();

    tbody.innerHTML = employeesList.map((employee, index) => {
        const age = calculateAge(employee.birth_date);
        const fullName = `${employee.surname} ${employee.name} ${employee.patronymic || ''}`;

        return `
            <tr>
                <td data-label="#"><span class="nobr">${index + 1}</span></td>
                <td data-label="Фото">
                    <div class="photo-cell"
                         onmouseenter="showHoverImage(event, '/employees/${employee.id}/image')"
                         onmouseleave="hideHoverImage()"
                         onmousemove="moveHoverImage(event)">

                        <img src="/employees/${employee.id}/image"
                            alt="${fullName}"
                            style="width:100%;height:100%;object-fit:cover;"
                            onerror="this.onerror=null; this.parentElement.innerHTML='<span style=\\'font-size:14px;color:#666;\\'>Нет</span>'">
                        <img src="/employees/${employee.id}/image"
                              class="hover-image"
                              alt="${fullName}"
                              onerror="this.style.display='none'">
                    </div>
                </td>
                <td data-label="ФИО"><strong>${fullName}</strong></td>
                <td data-label="Возраст">${age}</td>
                <td data-label="Телефон">
                    ${employee.phone ? `<a href="tel:${employee.phone}">${formatPhone(employee.phone)}</a>` : '-'}
                </td>
                <td data-label="Пол">${getGenderBadge(employee.gender)}</td>
                <td data-label="Действия" style="text-align: center;">
                    <div class="action-buttons">
                        <button class="button button-edit" onclick="editEmployee(${employee.id})">
                            Редактировать
                        </button>
                        <button class="button button-delete" onclick="deleteEmployee(${employee.id})">
                            Удалить
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function updateStats(foundCount) {
    document.getElementById('totalEmployees').textContent = employees.length;
    document.getElementById('foundCount').textContent = foundCount;
}

// Удаление сотрудника
async function deleteEmployee(id) {
    if (!confirm('Вы уверены, что хотите удалить этого сотрудника?')) return;

    try {
        const response = await fetch(`${API_URL}/delete/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Ошибка удаления');

        employees = employees.filter(e => e.id !== id);
        filteredEmployees = filteredEmployees.filter(e => e.id !== id);
        renderTable(filteredEmployees);
        updateStats(filteredEmployees.length);

    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось удалить сотрудника');
    }
}

function showLoading(show) {
    const loadingState = document.getElementById('loadingState');
    const tableBody = document.getElementById('tableBody');
    const employeeTable = document.getElementById('employeeTable');

    if (loadingState) loadingState.style.display = show ? 'block' : 'none';
    if (tableBody) tableBody.style.display = show ? 'none' : '';
    if (employeeTable) employeeTable.style.display = show ? 'none' : '';
}

function showEmpty() {
    const emptyState = document.getElementById('emptyState');
    const employeeTable = document.getElementById('employeeTable');

    if (emptyState) emptyState.style.display = 'block';
    if (employeeTable) employeeTable.style.display = 'none';
}

function hideEmpty() {
    const emptyState = document.getElementById('emptyState');
    const employeeTable = document.getElementById('employeeTable');

    if (emptyState) emptyState.style.display = 'none';
    if (employeeTable) employeeTable.style.display = '';
}

function showError() {
    const errorState = document.getElementById('errorState');
    const employeeTable = document.getElementById('employeeTable');

    if (errorState) errorState.style.display = 'block';
    if (employeeTable) employeeTable.style.display = 'none';
}

function hideError() {
    const errorState = document.getElementById('errorState');
    if (errorState) errorState.style.display = 'none';
}
let hoverImageElement = null;

// Функция для показа увеличенного изображения
function showHoverImage(event, imageUrl) {
    const cell = event.currentTarget;
    const hoverImg = cell.querySelector('.hover-image');

    if (!hoverImg) return;

    // Устанавливаем URL изображения
    hoverImg.src = imageUrl;

    // Позиционируем относительно курсора
    const x = event.clientX + 15;
    const y = event.clientY + 15;

    hoverImg.style.left = x + 'px';
    hoverImg.style.top = y + 'px';
    hoverImg.style.display = 'block';

    // Сохраняем ссылку на элемент
    hoverImageElement = hoverImg;
}

// Функция для перемещения увеличенного изображения
function moveHoverImage(event) {
    if (!hoverImageElement) return;

    const x = event.clientX + 15;
    const y = event.clientY + 15;

    // Проверяем, чтобы изображение не выходило за пределы экрана
    const imgWidth = 300;
    const imgHeight = 300;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let finalX = x;
    let finalY = y;

    if (x + imgWidth > windowWidth) {
        finalX = event.clientX - imgWidth - 15;
    }

    if (y + imgHeight > windowHeight) {
        finalY = event.clientY - imgHeight - 15;
    }

    hoverImageElement.style.left = finalX + 'px';
    hoverImageElement.style.top = finalY + 'px';
}

// Функция для скрытия увеличенного изображения
function hideHoverImage() {
    if (hoverImageElement) {
        hoverImageElement.style.display = 'none';
        hoverImageElement = null;
    }
}

function setupEventListeners() {
    const applyBtn = document.getElementById('applyFilters');
    const resetBtn = document.getElementById('resetFilters');

    if (applyBtn) applyBtn.addEventListener('click', applyFilters);
    if (resetBtn) resetBtn.addEventListener('click', resetFilters);

    let searchTimeout;
    ['searchName', 'searchPhone', 'filterGender', 'ageFrom', 'ageTo'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', function() {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(applyFilters, 500);
            });
            if (el.tagName === 'SELECT') {
                el.addEventListener('change', applyFilters);
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadEmployees();
    setupPhone();
});

function setupPhone() {
    const phoneInput = document.getElementById('searchPhone');
    if (phoneInput) {
        Inputmask({
            mask: '+7 (999) 999-99-99',
            placeholder: '_',
            showMaskOnHover: true,
            showMaskOnFocus: true,
            clearIncomplete: false
        }).mask(phoneInput);
    }
}

function editEmployee(id) {
    window.location.href = `/edit/${id}`;
}

window.deleteEmployee = deleteEmployee;
window.loadEmployees = loadEmployees;