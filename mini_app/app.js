// Глобальное состояние приложения
const appState = {
    userData: null,
    commands: [],
    categories: {},
    currentSection: 'main',
    searchResults: [],
    tg: null
};

// Элементы DOM
const elements = {
    profileBtn: document.getElementById('profileBtn'),
    profileModal: document.getElementById('profileModal'),
    closeProfileModal: document.getElementById('closeProfileModal'),
    profileName: document.getElementById('profileName'),
    profileUsername: document.getElementById('profileUsername'),
    profileBadge: document.getElementById('profileBadge'),
    profileAvatar: document.getElementById('profileAvatar'),
    avatarInner: document.getElementById('avatarInner'),
    statusIndicator: document.getElementById('statusIndicator'),
    searchCount: document.getElementById('searchCount'),
    favoritesCount: document.getElementById('favoritesCount'),
    commandsUsed: document.getElementById('commandsUsed'),
    lastActive: document.getElementById('lastActive'),
    achievementsGrid: document.getElementById('achievementsGrid'),
    
    burgerMenuBtn: document.getElementById('burgerMenuBtn'),
    burgerMenu: document.getElementById('burgerMenu'),
    closeBurgerMenu: document.getElementById('closeBurgerMenu'),
    
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    searchSuggestions: document.getElementById('searchSuggestions'),
    
    resultsSection: document.getElementById('resultsSection'),
    resultsTitle: document.getElementById('resultsTitle'),
    resultsContainer: document.getElementById('resultsContainer'),
    clearResults: document.getElementById('clearResults'),
    
    categoriesSection: document.getElementById('categoriesSection'),
    categoriesGrid: document.getElementById('categoriesGrid'),
    backToMain: document.getElementById('backToMain'),
    
    gpsSection: document.getElementById('gpsSection'),
    gpsContent: document.getElementById('gpsContent'),
    backFromGPS: document.getElementById('backFromGPS'),
    
    rpTermsSection: document.getElementById('rpTermsSection'),
    rpTermsContent: document.getElementById('rpTermsContent'),
    backFromRPTerms: document.getElementById('backFromRPTerms'),
    
    helperDutiesSection: document.getElementById('helperDutiesSection'),
    helperDutiesContent: document.getElementById('helperDutiesContent'),
    backFromHelperDuties: document.getElementById('backFromHelperDuties'),
    
    chatRulesSection: document.getElementById('chatRulesSection'),
    chatRulesContent: document.getElementById('chatRulesContent'),
    backFromChatRules: document.getElementById('backFromChatRules'),
    
    muteRulesSection: document.getElementById('muteRulesSection'),
    muteRulesContent: document.getElementById('muteRulesContent'),
    backFromMuteRules: document.getElementById('backFromMuteRules'),
    
    premiumSection: document.getElementById('premiumSection'),
    premiumContent: document.getElementById('premiumContent'),
    backFromPremium: document.getElementById('backFromPremium'),
    
    categorySection: document.getElementById('categorySection'),
    categoryTitle: document.getElementById('categoryTitle'),
    categoryContent: document.getElementById('categoryContent'),
    backFromCategory: document.getElementById('backFromCategory'),
    
    loadingOverlay: document.getElementById('loadingOverlay')
};

// Инициализация приложения
async function initializeApp() {
    // Инициализируем Telegram Web App
    if (window.Telegram && window.Telegram.WebApp) {
        appState.tg = window.Telegram.WebApp;
        appState.tg.ready();
        appState.tg.expand();
        
        // Устанавливаем тему
        if (appState.tg.colorScheme === 'dark') {
            document.body.classList.add('dark-theme');
        }
        
        console.log('Telegram Web App инициализирован');
    }
    
    // Загружаем команды сразу
    await loadCommands();
    
    // Настраиваем обработчики событий
    setupEventListeners();
    
    // Показываем главную страницу
    showMainSection();
    
    // Загружаем профиль пользователя из Telegram
    await loadUserProfileFromTelegram();
}

