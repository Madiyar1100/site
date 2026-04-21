from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from .models import UserProfile, Booking
from datetime import datetime
import logging
import os
import json
import requests

logger = logging.getLogger(__name__)

# Groq API интеграция
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"  # Актуальная поддерживаемая модель

# Домашняя страница
def home(request):
    return render(request, 'users/home.html')

# Меню
def menu(request):
    return render(request, 'users/menu.html')

# Вход и Регистрация
def auth_page(request):
    if request.method == 'POST':
        action = request.POST.get('action')
        
        if action == 'login':
            username = request.POST.get('username')
            password = request.POST.get('password')
            
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                messages.success(request, f'Рады видеть вас, {username}!')
                return redirect('home')
            else:
                messages.error(request, 'Неверное имя пользователя или пароль')
        
        elif action == 'register':
            username = request.POST.get('username')
            password = request.POST.get('password')
            email = request.POST.get('email', '')
            
            if User.objects.filter(username=username).exists():
                messages.error(request, 'Это имя пользователя уже занято')
            else:
                try:
                    user = User.objects.create_user(
                        username=username,
                        email=email,
                        password=password
                    )
                    # Создать профиль пользователя
                    UserProfile.objects.create(user=user)
                    
                    # Автоматически входим пользователя после регистрации
                    login(request, user)
                    messages.success(request, 'Регистрация успешна! Добро пожаловать!')
                    return redirect('home')
                except Exception as e:
                    messages.error(request, f'Ошибка при регистрации: {str(e)}')
    
    return render(request, 'users/auth.html')

# Выход
def logout_view(request):
    logout(request)
    messages.success(request, 'Вы успешно вышли')
    return redirect('home')

# Профиль пользователя
@login_required(login_url='auth')
def profile(request):
    try:
        profile = request.user.userprofile
    except UserProfile.DoesNotExist:
        profile = UserProfile.objects.create(user=request.user)
    
    return render(request, 'users/profile.html', {'profile': profile})


# Обработка бронирования
@require_http_methods(["POST"])
def create_booking(request):
    """Создание бронирования"""
    try:
        logger.info(f"POST запрос на booking/create/: {request.POST}")
        
        # Получение данных из POST запроса
        date_str = request.POST.get('date')
        time_str = request.POST.get('time')
        persons = request.POST.get('persons')
        table = request.POST.get('table', '')
        name = request.POST.get('name')
        phone = request.POST.get('phone')
        email = request.POST.get('email', '')
        special_requests = request.POST.get('special_requests', '')
        
        # Валидация обязательных полей
        if not all([date_str, time_str, persons, name, phone]):
            return JsonResponse({
                'success': False,
                'message': 'Пожалуйста, заполните все обязательные поля'
            }, status=400)
        
        # Парсинг даты и времени
        try:
            booking_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            booking_time = datetime.strptime(time_str, '%H:%M').time()
        except ValueError:
            return JsonResponse({
                'success': False,
                'message': 'Неверный формат даты или времени'
            }, status=400)
        
        # Преобразование количества посетителей в целое число
        try:
            number_of_persons = int(persons)
            if number_of_persons < 1 or number_of_persons > 100:
                return JsonResponse({
                    'success': False,
                    'message': 'Количество человек должно быть от 1 до 100'
                }, status=400)
        except ValueError:
            return JsonResponse({
                'success': False,
                'message': 'Количество человек должно быть числом'
            }, status=400)
        
        # Создание бронирования
        booking = Booking.objects.create(
            user=request.user if request.user.is_authenticated else None,
            booking_date=booking_date,
            booking_time=booking_time,
            number_of_persons=number_of_persons,
            table_number=table,
            name=name,
            phone=phone,
            email=email,
            special_requests=special_requests,
            status='pending'
        )
        
        logger.info(f"✅ Бронирование создано: ID={booking.id}, Название={name}, Дата={booking_date}, Время={booking_time}")
        
        return JsonResponse({
            'success': True,
            'message': f'Брондау сәтті жіберілді! Номер: {booking.id}',
            'booking_id': booking.id
        })
    
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Ошибка при создании бронирования: {str(e)}'
        }, status=500)


