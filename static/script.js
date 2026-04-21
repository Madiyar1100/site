// script.js

// 1. Бургер-меню
document.querySelector('.burger')?.addEventListener('click', () => {
  document.querySelector('.nav-links').classList.toggle('active');
});

// 2. Hover на кнопках
document.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('mouseover', () => {
    btn.style.backgroundColor = '#b58e2a';
  });
  btn.addEventListener('mouseout', () => {
    btn.style.backgroundColor = '';
  });
});

// 3. Плавный скролл к якорям
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// 4. Анимация появления .item блоков
const items = document.querySelectorAll('.item');
const options = { threshold: 0.1 };
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = 1;
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, options);

items.forEach(item => {
  item.style.opacity = 0;
  item.style.transform = 'translateY(50px)';
  item.style.transition = 'opacity 0.5s, transform 0.5s';
  observer.observe(item);
});

// ────────────────────────────────────────────────
// МОДАЛЬНОЕ ОКНО БРОНИРОВАНИЯ
// ────────────────────────────────────────────────

function openModal() {
  const modal = document.getElementById('booking-modal');
  if (modal) {
    modal.style.display = 'block';
  }
}

function closeModal() {
  const modal = document.getElementById('booking-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Открытие по кнопкам "Брондау" и "Үстел брондау"
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.reservation, .cta').forEach(btn => {
    if (btn.textContent.includes('Брондау') || btn.textContent.includes('Үстел брондау')) {
      btn.addEventListener('click', openModal);
    }
  });
});

// Закрытие по клику вне модалки
window.addEventListener('click', (e) => {
  const modal = document.getElementById('booking-modal');
  if (modal && e.target === modal) {
    closeModal();
  }
});

// Закрытие по кнопке X
document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.querySelector('.close-modal');
  closeBtn?.addEventListener('click', closeModal);
});

// Обработка формы бронирования
document.addEventListener('DOMContentLoaded', () => {
  const bookingForm = document.getElementById('booking-form');
  
  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Собираем данные из формы
      const formData = new FormData(e.target);
      
      // Получаем CSRF токен
      const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
      
      try {
        // Отправляем POST запрос на сервер
        const response = await fetch('/booking/create/', {
          method: 'POST',
          body: formData,
          headers: {
            'X-CSRFToken': csrfToken || '',
            'X-Requested-With': 'XMLHttpRequest'
          }
        });

        const data = await response.json();

        if (data.success) {
          // Успешное бронирование
          alert(
            `✅ ${data.message}\n\n` +
            `Номер бронирования: ${data.booking_id}\n\n` +
            `Администратор вскоре свяжется с вами.`
          );
          closeModal();
          e.target.reset(); // Очистка формы
        } else {
          // Ошибка при бронировании
          alert(`❌ ${data.message}`);
        }
      } catch (error) {
        console.error('Ошибка:', error);
        alert('❌ Ошибка при отправке данных. Пожалуйста, попробуйте позже.');
      }
    });
  }
});

// Установка минимальной даты - сегодня
document.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('booking-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }
});