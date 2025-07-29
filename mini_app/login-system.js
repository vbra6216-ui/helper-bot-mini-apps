// 🔒 ТЕМНАЯ СИСТЕМА ВХОДА

class LoginSystem {
    constructor() {
        this.password = '407264'; // Пароль по умолчанию
        this.currentInput = '';
        this.currentIndex = 0;
        this.maxLength = 6;
        this.isAuthenticated = false;
        
        this.init();
    }

    init() {
        // Проверяем авторизацию при загрузке
        if (this.checkAuth()) {
            this.authenticate();
            return;
        }

        this.bindEvents();
        this.updateDisplay();
        this.focusCurrentField();
        
        // Показываем экран входа только если не авторизован
        setTimeout(() => {
            this.showLoginScreen();
        }, 100);
    }

    checkAuth() {
        const isAuthenticated = localStorage.getItem('isAuthenticated');
        const authTimestamp = localStorage.getItem('authTimestamp');
        
        if (isAuthenticated && authTimestamp) {
            const now = Date.now();
            const authTime = parseInt(authTimestamp);
            const hoursSinceAuth = (now - authTime) / (1000 * 60 * 60);
            
            // Авторизация действительна 24 часа
            if (hoursSinceAuth < 24) {
                return true;
            } else {
                // Очищаем устаревшую авторизацию
                localStorage.removeItem('isAuthenticated');
                localStorage.removeItem('authTimestamp');
            }
        }
        
        return false;
    }

    showLoginScreen() {
        const overlay = document.getElementById('loginOverlay');
        const mainContent = document.querySelector('.main-content');
        
        if (overlay) {
            overlay.style.display = 'flex';
        }
        
        if (mainContent) {
            mainContent.classList.add('blurred');
        }
    }

    hideLoginScreen() {
        const overlay = document.getElementById('loginOverlay');
        const mainContent = document.querySelector('.main-content');
        
        if (overlay) {
            overlay.style.display = 'none';
        }
        
        if (mainContent) {
            mainContent.classList.remove('blurred');
        }
    }

    bindEvents() {
        // Цифровые кнопки
        document.querySelectorAll('.login-key[data-digit]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const digit = e.target.dataset.digit;
                this.addDigit(digit);
            });
        });

        // Кнопка Backspace
        const backspaceBtn = document.getElementById('backspaceBtn');
        if (backspaceBtn) {
            backspaceBtn.addEventListener('click', () => {
                this.removeDigit();
            });
        }

        // Кнопка очистить
        const clearBtn = document.getElementById('clearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearAll();
            });
        }

        // Кнопка войти
        const enterBtn = document.getElementById('enterBtn');
        if (enterBtn) {
            enterBtn.addEventListener('click', () => {
                this.checkPassword();
            });
        }

        // Обработка клавиатуры
        document.addEventListener('keydown', (e) => {
            this.handleKeydown(e);
        });

        // Обработка вставки из буфера
        document.addEventListener('paste', (e) => {
            this.handlePaste(e);
        });
    }

    addDigit(digit) {
        if (this.currentInput.length < this.maxLength) {
            this.currentInput += digit;
            this.currentIndex = this.currentInput.length;
            this.updateDisplay();
            this.focusCurrentField();
            
            // Автоматический переход к следующему полю
            if (this.currentInput.length < this.maxLength) {
                setTimeout(() => {
                    this.focusCurrentField();
                }, 100);
            }
        }
    }

    removeDigit() {
        if (this.currentInput.length > 0) {
            this.currentInput = this.currentInput.slice(0, -1);
            this.currentIndex = this.currentInput.length;
            this.updateDisplay();
            this.focusCurrentField();
        }
    }

    clearAll() {
        this.currentInput = '';
        this.currentIndex = 0;
        this.updateDisplay();
        this.focusCurrentField();
        this.clearError();
    }

    checkPassword() {
        if (this.currentInput === this.password) {
            this.showSuccess();
        } else {
            this.showError();
        }
    }

    showSuccess() {
        // Анимация успеха
        document.querySelectorAll('.login-field').forEach(field => {
            field.classList.add('filled');
        });

        setTimeout(() => {
            this.authenticate();
        }, 800);
    }

    showError() {
        // Анимация ошибки
        document.querySelectorAll('.login-field').forEach(field => {
            field.classList.add('error');
        });

        setTimeout(() => {
            this.clearError();
        }, 2000);
    }

    clearError() {
        document.querySelectorAll('.login-field').forEach(field => {
            field.classList.remove('error');
        });
    }

    authenticate() {
        // Сохраняем состояние авторизации
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('authTimestamp', Date.now().toString());

        this.isAuthenticated = true;
        
        // Скрываем экран входа
        this.hideLoginScreen();
        
        // Инициализируем основное приложение
        this.initMainApp();
    }

    logout() {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('authTimestamp');
        this.isAuthenticated = false;
        location.reload();
    }

    initMainApp() {
        console.log('Пользователь авторизован!');
        
        // Инициализируем Telegram Web App
        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.ready();
            window.Telegram.WebApp.expand();
        }
        
        // Запускаем основное приложение
        if (typeof initApp === 'function') {
            initApp();
        }
    }

    updateDisplay() {
        // Обновляем поля ввода
        const fields = document.querySelectorAll('.login-field');
        fields.forEach((field, index) => {
            const digit = this.currentInput[index] || '';
            field.textContent = digit;
            
            if (digit) {
                field.classList.add('filled');
            } else {
                field.classList.remove('filled');
            }
        });

        // Обновляем точки
        const dots = document.querySelectorAll('.login-dot');
        dots.forEach((dot, index) => {
            if (index < this.currentInput.length) {
                dot.classList.add('filled');
            } else {
                dot.classList.remove('filled');
            }
        });
    }

    focusCurrentField() {
        // Убираем фокус со всех полей
        document.querySelectorAll('.login-field').forEach(field => {
            field.classList.remove('focus');
        });

        // Устанавливаем фокус на текущее поле
        if (this.currentIndex < this.maxLength) {
            const currentField = document.querySelector(`[data-index="${this.currentIndex}"]`);
            if (currentField) {
                currentField.classList.add('focus');
            }
        }
    }

    handleKeydown(e) {
        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                this.checkPassword();
                break;
            case 'Escape':
                e.preventDefault();
                this.clearAll();
                break;
            case 'Backspace':
                e.preventDefault();
                this.removeDigit();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                if (this.currentIndex > 0) {
                    this.currentIndex--;
                    this.focusCurrentField();
                }
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (this.currentIndex < this.maxLength) {
                    this.currentIndex++;
                    this.focusCurrentField();
                }
                break;
            default:
                if (/^[0-9]$/.test(e.key)) {
                    e.preventDefault();
                    this.addDigit(e.key);
                }
                break;
        }
    }

    handlePaste(e) {
        e.preventDefault();
        const pastedData = (e.clipboardData || window.clipboardData).getData('text');
        const numbers = pastedData.replace(/\D/g, '').slice(0, this.maxLength);
        
        if (numbers.length === this.maxLength) {
            this.currentInput = numbers;
            this.currentIndex = this.maxLength;
            this.updateDisplay();
            this.focusCurrentField();
        }
    }
}

// Глобальная функция для выхода
function logout() {
    if (window.loginSystem) {
        window.loginSystem.logout();
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.loginSystem = new LoginSystem();
});

// Экспорт для использования в других модулях
window.LoginSystem = LoginSystem; 