# Обработка чата с Groq AI
@csrf_exempt
@require_http_methods(["POST"])
def chat_handler(request):
    """Обработка чат запросов через Groq API (REST API)"""
    try:
        # Получение JSON данных
        data = json.loads(request.body)
        user_message = data.get('message', '').strip()
        
        if not user_message:
            return JsonResponse({
                'success': False,
                'message': 'Сообщение не может быть пустым'
            }, status=400)
        
        if not GROQ_API_KEY:
            return JsonResponse({
                'success': False,
                'message': 'Groq API ключ не найден'
            }, status=503)
        
        logger.info(f"📨 Чат запрос: {user_message}")
        
        # Системное сообщение для контекста о ресторане
        system_message = """Ты помощник ресторана Domi Sushi (Доми Суши) в Казахстане. 
Ты дружелюбный и полезный помощник. Отвечай на вопросы о ресторане на русском языке.

Информация о ресторане:
- Название: Domi Sushi
- Кухня: Японская (суши, роллы, дим-сам)
- Местоположение: Основная улица, 123, центр города
- Телефон: +7 (777) 123-45-67
- Email: info@domisushi.kz
- Часы работы: Пн-Чт 11:00-22:00, Пт-Сб 11:00-23:00, Вс 11:00-21:00
- Перерыв на обед: 15:00-16:30
- Доставка: Да, в пределах города
- Минимальный заказ: 5000 тенге
- Стоимость доставки: 500 тенге (бесплатно при заказе > 15000)
- Время доставки: 30-45 минут
- Популярные блюда: копчёный лосось, тунец, креветки, овощные роллы
- Специальные предложения: На выходных скидка 15% при заказе свыше 10000 тенге

Если пользователь спрашивает о бронировании, скажи, что он может забронировать столик через кнопку "Брондау" на сайте.
Если пользователь спрашивает о чём-то, не связанном с рестораном, вежливо верни фокус на тему ресторана."""
        
        # Вызов Groq API через REST (как у друга)
        try:
            logger.info(f"📤 Отправка запроса в Groq API...")
            
            groq_response = requests.post(
                GROQ_API_URL,
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": GROQ_MODEL,  # llama-3.3-70b-versatile - актуальная модель
                    "messages": [
                        {
                            "role": "system",
                            "content": system_message
                        },
                        {
                            "role": "user",
                            "content": user_message
                        }
                    ],
                    "temperature": 0.7,
                    "max_tokens": 500
                },
                timeout=15
            )
            
            logger.info(f"📍 Статус Groq: {groq_response.status_code}")
            
            if groq_response.status_code == 200:
                result = groq_response.json()
                bot_response = result['choices'][0]['message']['content']
                logger.info(f"✅ Ответ от Groq: {bot_response[:100]}...")
                
                return JsonResponse({
                    'success': True,
                    'message': bot_response
                })
            else:
                error_msg = f"Groq API ошибка: {groq_response.status_code}"
                logger.error(f"❌ {error_msg}")
                logger.error(f"📋 Ответ: {groq_response.text[:500]}")
                
                return JsonResponse({
                    'success': False,
                    'message': error_msg
                }, status=groq_response.status_code)
        
        except requests.Timeout:
            logger.error("❌ Таймаут при запросе к Groq")
            return JsonResponse({
                'success': False,
                'message': 'Таймаут при обращении к AI. Попробуйте позже.'
            }, status=504)
        
        except requests.RequestException as req_err:
            logger.error(f"❌ Ошибка запроса: {str(req_err)}")
            return JsonResponse({
                'success': False,
                'message': f'Ошибка подключения: {str(req_err)}'
            }, status=503)
    
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': 'Неверный формат запроса'
        }, status=400)
    
    except Exception as e:
        logger.error(f"❌ Ошибка в chat_handler: {str(e)}")
        return JsonResponse({
            'success': False,
            'message': f'Ошибка при обработке запроса: {str(e)}'
        }, status=500)
