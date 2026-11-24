// ==========================================================================
// ЛАБОРАТОРНА РОБОТА №9: КЛІЄНТСЬКА ВАЛІДАЦІЯ ФОРМИ (Vanilla JavaScript)
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('feedbackForm');
    if (!form) return;

    // Елементи полів форми
    const fields = {
        username: document.getElementById('username'),
        email: document.getElementById('email'),
        phone: document.getElementById('phone'),
        message: document.getElementById('message'),
        agreement: document.getElementById('agreement')
    };

    const messageCounter = document.getElementById('messageCounter');
    const modal = document.getElementById('successModal');
    const closeModalBtn = document.getElementById('closeModalBtn');

    // Регулярні вирази (Етап 7)
    const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const REGEX_PHONE = /^\+380\d{9}$/;

    // Прапорець відстеження взаємодії, щоб не показувати помилки до вводу (Етап 9)
    const touched = {
        username: false,
        email: false,
        phone: false,
        message: false,
        agreement: false
    };

    // --- UI-ФУНКЦІЇ КЕРУВАННЯ СТАНАМИ (Етап 8) ---

    function showError(input, messageText) {
        const errorEl = document.getElementById(`${input.id}Error`);
        if (errorEl) {
            errorEl.textContent = messageText;
            errorEl.classList.remove('hidden');
        }
        input.setAttribute('aria-invalid', 'true');

        if (input.type !== 'checkbox') {
            input.classList.remove('border-[#333338]', 'border-green-500');
            input.classList.add('border-red-500');
        }
    }

    function showSuccess(input) {
        clearError(input);
        input.setAttribute('aria-invalid', 'false');

        if (input.type !== 'checkbox') {
            input.classList.remove('border-[#333338]', 'border-red-500');
            input.classList.add('border-green-500');
        }
    }

    function clearError(input) {
        const errorEl = document.getElementById(`${input.id}Error`);
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.classList.add('hidden');
        }
        input.setAttribute('aria-invalid', 'false');

        if (input.type !== 'checkbox') {
            input.classList.remove('border-red-500', 'border-green-500');
            input.classList.add('border-[#333338]');
        }
    }

    // --- ФУНКЦІЇ ВАЛІДАЦІЇ КОЖНОГО ПОЛЯ (Етап 8) ---

    function validateName() {
        const value = fields.username.value.trim();
        if (value.length < 2) {
            showError(fields.username, "Введіть ім'я (мінімум 2 символи).");
            return false;
        }
        showSuccess(fields.username);
        return true;
    }

    function validateEmail() {
        const value = fields.email.value.trim();
        if (!REGEX_EMAIL.test(value)) {
            showError(fields.email, 'Введіть коректну електронну адресу (наприклад, user@gmail.com).');
            return false;
        }
        showSuccess(fields.email);
        return true;
    }

    function validatePhone() {
        let value = fields.phone.value.trim();

        // UX-функція (Етап 10): якщо введено 10 цифр починаючи з 0 (0501234567), перетворюємо на +380...
        if (/^0\d{9}$/.test(value)) {
            value = '+38' + value;
            fields.phone.value = value;
        }

        if (!REGEX_PHONE.test(value)) {
            showError(fields.phone, 'Введіть номер строго у форматі +380XXXXXXXXX (9 цифр після +380, без пробілів).');
            return false;
        }
        showSuccess(fields.phone);
        return true;
    }

    function validateMessage() {
        const value = fields.message.value.trim();
        if (value.length < 10) {
            showError(fields.message, `Повідомлення занадто коротке (мінімум 10 символів, зараз: ${value.length}).`);
            return false;
        }
        showSuccess(fields.message);
        return true;
    }

    function validateAgreement() {
        if (!fields.agreement.checked) {
            showError(fields.agreement, 'Необхідно надати згоду на обробку персональних даних.');
            return false;
        }
        showSuccess(fields.agreement);
        return true;
    }

    // --- ДИНАМІЧНА ВАЛІДАЦІЯ: blur та input (Етап 9) ---

    const validators = {
        username: validateName,
        email: validateEmail,
        phone: validatePhone,
        message: validateMessage,
        agreement: validateAgreement
    };

    Object.keys(fields).forEach((key) => {
        const input = fields[key];

        // Фінальна перевірка при виході з поля (blur)
        input.addEventListener('blur', () => {
            touched[key] = true;
            validators[key]();
        });

        // Оновлення стану під час введення (input / change)
        const eventType = input.type === 'checkbox' ? 'change' : 'input';
        input.addEventListener(eventType, () => {
            if (key === 'message' && messageCounter) {
                messageCounter.textContent = `${input.value.length} / 500 символів`;
            }
            if (touched[key]) {
                validators[key]();
            }
        });
    });

    // --- МОДАЛЬНЕ ВІКНО (Етап 11) ---

    function openModal() {
        modal.classList.remove('hidden');
        closeModalBtn.focus(); // Переводимо клавіатурний фокус на кнопку закриття
    }

    function closeModal() {
        modal.classList.add('hidden');
    }

    closeModalBtn.addEventListener('click', closeModal);

    // Закриття при кліку на темний фон
    modal.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });

    // Закриття клавішею Escape (Етап 11 та 16)
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });

    // --- ОБРОБКА ВІДПРАВКИ ФОРМИ (submit) ---

    form.addEventListener('submit', (event) => {
        event.preventDefault(); // Блокуємо стандартне перезавантаження сторінки

        // Позначаємо всі поля як перевірені
        Object.keys(touched).forEach((key) => { touched[key] = true; });

        const isNameValid = validateName();
        const isEmailValid = validateEmail();
        const isPhoneValid = validatePhone();
        const isMessageValid = validateMessage();
        const isAgreementValid = validateAgreement();

        if (isNameValid && isEmailValid && isPhoneValid && isMessageValid && isAgreementValid) {
            openModal();
            form.reset();
            if (messageCounter) messageCounter.textContent = '0 / 500 символів';

            // Скидаємо візуальні стани та прапорці після очищення форми
            Object.keys(fields).forEach((key) => {
                touched[key] = false;
                clearError(fields[key]);
            });
        }
    });
});