// Загрузка команд из API
async function loadCommands() {
    try {
        const response = await fetch('/api/commands');
        const commands = await response.json();
        appState.commands = commands;
        
        // Группируем команды по категориям
        appState.categories = {};
        commands.forEach(command => {
            if (!appState.categories[command.category]) {
                appState.categories[command.category] = [];
            }
            appState.categories[command.category].push(command);
        });
        
        console.log('Команды загружены:', commands.length);
    } catch (error) {
        console.error('Ошибка загрузки команд:', error);
        appState.commands = [];
    }
}

// Загрузка профиля пользователя из Telegram
async function loadUserProfileFromTelegram() {
    try {
        if (!appState.tg) {
            console.error('Telegram Web App не инициализирован');
            return;
        }
        
        // Получаем данные пользователя из Telegram
        const initData = appState.tg.initData;
        const user = appState.tg.initDataUnsafe?.user;
        
        if (!user) {
            console.error('Данные пользователя не найдены');
            return;
        }
        
        console.log('Данные пользователя из Telegram:', user);
        
        // Формируем объект пользователя
        const userData = {
            telegram_id: user.id,
            username: user.username || `user_${user.id}`,
            first_name: user.first_name || 'Пользователь',
            last_name: user.last_name || '',
            language_code: user.language_code || 'ru',
            is_premium: user.is_premium || false,
            added_to_attachment_menu: user.added_to_attachment_menu || false,
            allows_write_to_pm: user.allows_write_to_pm || false,
            photo_url: user.photo_url || null,
            // Статистика из локального хранилища или API
            search_count: getLocalStorageValue('search_count', 0),
            favorites_count: getLocalStorageValue('favorites_count', 0),
            commands_used: getLocalStorageValue('commands_used', 0),
            last_active: new Date().toISOString(),
            achievements: getLocalStorageValue('achievements', [])
        };
        
        appState.userData = userData;
        updateProfileInfo();
        
        // Сохраняем данные в локальное хранилище
        saveUserDataToStorage(userData);
        
    } catch (error) {
        console.error('Ошибка загрузки профиля из Telegram:', error);
    }
}

// Получить значение из localStorage
function getLocalStorageValue(key, defaultValue) {
    try {
        const value = localStorage.getItem(`tg_user_${key}`);
        return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
        console.error('Ошибка чтения из localStorage:', error);
        return defaultValue;
    }
}

// Сохранить данные пользователя в localStorage
function saveUserDataToStorage(userData) {
    try {
        localStorage.setItem('tg_user_search_count', JSON.stringify(userData.search_count));
        localStorage.setItem('tg_user_favorites_count', JSON.stringify(userData.favorites_count));
        localStorage.setItem('tg_user_commands_used', JSON.stringify(userData.commands_used));
        localStorage.setItem('tg_user_achievements', JSON.stringify(userData.achievements));
        localStorage.setItem('tg_user_last_active', JSON.stringify(userData.last_active));
    } catch (error) {
        console.error('Ошибка сохранения в localStorage:', error);
    }
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Профиль
    elements.profileBtn.addEventListener('click', showProfileModal);
    elements.closeProfileModal.addEventListener('click', hideProfileModal);
    
    // Бургер меню
    elements.burgerMenuBtn.addEventListener('click', showBurgerMenu);
    elements.closeBurgerMenu.addEventListener('click', hideBurgerMenu);
    
    // Закрытие бургер меню при клике вне его
    document.addEventListener('click', function(event) {
        if (event.target === elements.burgerMenu) {
            hideBurgerMenu();
        }
    });
    
    // Закрытие модального окна профиля при клике вне его
    document.addEventListener('click', function(event) {
        if (event.target === elements.profileModal) {
            hideProfileModal();
        }
    });
    
    // Поиск
    elements.searchInput.addEventListener('input', handleSearchInput);
    elements.searchBtn.addEventListener('click', performSearch);
    elements.clearResults.addEventListener('click', clearSearchResults);
    
    // Быстрые действия - исправляем обработчики
    document.addEventListener('click', function(event) {
        const actionCard = event.target.closest('.action-card');
        if (actionCard) {
            const action = actionCard.dataset.action;
            if (action) {
                handleActionClick(action);
            }
        }
    });
    
    // Кнопки "Назад"
    elements.backToMain.addEventListener('click', showMainSection);
    elements.backFromGPS.addEventListener('click', showMainSection);
    elements.backFromRPTerms.addEventListener('click', showMainSection);
    elements.backFromHelperDuties.addEventListener('click', showMainSection);
    elements.backFromChatRules.addEventListener('click', showMainSection);
    elements.backFromMuteRules.addEventListener('click', showMainSection);
    elements.backFromPremium.addEventListener('click', showMainSection);
    elements.backFromCategory.addEventListener('click', showCategoriesSection);
}

