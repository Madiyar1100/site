// ════════════════════════════════════════════════════════════════
// СИСТЕМА УПРАВЛЕНИЯ ТЕМАМИ (СВЕТЛАЯ И ТЕМНАЯ)
// ════════════════════════════════════════════════════════════════

class ThemeManager {
  constructor() {
    this.STORAGE_KEY = 'theme-preference';
    this.DARK_THEME = 'dark';
    this.LIGHT_THEME = 'light';
    
    this.init();
  }

  init() {
    console.log('🎨 ThemeManager инициализирована');
    
    // Загружаем сохраненную тему пользователя ИЛИ системную тему
    const savedTheme = this.getSavedTheme();
    console.log('📋 Сохраненная тема:', savedTheme);
    
    this.setTheme(savedTheme);
    
    // Находим и добавляем событие к кнопке переключения
    setTimeout(() => this.attachToggleButton(), 100);
    
    // Следим за изменениями системной темы
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addListener((e) => {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (!saved) {
          this.setTheme(e.matches ? this.DARK_THEME : this.LIGHT_THEME);
        }
      });
    }
  }

  getSavedTheme() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    
    if (saved && (saved === this.DARK_THEME || saved === this.LIGHT_THEME)) {
      return saved;
    }
    
    // Определяем системную тему
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      console.log('📱 Системная тема: темная');
      return this.DARK_THEME;
    }
    
    console.log('📱 Системная тема: светлая');
    return this.LIGHT_THEME;
  }

  setTheme(theme) {
    console.log('🎨 Устанавливаем тему:', theme);
    
    // Добавляем класс для плавного перехода
    document.documentElement.classList.add('theme-transition');
    
    if (theme === this.DARK_THEME) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem(this.STORAGE_KEY, this.DARK_THEME);
      console.log('✅ Темная тема установлена');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem(this.STORAGE_KEY, this.LIGHT_THEME);
      console.log('✅ Светлая тема установлена');
    }
    
    // Убираем класс переходов после завершения
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 300);
    
    // Обновляем иконку кнопки
    this.updateToggleButton();
  }

  toggleTheme() {
    const current = this.getCurrentTheme();
    const newTheme = current === this.DARK_THEME ? this.LIGHT_THEME : this.DARK_THEME;
    console.log('🔄 Переключение с', current, 'на', newTheme);
    this.setTheme(newTheme);
  }

  getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' 
      ? this.DARK_THEME 
      : this.LIGHT_THEME;
  }

  attachToggleButton() {
    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
      console.log('🔘 Кнопка темы найдена и обработана');
      toggleBtn.addEventListener('click', () => this.toggleTheme());
      this.updateToggleButton();
    } else {
      console.log('⚠️ Кнопка темы не найдена');
    }
  }

  updateToggleButton() {
    const toggleBtn = document.getElementById('theme-toggle-btn');
    const icon = toggleBtn?.querySelector('.theme-toggle-icon');
    
    if (toggleBtn && icon) {
      const currentTheme = this.getCurrentTheme();
      
      if (currentTheme === this.DARK_THEME) {
        icon.textContent = '☀️';
        toggleBtn.title = 'Переключить на светлую тему';
        console.log('📝 Обновлена иконка для темной темы: ☀️');
      } else {
        icon.textContent = '🌙';
        toggleBtn.title = 'Переключить на темную тему';
        console.log('📝 Обновлена иконка для светлой темы: 🌙');
      }
    }
  }
}

// ════════════════════════════════════════════════════════════════
// ИНИЦИАЛИЗАЦИЯ КАК МОЖНО РАНЬШЕ
// ════════════════════════════════════════════════════════════════

console.log('📦 theme.js загружен');

// Инициализируем ДО загрузки всех ресурсов
window.themeManager = new ThemeManager();

// Также инициализируем при DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ DOMContentLoaded - переинициализация');
  window.themeManager.attachToggleButton();
});

// Инициализируем при load события
window.addEventListener('load', () => {
  console.log('✅ Window load - финальная инициализация');
  window.themeManager.attachToggleButton();
});

