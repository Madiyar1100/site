// Chatbot JavaScript

class Chatbot {
  constructor() {
    this.isOpen = false;
    this.isRecording = false;
    this.recognition = null;
    this.messages = [];
    this.initSpeechRecognition();
    this.init();
  }

  init() {
    this.createHTML();
    this.attachEventListeners();
    this.showWelcomeMessage();
  }

  createHTML() {
    const chatbotHTML = `
      <div class="chatbot-widget">
        <div class="chatbot-icon" id="chatbot-icon">💬</div>
        <div class="chatbot-window" id="chatbot-window">
          <div class="chatbot-header">
            <h3>🍣 Domi Sushi - Помощник</h3>
            <button class="chatbot-close" id="chatbot-close">✕</button>
          </div>
          <div class="chatbot-messages" id="chatbot-messages"></div>
          <div class="chatbot-input-area">
            <div class="chatbot-suggestions" id="chatbot-suggestions"></div>
            <div class="chatbot-input-group">
              <input type="text" id="chatbot-input" class="chatbot-input" placeholder="Напишите вопрос...">
              <button class="chatbot-btn" id="chatbot-send" title="Отправить">📤</button>
              <button class="chatbot-btn" id="chatbot-voice" title="Голос">🎤</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    
    // Добавляем CSS если еще не добавлены
    if (!document.querySelector('link[href*="chatbot.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/static/chatbot.css';
      document.head.appendChild(link);
    }
  }

  attachEventListeners() {
    const icon = document.getElementById('chatbot-icon');
    const closeBtn = document.getElementById('chatbot-close');
    const sendBtn = document.getElementById('chatbot-send');
    const voiceBtn = document.getElementById('chatbot-voice');
    const input = document.getElementById('chatbot-input');

    icon.addEventListener('click', () => this.toggle());
    closeBtn.addEventListener('click', () => this.close());
    sendBtn.addEventListener('click', () => this.sendMessage());
    voiceBtn.addEventListener('click', () => this.toggleVoice());
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    const window = document.getElementById('chatbot-window');
    const icon = document.getElementById('chatbot-icon');
    this.isOpen = true;
    window.classList.add('active');
    icon.classList.add('active');
    document.getElementById('chatbot-input').focus();
  }

  close() {
    const window = document.getElementById('chatbot-window');
    const icon = document.getElementById('chatbot-icon');
    this.isOpen = false;
    window.classList.remove('active');
    icon.classList.remove('active');
  }

  showWelcomeMessage() {
    setTimeout(() => {
      this.addMessage('bot', 'Привет! 👋 Я помощник ресторана Domi Sushi. Чем я могу вам помочь?');
      this.showSuggestions([
        'Меню ресторана',
        'Как забронировать?',
        'Часы работы',
        'Адрес и контакты',
        'Специальные предложения'
      ]);
    }, 500);
  }

  addMessage(sender, text) {
    const messagesDiv = document.getElementById('chatbot-messages');
    const messageEl = document.createElement('div');
    messageEl.className = `chatbot-message ${sender}`;
    messageEl.textContent = text;
    messagesDiv.appendChild(messageEl);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    this.messages.push({ sender, text });
  }

  showTyping() {
    const messagesDiv = document.getElementById('chatbot-messages');
    const typingEl = document.createElement('div');
    typingEl.className = 'chatbot-typing';
    typingEl.id = 'typing-indicator';
    typingEl.innerHTML = '<span></span><span></span><span></span>';
    messagesDiv.appendChild(typingEl);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  removeTyping() {
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();
  }

  showSuggestions(suggestions) {
    const suggestionsDiv = document.getElementById('chatbot-suggestions');
    suggestionsDiv.innerHTML = '';
    
    suggestions.forEach(suggestion => {
      const btn = document.createElement('button');
      btn.className = 'chatbot-suggestion';
      btn.textContent = suggestion;
      btn.addEventListener('click', () => {
        document.getElementById('chatbot-input').value = suggestion;
        this.sendMessage();
      });
      suggestionsDiv.appendChild(btn);
    });
  }

  sendMessage() {
    const input = document.getElementById('chatbot-input');
    const text = input.value.trim();
    
    if (!text) return;
    
    this.addMessage('user', text);
    input.value = '';
    input.style.height = 'auto';
    
    this.showTyping();
    
    // Отправляем запрос на сервер
    this.getBotResponse(text);
  }

  getBotResponse(userMessage) {
    // Отправляем запрос на сервер для получения ответа от Groq AI
    fetch('/chat/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userMessage
      })
    })
    .then(response => response.json())
    .then(data => {
      this.removeTyping();
      
      if (data.success) {
        // Ответ от AI
        this.addMessage('bot', data.message);
        
        // Показываем релевантные подсказки в зависимости от контента
        let suggestions = ['Меню', 'Как забронировать?', 'Контакты'];
        
        if (userMessage.toLowerCase().includes('меню')) {
          suggestions = ['Популярные блюда', 'Цены', 'Доставка'];
        } else if (userMessage.toLowerCase().includes('броніров') || userMessage.toLowerCase().includes('заказ')) {
          suggestions = ['Часы работы', 'Адрес', 'Телефон'];
        } else if (userMessage.toLowerCase().includes('доставка')) {
          suggestions = ['Минимальный заказ', 'Время доставки', 'Стоимость'];
        }
        
        this.showSuggestions(suggestions);
      } else {
        // Ошибка при обработке
        this.addMessage('bot', `❌ ${data.message || 'Ошибка при обработке запроса'}`);
        this.showSuggestions(['Меню', 'Контакты', 'Часы работы', 'Как забронировать?']);
      }
    })
    .catch(error => {
      console.error('Ошибка в чате:', error);
      this.removeTyping();
      this.addMessage('bot', '❌ Ошибка подключения к серверу. Пожалуйста, попробуйте позже.');
      this.showSuggestions(['Меню', 'Контакты', 'Часы работы']);
    });
  }

  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'ru-RU';
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onstart = () => {
        this.isRecording = true;
        const voiceBtn = document.getElementById('chatbot-voice');
        voiceBtn.classList.add('recording');
        voiceBtn.title = 'Слушаю...';
      };

      this.recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        
        if (transcript) {
          document.getElementById('chatbot-input').value = transcript;
          this.sendMessage();
        }
      };

      this.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          this.removeTyping();
          this.addMessage('bot', '❌ Ошибка при подтверждении голоса. Попробуйте ещё раз.');
        }
      };

      this.recognition.onend = () => {
        this.isRecording = false;
        const voiceBtn = document.getElementById('chatbot-voice');
        voiceBtn.classList.remove('recording');
        voiceBtn.title = 'Голос';
      };
    }
  }

  toggleVoice() {
    if (!this.recognition) {
      alert('Голосовой ввод не поддерживается вашим браузером. Используйте Chrome, Edge или Firefox.');
      return;
    }

    if (this.isRecording) {
      this.recognition.stop();
    } else {
      this.recognition.start();
    }
  }
}

// Инициалізуємо чатбот при загрузці страницы
document.addEventListener('DOMContentLoaded', () => {
  new Chatbot();
});
