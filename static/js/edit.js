const API_URL = '/employees';
const LIST_URL = '/';

let currentPhotoData = null;

document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    setupPhotoUpload();
    setupPhoneInput();
    loadEmployeeData();
});

function loadEmployeeData() {
    const employeeId = document.getElementById('employeeId').value;

    // Если есть ID - загружаем данные
    if (employeeId) {
        fetch(`${API_URL}/${employeeId}`)
            .then(response => {
                if (!response.ok) throw new Error('Сотрудник не найден');
                return response.json();
            })
            .then(data => {
                populateForm(data);
                showPhotoPreviewFromUrl(`/employees/${data.id}/image`);
            })
            .catch(error => {
                showMessage('Ошибка загрузки данных: ' + error.message, 'error');
            });
    }
}

function populateForm(data) {
    document.getElementById('surname').value = data.surname || '';
    document.getElementById('name').value = data.name || '';
    document.getElementById('patronymic').value = data.patronymic || '';
    document.getElementById('birthDate').value = data.birth_date ? data.birth_date.split('T')[0] : '';
    document.getElementById('phone').value = data.phone || '';

    if (data.gender !== undefined && data.gender !== null) {
        document.getElementById('gender').value = data.gender.toString();
    }
}

function setupPhotoUpload() {
    const photoInput = document.getElementById('photoInput');
    const removeBtn = document.getElementById('removePhoto');

    photoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const base64 = event.target.result.split(',')[1];
                currentPhotoData = base64;
                showPhotoPreview(base64);
                document.getElementById('removePhoto').style.display = 'inline-block';
            };
            reader.readAsDataURL(file);
        }
    });

    removeBtn.addEventListener('click', function() {
        currentPhotoData = null;
        showPlaceholder();
        document.getElementById('photoInput').value = '';
        this.style.display = 'none';
    });
}

function showPhotoPreview(base64Image) {
    const preview = document.getElementById('photoPreview');
    preview.innerHTML = `<img src="data:image/jpeg;base64,${base64Image}" alt="Фото сотрудника">`;
}

function showPlaceholder() {
    const preview = document.getElementById('photoPreview');
    preview.innerHTML = `
        <div class="photo-placeholder">
            <i class="fas fa-user"></i>
            <span>Нет фото</span>
        </div>
    `;
}

function showPhotoPreviewFromUrl(url) {
    const preview = document.getElementById('photoPreview');
    preview.innerHTML = '';

    const img = document.createElement('img');
    img.src = url;
    img.alt = 'Фото сотрудника';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.onerror = function() {
        showPlaceholder();
    };

    document.getElementById('removePhoto').style.display = 'inline-block';
    preview.appendChild(img);
}

function validateForm() {
    const surname = document.getElementById('surname').value.trim();
    const name = document.getElementById('name').value.trim();
    const birthDate = document.getElementById('birthDate').value;
    const gender = document.getElementById('gender').value;

    if (!surname) {
        showMessage('Пожалуйста, введите фамилию', 'error');
        document.getElementById('surname').focus();
        return false;
    }

    if (!name) {
        showMessage('Пожалуйста, введите имя', 'error');
        document.getElementById('name').focus();
        return false;
    }

    if (!birthDate) {
        showMessage('Пожалуйста, выберите дату рождения', 'error');
        document.getElementById('birthDate').focus();
        return false;
    }

    if (!gender) {
        showMessage('Пожалуйста, выберите пол', 'error');
        document.getElementById('gender').focus();
        return false;
    }

    return true;
}

async function submitForm(e) {
    e.preventDefault();

    if (!validateForm()) return;

    const employeeId = document.getElementById('employeeId').value;
    const isEdit = !!employeeId;

    const genderElement = document.getElementById('gender');
    if (!genderElement.value) {
        showMessage('Пожалуйста, выберите пол', 'error');
        genderElement.focus();
        genderElement.style.borderColor = '#e74c3c';
        return;
    }
    const genderBoolean = genderElement.value === 'true';

    const birthDateElement = document.getElementById('birthDate');
    const birthDateValue = birthDateElement.value;

    if (!birthDateValue) {
        showMessage('Пожалуйста, выберите дату рождения', 'error');
        birthDateElement.focus();
        birthDateElement.style.borderColor = '#e74c3c';
        return;
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(birthDateValue)) {
        showMessage('Пожалуйста, введите корректную дату в формате ГГГГ-ММ-ДД', 'error');
        birthDateElement.focus();
        return;
    }

    const formData = {
        name: document.getElementById('name').value.trim(),
        surname: document.getElementById('surname').value.trim(),
        patronymic: document.getElementById('patronymic').value.trim() || null,
        birth_date: document.getElementById('birthDate').value,
        phone: document.getElementById('phone').value.trim() || null,
        gender: genderBoolean,
        img_full: currentPhotoData || null,
    };

    showMessage('Сохранение...', 'loading');

    try {
        let url = `${API_URL}/new/${employeeId}`;
        let method = 'POST';

        if (isEdit) {
            url = `${API_URL}/edit/${employeeId}`;
            method = 'PUT';
        }

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Ошибка сохранения');
        }

        const result = await response.json();
        showMessage('Сотрудник успешно сохранен!', 'success');

        // Перенаправляем на список через 1.5 секунды
        setTimeout(() => {
            window.location.href = LIST_URL;
        }, 1500);

    } catch (error) {
        showMessage('Ошибка: ' + error.message, 'error');
    }
}

function setupEventListeners() {
    const form = document.getElementById('employeeForm');
    const cancelBtn = document.getElementById('cancelBtn');

    form.addEventListener('submit', submitForm);

    cancelBtn.addEventListener('click', function() {
        if (confirm('Вы уверены, что хотите отменить изменения?')) {
            window.location.href = LIST_URL;
        }
    });
}

function setupPhoneInput(){
    const phoneInput = document.getElementById('phone');
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


function showMessage(text, type = 'info') {
    const container = document.getElementById('messageContainer');

    const types = {
        success: 'message-success',
        error: 'message-error',
        loading: 'message-loading',
        info: 'message-loading'
    };

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        loading: 'fa-spinner fa-spin',
        info: 'fa-info-circle'
    };

    container.innerHTML = `
        <div class="message ${types[type] || types.info}">
            <span>${text}</span>
        </div>
    `;

    if (type !== 'error' && type !== 'loading') {
        setTimeout(() => {
            const msg = container.querySelector('.message');
            if (msg) {
                msg.style.transition = 'opacity 0.5s';
                msg.style.opacity = '0';
                setTimeout(() => {
                    container.innerHTML = '';
                }, 500);
            }
        }, 5000);
    }
}