// Показать модальное окно профиля
function showProfileModal() {
    elements.profileModal.style.display = 'flex';
}

// Скрыть модальное окно профиля
function hideProfileModal() {
    elements.profileModal.style.display = 'none';
}

// Показать бургер меню
function showBurgerMenu() {
    elements.burgerMenu.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Блокируем скролл
}

// Скрыть бургер меню
function hideBurgerMenu() {
    elements.burgerMenu.style.display = 'none';
    document.body.style.overflow = ''; // Возвращаем скролл
}

// Обновить информацию профиля
function updateProfileInfo() {
    if (appState.userData) {
        const user = appState.userData;
        
        // Обновляем имя и username
        const fullName = user.last_name ? `${user.first_name} ${user.last_name}` : user.first_name;
        elements.profileName.textContent = fullName;
        elements.profileUsername.textContent = `@${user.username}`;
        
        // Обновляем бейдж (Premium или обычный пользователь)
        if (user.is_premium) {
            elements.profileBadge.textContent = 'Premium';
            elements.profileBadge.style.background = 'linear-gradient(45deg, #ffd700, #ffed4e)';
        } else {
            elements.profileBadge.textContent = 'User';
            elements.profileBadge.style.background = 'linear-gradient(45deg, #667eea, #764ba2)';
        }
        
        // Обновляем аватар (используем первую букву имени или фото)
        if (user.photo_url) {
            // Если есть фото, загружаем его
            elements.avatarInner.innerHTML = `<img src="${user.photo_url}" alt="Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
        } else {
            // Иначе используем первую букву имени
            const firstLetter = user.first_name.charAt(0).toUpperCase();
            elements.avatarInner.textContent = firstLetter;
        }
        
        // Обновляем статус (онлайн/оффлайн)
        const lastActive = new Date(user.last_active);
        const now = new Date();
        const diffMinutes = Math.floor((now - lastActive) / (1000 * 60));
        
        if (diffMinutes < 5) {
            elements.statusIndicator.style.background = '#4ade80'; // Зеленый - онлайн
        } else if (diffMinutes < 60) {
            elements.statusIndicator.style.background = '#fbbf24'; // Желтый - недавно
        } else {
            elements.statusIndicator.style.background = '#ef4444'; // Красный - оффлайн
        }
        
        // Обновляем статистику
        elements.searchCount.textContent = user.search_count || 0;
        elements.favoritesCount.textContent = user.favorites_count || 0;
        elements.commandsUsed.textContent = user.commands_used || 0;
        
        // Форматируем дату последней активности
        if (user.last_active) {
            const diffHours = Math.floor((now - lastActive) / (1000 * 60 * 60));
            
            if (diffMinutes < 5) {
                elements.lastActive.textContent = 'Сейчас';
            } else if (diffHours < 1) {
                elements.lastActive.textContent = `${diffMinutes}м назад`;
            } else if (diffHours < 24) {
                elements.lastActive.textContent = `${diffHours}ч назад`;
            } else {
                const diffDays = Math.floor(diffHours / 24);
                elements.lastActive.textContent = `${diffDays}д назад`;
            }
        } else {
            elements.lastActive.textContent = '-';
        }
        
        // Обновляем достижения
        updateAchievements(user.achievements || []);
    }
}

// Обновить достижения
function updateAchievements(achievements) {
    const achievementItems = elements.achievementsGrid.querySelectorAll('.achievement-item');
    
    achievementItems.forEach((item, index) => {
        const achievementId = getAchievementId(index);
        if (achievements.includes(achievementId)) {
            item.classList.add('unlocked');
        } else {
            item.classList.remove('unlocked');
        }
    });
}

// Получить ID достижения по индексу
function getAchievementId(index) {
    const achievements = ['first_search', 'collector', 'expert'];
    return achievements[index] || '';
}

// Обработка ввода в поиск
function handleSearchInput(event) {
    const query = event.target.value.toLowerCase().trim();
    
    if (query.length < 2) {
        elements.searchSuggestions.innerHTML = '';
        return;
    }
    
    // Показываем подсказки
    showSearchSuggestions(query);
}

// Показать подсказки поиска
function showSearchSuggestions(query) {
    const suggestions = [];
    
    // Добавляем команды
    if (appState.commands.length > 0) {
        const matchingCommands = appState.commands.filter(cmd => 
            cmd.command.toLowerCase().includes(query) ||
            cmd.description.toLowerCase().includes(query)
        ).slice(0, 3);
        
        suggestions.push(...matchingCommands.map(cmd => ({
            type: 'command',
            text: cmd.command,
            description: cmd.description
        })));
    }
    
    // Отображаем подсказки
    elements.searchSuggestions.innerHTML = suggestions.map(suggestion => `
        <div class="suggestion-item" data-type="${suggestion.type}" data-text="${suggestion.text}">
            <div class="suggestion-text">${suggestion.text}</div>
            <div class="suggestion-desc">${suggestion.description}</div>
        </div>
    `).join('');
    
    // Добавляем обработчики кликов
    elements.searchSuggestions.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
            elements.searchInput.value = item.dataset.text;
            elements.searchSuggestions.innerHTML = '';
            performSearch();
        });
    });
}

// Выполнить поиск
function performSearch() {
    const query = elements.searchInput.value.toLowerCase().trim();
    
    if (query.length < 2) {
        hideSearchResults();
        return;
    }
    
    showLoading();
    
    // Имитируем задержку поиска
    setTimeout(() => {
        const results = performSearchLogic(query);
        displaySearchResults(results);
        hideLoading();
        
        // Увеличиваем счетчик поисков
        if (appState.userData) {
            updateUserSearchCount();
            updateUserCommandsUsed();
        }
    }, 500);
}

// Логика поиска
function performSearchLogic(query) {
    const results = [];
    
    // Поиск по командам
    if (appState.commands.length > 0) {
        const matchingCommands = appState.commands.filter(cmd => 
            cmd.command.toLowerCase().includes(query) ||
            cmd.description.toLowerCase().includes(query) ||
            cmd.category.toLowerCase().includes(query)
        );
        
        results.push(...matchingCommands.map(cmd => ({
            type: 'command',
            title: cmd.command,
            description: cmd.description,
            category: cmd.category
        })));
    }
    
    return results;
}

// Отобразить результаты поиска
function displaySearchResults(results) {
    if (results.length === 0) {
        elements.resultsTitle.textContent = 'Ничего не найдено';
        elements.resultsContainer.innerHTML = '<div class="no-results">Попробуйте изменить запрос</div>';
    } else {
        elements.resultsTitle.textContent = `Найдено: ${results.length}`;
        elements.resultsContainer.innerHTML = results.map(result => `
            <div class="result-item">
                <div class="result-command">${result.title}</div>
                <div class="result-description">${result.description}</div>
            </div>
        `).join('');
    }
    
    showSearchResults();
}

// Получить иконку для результата
function getResultIcon(type) {
    const icons = {
        command: '🔧',
        gps: '🗺️',
        rp: '📖'
    };
    return icons[type] || '📄';
}

// Показать результаты поиска
function showSearchResults() {
    hideAllSections();
    elements.resultsSection.style.display = 'block';
    appState.currentSection = 'search';
}

// Скрыть результаты поиска
function hideSearchResults() {
    elements.resultsSection.style.display = 'none';
    elements.searchSuggestions.innerHTML = '';
}

// Очистить результаты поиска
function clearSearchResults() {
    elements.searchInput.value = '';
    hideSearchResults();
    showMainSection();
}

// Обновить счетчик поисков
async function updateUserSearchCount() {
    if (!appState.userData) return;
    
    try {
        const newCount = (appState.userData.search_count || 0) + 1;
        appState.userData.search_count = newCount;
        elements.searchCount.textContent = newCount;
        
        // Сохраняем в localStorage
        localStorage.setItem('tg_user_search_count', JSON.stringify(newCount));
        
        // Проверяем достижения
        checkAchievements();
        
        // Обновляем время последней активности
        appState.userData.last_active = new Date().toISOString();
        localStorage.setItem('tg_user_last_active', JSON.stringify(appState.userData.last_active));
        
    } catch (error) {
        console.error('Ошибка обновления счетчика поисков:', error);
    }
}

// Обновить счетчик использованных команд
function updateUserCommandsUsed() {
    if (!appState.userData) return;
    
    try {
        const newCount = (appState.userData.commands_used || 0) + 1;
        appState.userData.commands_used = newCount;
        elements.commandsUsed.textContent = newCount;
        
        // Сохраняем в localStorage
        localStorage.setItem('tg_user_commands_used', JSON.stringify(newCount));
        
        // Проверяем достижения
        checkAchievements();
        
    } catch (error) {
        console.error('Ошибка обновления счетчика команд:', error);
    }
}

// Проверить и обновить достижения
function checkAchievements() {
    if (!appState.userData) return;
    
    const achievements = appState.userData.achievements || [];
    const newAchievements = [];
    
    // Достижение за первые поиски
    if (appState.userData.search_count >= 1 && !achievements.includes('first_search')) {
        newAchievements.push('first_search');
    }
    
    // Достижение за коллекционера (10 избранных)
    if (appState.userData.favorites_count >= 10 && !achievements.includes('collector')) {
        newAchievements.push('collector');
    }
    
    // Достижение за эксперта (50 команд)
    if (appState.userData.commands_used >= 50 && !achievements.includes('expert')) {
        newAchievements.push('expert');
    }
    
    // Добавляем новые достижения
    if (newAchievements.length > 0) {
        appState.userData.achievements = [...achievements, ...newAchievements];
        localStorage.setItem('tg_user_achievements', JSON.stringify(appState.userData.achievements));
        updateAchievements(appState.userData.achievements);
        
        // Показываем уведомление о новом достижении
        showAchievementNotification(newAchievements[0]);
    }
}

// Показать уведомление о достижении
function showAchievementNotification(achievementId) {
    const achievementNames = {
        'first_search': 'Первые поиски',
        'collector': 'Коллекционер',
        'expert': 'Эксперт'
    };
    
    const achievementName = achievementNames[achievementId] || 'Новое достижение';
    
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">🏆</div>
            <div class="notification-text">
                <div class="notification-title">Достижение разблокировано!</div>
                <div class="notification-desc">${achievementName}</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Удаляем уведомление через 3 секунды
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Обработка клика по действию
function handleActionClick(action) {
    console.log('Клик по действию:', action);
    
    switch (action) {
        case 'categories':
            showCategoriesSection();
            break;
        case 'all-commands':
            showAllCommandsSection();
            break;
        case 'premium':
            showPremiumSection();
            break;
        default:
            console.log('Неизвестное действие:', action);
    }
}

// Показать секцию категорий
function showCategoriesSection() {
    hideAllSections();
    elements.categoriesSection.style.display = 'block';
    appState.currentSection = 'categories';
    
    displayCategories();
}

// Отобразить категории
function displayCategories() {
    if (!appState.commands.length) {
        loadCommands().then(() => displayCategories());
        return;
    }
    
    const categories = {};
    appState.commands.forEach(cmd => {
        if (!categories[cmd.category]) {
            categories[cmd.category] = [];
        }
        categories[cmd.category].push(cmd);
    });
    
    elements.categoriesGrid.innerHTML = Object.entries(categories).map(([category, commands]) => `
        <div class="category-card" data-category="${category}">
            <div class="category-icon">${getCategorySVG(category)}</div>
            <div class="category-name">${category}</div>
            <div class="category-count">${commands.length} команд</div>
        </div>
    `).join('');
    
    // Добавляем обработчики кликов
    elements.categoriesGrid.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            showCategoryCommands(category);
        });
    });
}

// Получить SVG для категории
function getCategorySVG(category) {
    const icons = {
        'Общие': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="5" width="18" height="14" rx="2" stroke="#7B61FF" stroke-width="2"/><path d="M3 8H21" stroke="#7B61FF" stroke-width="2"/></svg>`,
        'Автомобиль': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="11" width="18" height="6" rx="2" stroke="#7B61FF" stroke-width="2"/><circle cx="7" cy="18" r="2" fill="#7B61FF"/><circle cx="17" cy="18" r="2" fill="#7B61FF"/></svg>`,
        'Дом': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 10L12 3L21 10V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V10Z" stroke="#7B61FF" stroke-width="2"/><rect x="9" y="14" width="6" height="7" fill="#7B61FF"/></svg>`,
        'Бизнес': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="7" width="18" height="14" rx="2" stroke="#7B61FF" stroke-width="2"/><rect x="7" y="3" width="10" height="4" rx="2" stroke="#7B61FF" stroke-width="2"/></svg>`,
        'Армия': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="12,2 15,8 22,9 17,14 18,21 12,18 6,21 7,14 2,9 9,8" stroke="#7B61FF" stroke-width="2" fill="none"/></svg>`,
        'Семья': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 4C16 6.20914 14.2091 8 12 8C9.79086 8 8 6.20914 8 4C8 1.79086 9.79086 0 12 0C14.2091 0 16 1.79086 16 4Z" stroke="#7B61FF" stroke-width="2"/><path d="M24 20C24 22.2091 22.2091 24 20 24H4C1.79086 24 0 22.2091 0 20C0 17.7909 1.79086 16 4 16H20C22.2091 16 24 17.7909 24 20Z" stroke="#7B61FF" stroke-width="2"/></svg>`,
        'Общение': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#7B61FF" stroke-width="2"/></svg>`,
        'Лидеры/заместители': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L15.09 8.26L22 9L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9L8.91 8.26L12 2Z" stroke="#7B61FF" stroke-width="2"/></svg>`,
        'Транспортные/Авиакомпании': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.8 19.2L16 11L21.6 13L17.8 19.2ZM7.2 19.2L2.4 13L8 11L6.2 19.2H7.2ZM4 10L20 10L18 4H6L4 10Z" stroke="#7B61FF" stroke-width="2"/></svg>`,
        'Больница': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 14C19 16.7614 16.7614 19 14 19H10C7.23858 19 5 16.7614 5 14V10C5 7.23858 7.23858 5 10 5H14C16.7614 5 19 7.23858 19 10V14Z" stroke="#7B61FF" stroke-width="2"/><path d="M12 8V16M8 12H16" stroke="#7B61FF" stroke-width="2"/></svg>`,
        'ГИБДД/МВД': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L13.09 8.26L20 9L14 14.14L15.18 21.02L12 17.77L8.82 21.02L10 14.14L4 9L10.91 8.26L12 2Z" stroke="#7B61FF" stroke-width="2"/></svg>`,
        'Правительство': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 21H21V3H3V21ZM5 5H19V19H5V5Z" stroke="#7B61FF" stroke-width="2"/><path d="M7 7H17V9H7V7ZM7 11H17V13H7V11ZM7 15H17V17H7V15Z" stroke="#7B61FF" stroke-width="2"/></svg>`,
        'ТРК': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="6" width="20" height="12" rx="2" stroke="#7B61FF" stroke-width="2"/><path d="M8 2L16 2" stroke="#7B61FF" stroke-width="2"/></svg>`,
        'ФСБ': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L13.09 8.26L20 9L14 14.14L15.18 21.02L12 17.77L8.82 21.02L10 14.14L4 9L10.91 8.26L12 2Z" stroke="#7B61FF" stroke-width="2"/></svg>`,
        'Криминальные структуры': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L13.09 8.26L20 9L14 14.14L15.18 21.02L12 17.77L8.82 21.02L10 14.14L4 9L10.91 8.26L12 2Z" stroke="#7B61FF" stroke-width="2"/></svg>`,
        'МЧС': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L13.09 8.26L20 9L14 14.14L15.18 21.02L12 17.77L8.82 21.02L10 14.14L4 9L10.91 8.26L12 2Z" stroke="#7B61FF" stroke-width="2"/></svg>`
    };
    return icons[category] || `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="16" height="16" rx="2" stroke="#7B61FF" stroke-width="2"/></svg>`;
}

// Показать команды категории
function showCategoryCommands(category) {
    hideAllSections();
    elements.categorySection.style.display = 'block';
    elements.categoryTitle.textContent = category;
    appState.currentSection = 'category';
    
    const categoryCommands = appState.commands.filter(cmd => cmd.category === category);
    
    elements.categoryContent.innerHTML = categoryCommands.map(cmd => `
        <div class="command-item">
            <div class="command-name">${cmd.command}</div>
            <div class="command-desc">${cmd.description}</div>
        </div>
    `).join('');
}

// Показать все команды
function showAllCommandsSection() {
    hideAllSections();
    elements.categorySection.style.display = 'block';
    elements.categoryTitle.textContent = 'Все команды';
    appState.currentSection = 'all-commands';
    
    elements.categoryContent.innerHTML = appState.commands.map(cmd => `
        <div class="command-item">
            <div class="command-name">${cmd.command}</div>
            <div class="command-desc">${cmd.description}</div>
            <div class="command-category">${cmd.category}</div>
        </div>
    `).join('');
}

// Показать премиум секцию
function showPremiumSection() {
    hideAllSections();
    elements.premiumSection.style.display = 'block';
    appState.currentSection = 'premium';
    
    elements.premiumContent.innerHTML = `
        <div class="premium-header">
            <h2>💎 Премиум функции</h2>
            <p>Доступны только для VIP пользователей</p>
        </div>
        <div class="premium-features">
            <div class="premium-feature">
                <div class="feature-icon">🔍</div>
                <div class="feature-text">
                    <h3>Расширенный поиск</h3>
                    <p>Поиск по всем разделам с фильтрами и сортировкой</p>
                </div>
            </div>
            <div class="premium-feature">
                <div class="feature-icon">⭐</div>
                <div class="feature-text">
                    <h3>Избранные команды</h3>
                    <p>Сохраняйте часто используемые команды</p>
                </div>
            </div>
            <div class="premium-feature">
                <div class="feature-icon">⚙️</div>
                <div class="feature-text">
                    <h3>Персональные настройки</h3>
                    <p>Настройте интерфейс под себя</p>
                </div>
            </div>
            <div class="premium-feature">
                <div class="feature-icon">🎯</div>
                <div class="feature-text">
                    <h3>Приоритетная поддержка</h3>
                    <p>Быстрая помощь от команды разработчиков</p>
                </div>
            </div>
        </div>
    `;
}

// Скрыть все секции
function hideAllSections() {
    const sections = [
        elements.resultsSection,
        elements.categoriesSection,
        elements.gpsSection,
        elements.rpTermsSection,
        elements.helperDutiesSection,
        elements.chatRulesSection,
        elements.muteRulesSection,
        elements.premiumSection,
        elements.categorySection
    ];
    
    sections.forEach(section => {
        if (section) section.style.display = 'none';
    });
}

// Показать главную секцию
function showMainSection() {
    hideAllSections();
    appState.currentSection = 'main';
}

// Показать загрузку
function showLoading() {
    elements.loadingOverlay.style.display = 'flex';
}

// Скрыть загрузку
function hideLoading() {
    elements.loadingOverlay.style.display = 'none';
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', initializeApp); 