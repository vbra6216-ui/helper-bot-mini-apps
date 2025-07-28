// ===== СИСТЕМА ЗАЩИТЫ ПАРОЛЕМ =====

class PasswordProtection {
    constructor() {
        this.correctPassword = '407264';
        this.currentPassword = '';
        this.maxLength = 6;
        this.isAuthenticated = false;
        
        // Элементы DOM
        this.passwordScreen = document.getElementById('passwordScreen');
        this.mainApp = document.getElementById('mainApp');
        this.passwordDigits = document.querySelectorAll('.password-digit');
        this.passwordDots = document.querySelectorAll('.password-dot');
        this.passwordError = document.getElementById('passwordError');
        this.clearButton = document.getElementById('clearPassword');
        this.submitButton = document.getElementById('submitPassword');
        
        this.initialize();
    }
    
    initialize() {
        // Проверяем, авторизован ли пользователь
        const isAuthenticated = localStorage.getItem('helperBotAuthenticated');
        if (isAuthenticated === 'true') {
            this.showMainApp();
            return;
        }
        
        this.setupEventListeners();
        this.focusFirstDigit();
    }
    
    setupEventListeners() {
        // Обработчики для полей ввода
        this.passwordDigits.forEach((digit, index) => {
            digit.addEventListener('input', (e) => this.handleDigitInput(e, index));
            digit.addEventListener('keydown', (e) => this.handleKeyDown(e, index));
            digit.addEventListener('paste', (e) => this.handlePaste(e));
            digit.addEventListener('focus', () => this.handleFocus(index));
        });
        
        // Кнопки действий
        this.clearButton.addEventListener('click', () => this.clearPassword());
        this.submitButton.addEventListener('click', () => this.submitPassword());
        
        // Цифровая клавиатура
        this.setupNumericKeypad();
        
        // Обработка нажатия Enter
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.submitPassword();
            }
        });
        
        // Обработка нажатия Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.clearPassword();
            }
        });
    }
    
    handleDigitInput(event, index) {
        const value = event.target.value;
        
        // Ограничиваем ввод только цифрами
        if (!/^\d*$/.test(value)) {
            event.target.value = '';
            return;
        }
        
        // Обновляем текущий пароль
        this.currentPassword = this.currentPassword.substring(0, index) + value + this.currentPassword.substring(index + 1);
        
        // Обновляем визуальное отображение
        this.updatePasswordDisplay();
        
        // Переходим к следующему полю
        if (value && index < this.maxLength - 1) {
            this.passwordDigits[index + 1].focus();
        }
        
        // Проверяем, заполнен ли пароль
        this.checkPasswordComplete();
    }
    
    handleKeyDown(event, index) {
        // Обработка Backspace
        if (event.key === 'Backspace' && !event.target.value && index > 0) {
            this.passwordDigits[index - 1].focus();
            this.passwordDigits[index - 1].select();
        }
        
        // Обработка стрелок
        if (event.key === 'ArrowLeft' && index > 0) {
            this.passwordDigits[index - 1].focus();
        }
        
        if (event.key === 'ArrowRight' && index < this.maxLength - 1) {
            this.passwordDigits[index + 1].focus();
        }
    }
    
    handlePaste(event) {
        event.preventDefault();
        const pastedData = (event.clipboardData || window.clipboardData).getData('text');
        const numbers = pastedData.replace(/\D/g, '').substring(0, this.maxLength);
        
        if (numbers.length === this.maxLength) {
            this.currentPassword = numbers;
            this.updatePasswordDisplay();
            this.checkPasswordComplete();
        }
    }
    
    handleFocus(index) {
        // Подсвечиваем активное поле
        this.passwordDigits.forEach((digit, i) => {
            digit.classList.toggle('active', i === index);
        });
    }
    
    updatePasswordDisplay() {
        this.passwordDigits.forEach((digit, index) => {
            const value = this.currentPassword[index] || '';
            digit.value = value;
            
            // Обновляем классы
            digit.classList.toggle('filled', !!value);
            digit.classList.remove('error');
        });
        
        // Обновляем точки
        this.passwordDots.forEach((dot, index) => {
            const hasValue = !!this.currentPassword[index];
            dot.classList.toggle('filled', hasValue);
            dot.classList.remove('error');
        });
        
        // Скрываем ошибку при вводе
        this.hideError();
    }
    
    checkPasswordComplete() {
        const isComplete = this.currentPassword.length === this.maxLength;
        this.submitButton.disabled = !isComplete;
        
        if (isComplete) {
            this.submitButton.style.opacity = '1';
        } else {
            this.submitButton.style.opacity = '0.6';
        }
    }
    
    async submitPassword() {
        if (this.currentPassword.length !== this.maxLength) {
            return;
        }
        
        // Показываем состояние загрузки
        this.showLoading();
        
        // Имитируем проверку пароля
        await this.delay(1000);
        
        if (this.currentPassword === this.correctPassword) {
            this.showSuccess();
            await this.delay(800);
            this.authenticate();
        } else {
            this.showError();
            this.clearPassword();
        }
    }
    
    showLoading() {
        const container = document.querySelector('.password-container');
        container.classList.add('loading');
        this.submitButton.disabled = true;
    }
    
    showSuccess() {
        const container = document.querySelector('.password-container');
        container.classList.remove('loading');
        container.classList.add('success');
        
        // Анимация успешного входа
        this.passwordDigits.forEach(digit => {
            digit.classList.add('filled');
        });
        
        this.passwordDots.forEach(dot => {
            dot.classList.add('filled');
        });
    }
    
    showError() {
        const container = document.querySelector('.password-container');
        container.classList.remove('loading');
        
        // Анимация ошибки
        this.passwordDigits.forEach(digit => {
            digit.classList.add('error');
        });
        
        this.passwordDots.forEach(dot => {
            dot.classList.add('error');
        });
        
        // Показываем сообщение об ошибке
        this.passwordError.classList.add('show');
        
        // Скрываем ошибку через 3 секунды
        setTimeout(() => {
            this.hideError();
        }, 3000);
    }
    
    hideError() {
        this.passwordError.classList.remove('show');
    }
    
    clearPassword() {
        this.currentPassword = '';
        this.updatePasswordDisplay();
        this.hideError();
        this.focusFirstDigit();
        
        // Убираем классы ошибок
        this.passwordDigits.forEach(digit => {
            digit.classList.remove('error');
        });
        
        this.passwordDots.forEach(dot => {
            dot.classList.remove('error');
        });
    }
    
    focusFirstDigit() {
        this.passwordDigits[0].focus();
    }
    
    authenticate() {
        // Сохраняем состояние авторизации
        localStorage.setItem('helperBotAuthenticated', 'true');
        this.isAuthenticated = true;
        
        // Плавно скрываем экран пароля
        this.passwordScreen.style.opacity = '0';
        this.passwordScreen.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            this.passwordScreen.style.display = 'none';
            this.showMainApp();
        }, 300);
    }
    
    showMainApp() {
        this.mainApp.style.display = 'block';
        this.mainApp.style.opacity = '0';
        this.mainApp.style.transform = 'scale(0.9)';
        
        // Показываем кнопку выхода
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.style.display = 'block';
        }
        
        // Плавно показываем основное приложение
        setTimeout(() => {
            this.mainApp.style.opacity = '1';
            this.mainApp.style.transform = 'scale(1)';
        }, 50);
    }
    
    setupNumericKeypad() {
        // Обработчики для цифровых кнопок
        const keypadButtons = document.querySelectorAll('.keypad-btn[data-digit]');
        keypadButtons.forEach(button => {
            button.addEventListener('click', () => {
                const digit = button.dataset.digit;
                this.addDigit(digit);
                
                // Анимация нажатия
                button.classList.add('pressed');
                setTimeout(() => {
                    button.classList.remove('pressed');
                }, 100);
            });
        });
        
        // Обработчик для кнопки Backspace
        const backspaceBtn = document.getElementById('backspaceBtn');
        if (backspaceBtn) {
            backspaceBtn.addEventListener('click', () => {
                this.removeLastDigit();
                
                // Анимация нажатия
                backspaceBtn.classList.add('pressed');
                setTimeout(() => {
                    backspaceBtn.classList.remove('pressed');
                }, 100);
            });
        }
    }
    
    addDigit(digit) {
        if (this.currentPassword.length < this.maxLength) {
            this.currentPassword += digit;
            this.updatePasswordDisplay();
            this.checkPasswordComplete();
            
            // Переходим к следующему полю
            const nextIndex = this.currentPassword.length - 1;
            if (nextIndex < this.maxLength) {
                this.passwordDigits[nextIndex].focus();
            }
        }
    }
    
    removeLastDigit() {
        if (this.currentPassword.length > 0) {
            this.currentPassword = this.currentPassword.slice(0, -1);
            this.updatePasswordDisplay();
            this.checkPasswordComplete();
            
            // Переходим к предыдущему полю
            const prevIndex = this.currentPassword.length;
            if (prevIndex >= 0) {
                this.passwordDigits[prevIndex].focus();
            }
        }
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Метод для выхода из системы
    logout() {
        localStorage.removeItem('helperBotAuthenticated');
        this.isAuthenticated = false;
        this.currentPassword = '';
        
        // Показываем экран пароля
        this.passwordScreen.style.display = 'flex';
        this.passwordScreen.style.opacity = '1';
        this.passwordScreen.style.transform = 'scale(1)';
        
        // Скрываем основное приложение
        this.mainApp.style.display = 'none';
        
        // Очищаем поля
        this.clearPassword();
    }
    
    // Метод для изменения пароля
    changePassword(newPassword) {
        if (newPassword.length === 6 && /^\d{6}$/.test(newPassword)) {
            this.correctPassword = newPassword;
            return true;
        }
        return false;
    }
    
    // Метод для проверки авторизации
    isUserAuthenticated() {
        return this.isAuthenticated || localStorage.getItem('helperBotAuthenticated') === 'true';
    }
}

// Инициализация системы защиты
let passwordSystem;

// Ждем загрузки DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        passwordSystem = new PasswordProtection();
    });
} else {
    passwordSystem = new PasswordProtection();
}

// Экспорт для использования в основном приложении
window.passwordSystem = passwordSystem; 