// ===== ДОПОЛНИТЕЛЬНЫЕ ОПТИМИЗАЦИИ ПРОИЗВОДИТЕЛЬНОСТИ =====

// Определение типа устройства
const deviceInfo = {
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    isLowEnd: navigator.hardwareConcurrency <= 4,
    isSlowNetwork: navigator.connection && navigator.connection.effectiveType === 'slow-2g',
    isStandalone: window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches
};

// Оптимизация загрузки изображений
function optimizeImages() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        // Ленивая загрузка для изображений
        img.loading = 'lazy';
        
        // Оптимизация для мобильных устройств
        if (deviceInfo.isMobile) {
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
        }
    });
}

// Оптимизация анимаций
function optimizeAnimations() {
    if (deviceInfo.isLowEnd || deviceInfo.isSlowNetwork) {
        // Отключаем сложные анимации на слабых устройствах
        const style = document.createElement('style');
        style.textContent = `
            * {
                animation-duration: 0.1s !important;
                transition-duration: 0.1s !important;
            }
            
            .gradientShift {
                animation: none !important;
            }
            
            .action-card::before,
            .category-card::before {
                animation: none !important;
            }
        `;
        document.head.appendChild(style);
    }
}

// Оптимизация прокрутки
function optimizeScrolling() {
    if (deviceInfo.isMobile) {
        // Плавная прокрутка для мобильных устройств
        document.documentElement.style.scrollBehavior = 'smooth';
        
        // Оптимизация для устройств с вырезами
        if (CSS.supports('padding: env(safe-area-inset-top)')) {
            document.documentElement.style.setProperty('--safe-area-top', 'env(safe-area-inset-top)');
            document.documentElement.style.setProperty('--safe-area-bottom', 'env(safe-area-inset-bottom)');
        }
    }
}

// Оптимизация памяти
function optimizeMemory() {
    // Очистка неиспользуемых элементов
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                // Очищаем содержимое скрытых элементов
                const element = entry.target;
                if (element.classList.contains('search-suggestions') && element.children.length > 10) {
                    element.innerHTML = '';
                }
            }
        });
    });
    
    // Наблюдаем за элементами, которые могут накапливать контент
    const elementsToObserve = document.querySelectorAll('.search-suggestions, .modal-body');
    elementsToObserve.forEach(el => observer.observe(el));
}

// Оптимизация сети
function optimizeNetwork() {
    if (deviceInfo.isSlowNetwork) {
        // Уменьшаем количество запросов на медленных сетях
        const originalFetch = window.fetch;
        window.fetch = function(url, options) {
            // Добавляем кэширование для медленных сетей
            if (!options) options = {};
            if (!options.cache) options.cache = 'force-cache';
            return originalFetch(url, options);
        };
    }
}

// Оптимизация батареи
function optimizeBattery() {
    if (deviceInfo.isMobile) {
        // Отключаем анимации при низком заряде батареи
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                if (battery.level < 0.2) {
                    const style = document.createElement('style');
                    style.textContent = `
                        * {
                            animation: none !important;
                            transition: none !important;
                        }
                    `;
                    document.head.appendChild(style);
                }
            });
        }
    }
}

// Оптимизация касаний
function optimizeTouch() {
    if (deviceInfo.isTouch) {
        // Улучшенная обработка касаний
        document.addEventListener('touchstart', (e) => {
            // Предотвращаем двойное касание
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                e.target.style.pointerEvents = 'none';
                setTimeout(() => {
                    e.target.style.pointerEvents = '';
                }, 300);
            }
        }, { passive: true });
        
        // Оптимизация прокрутки
        document.addEventListener('touchmove', (e) => {
            const target = e.target;
            if (target.scrollHeight <= target.clientHeight) {
                e.preventDefault();
            }
        }, { passive: false });
    }
}

// Оптимизация для PWA
function optimizePWA() {
    if (deviceInfo.isStandalone) {
        // Скрываем элементы браузера в PWA режиме
        document.body.classList.add('pwa-mode');
        
        // Оптимизация для полноэкранного режима
        if (document.fullscreenEnabled || document.webkitFullscreenEnabled) {
            document.documentElement.requestFullscreen().catch(() => {});
        }
    }
}

// Оптимизация доступности
function optimizeAccessibility() {
    // Улучшенная навигация с клавиатуры
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Закрываем модальные окна по Escape
            const modals = document.querySelectorAll('.modal[style*="display: flex"]');
            modals.forEach(modal => {
                modal.style.display = 'none';
            });
        }
    });
    
    // Улучшенная поддержка экранных дикторов
    const interactiveElements = document.querySelectorAll('button, [role="button"], .action-card, .category-card');
    interactiveElements.forEach(el => {
        if (!el.getAttribute('aria-label')) {
            const text = el.textContent.trim();
            if (text) {
                el.setAttribute('aria-label', text);
            }
        }
    });
}

// Оптимизация производительности
function optimizePerformance() {
    // Используем requestIdleCallback для неважных задач
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            optimizeImages();
            optimizeMemory();
        });
    } else {
        // Fallback для старых браузеров
        setTimeout(() => {
            optimizeImages();
            optimizeMemory();
        }, 1000);
    }
    
    // Оптимизация рендеринга
    if (deviceInfo.isMobile) {
        // Используем transform вместо top/left для анимаций
        const animatedElements = document.querySelectorAll('.action-card, .category-card, .command-item');
        animatedElements.forEach(el => {
            el.style.willChange = 'transform';
        });
    }
}

// Инициализация всех оптимизаций
function initializeOptimizations() {
    console.log('🚀 Инициализация оптимизаций для:', deviceInfo);
    
    optimizeAnimations();
    optimizeScrolling();
    optimizeNetwork();
    optimizeBattery();
    optimizeTouch();
    optimizePWA();
    optimizeAccessibility();
    optimizePerformance();
    
    // Мониторинг производительности
    if ('performance' in window) {
        performance.mark('optimizations-complete');
    }
}

// Экспорт для использования в основном файле
window.deviceOptimizations = {
    deviceInfo,
    initializeOptimizations,
    optimizeImages,
    optimizeAnimations,
    optimizeScrolling,
    optimizeMemory,
    optimizeNetwork,
    optimizeBattery,
    optimizeTouch,
    optimizePWA,
    optimizeAccessibility,
    optimizePerformance
};

// Автоматическая инициализация при загрузке DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeOptimizations);
} else {
    initializeOptimizations();
} 