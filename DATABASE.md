# 🗄️ Документация Базы Данных - Domi Sushi

## 📊 Архитектура БД

Проект использует **SQLite** (встроенная база данных Django) для разработки.

### Местоположение файла БД:
```
lab2_2_new/db.sqlite3
```

---

## 👥 Модели Данных

### 1. **User** (встроенная модель Django)
Стандартная модель аутентификации Django.

| Поле | Тип | Описание |
|------|-----|---------|
| id | AutoField | Уникальный идентификатор |
| username | CharField | Имя пользователя (уникально) |
| email | EmailField | Электронная почта |
| password | CharField | Хешированный пароль |
| first_name | CharField | Имя |
| last_name | CharField | Фамилия |
| is_active | BooleanField | Активен ли пользователь |
| is_staff | BooleanField | Сотрудник ли (для админа) |
| is_superuser | BooleanField | Суперпользователь ли |
| last_login | DateTimeField | Время последнего входа |
| date_joined | DateTimeField | Дата регистрации |

---

### 2. **UserProfile** (пользовательская модель)
Дополнительный профиль пользователя.

```python
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    date_joined = models.DateTimeField(auto_now_add=True)
```

| Поле | Тип | Описание |
|------|-----|---------|
| id | AutoField | Уникальный идентификатор |
| user | OneToOneField | Связь с User (1:1) |
| phone | CharField | Номер телефона (опционально) |
| address | TextField | Адрес проживания (опционально) |
| date_joined | DateTimeField | Дата создания профиля |

---

## 🔗 Связи между Таблицами

```
┌─────────────────────────────┐
│         User                │
├─────────────────────────────┤
│ id (PK)                     │
│ username (UNIQUE)           │
│ email                       │
│ password                    │
│ first_name                  │
│ last_name                   │
│ is_active                   │
│ is_staff                    │
│ is_superuser                │
│ last_login                  │
│ date_joined                 │
└─────────────────────────────┘
            ▲
            │ OneToOne
            │ (1:1)
            │
┌─────────────────────────────┐
│      UserProfile            │
├─────────────────────────────┤
│ id (PK)                     │
│ user_id (FK, UNIQUE)        │◄── Связь с User
│ phone                       │
│ address                     │
│ date_joined                 │
└─────────────────────────────┘
```

---

## 📋 SQL Примеры Запросов

### Получить всех пользователей:
```sql
SELECT * FROM auth_user;
```

### Получить профиль пользователя:
```sql
SELECT * FROM users_userprofile WHERE user_id = 1;
```

### Получить активных пользователей:
```sql
SELECT * FROM auth_user WHERE is_active = 1;
```

### Получить информацию о пользователе с его профилем:
```sql
SELECT u.username, u.email, p.phone, p.address 
FROM auth_user u
LEFT JOIN users_userprofile p ON u.id = p.user_id
WHERE u.username = 'john_doe';
```

---

## 🔑 Суперпользователь (Администратор)

### Данные для входа в админ-панель:
- **Логин**: admin
- **Пароль**: admin123
- **Email**: admin@example.com
- **is_superuser**: True
- **is_staff**: True

### Как получить доступ:
1. http://127.0.0.1:8000/admin/
2. Введите логин и пароль

---

## 🛠️ Команды Django для Работы с БД

### Создание миграций:
```bash
python manage.py makemigrations
```
✓ Создаёт файлы миграций на основе моделей

### Применение миграций:
```bash
python manage.py migrate
```
✓ Применяет миграции к БД

### Создание суперпользователя:
```bash
python manage.py createsuperuser
```
✓ Интерактивное создание администратора

### Работа с БД через shell:
```bash
python manage.py shell
```

#### Примеры в shell:
```python
# Импорт моделей
from django.contrib.auth.models import User
from users.models import UserProfile

# Получить пользователя
user = User.objects.get(username='admin')

# Создать нового пользователя
new_user = User.objects.create_user(
    username='john',
    email='john@example.com',
    password='secret123'
)

# Создать профиль
UserProfile.objects.create(user=new_user, phone='+7(700)123-45-67')

# Получить профиль
profile = UserProfile.objects.get(user__username='john')
profile.phone = '+7(707)654-32-10'
profile.save()

# Удалить пользователя
user.delete()  # Профиль удалится автоматически (on_delete=CASCADE)

# Все пользователи
all_users = User.objects.all()
for user in all_users:
    print(f"{user.username} - {user.email}")
```

---

## 📈 Миграции

### Файлы миграций:
```
users/migrations/
├── __init__.py
└── 0001_initial.py  ← Первая миграция (создание UserProfile)
```

### История миграций:
```bash
python manage.py showmigrations
```

### Откат миграции:
```bash
python manage.py migrate users 0000  # Откатит все миграции
python manage.py migrate users 0001  # Вернёт миграцию 0001
```

---

## 🔐 Безопасность

### Хеширование паролей
Django использует **PBKDF2** для хеширования паролей по умолчанию.

```python
user = User.objects.get(username='admin')
user.set_password('new_password')
user.save()
```

### Проверка пароля
```python
from django.contrib.auth import authenticate
user = authenticate(username='admin', password='admin123')
if user is not None:
    print('Пароль верный')
```

---

## 📊 Статистика БД

### Текущее состояние:
- **Таблиц**: 10+ (включая встроенные Django таблицы)
- **Пользователей**: 1 (admin)
- **Профилей**: 1
- **Размер БД**: < 1 MB (начальный размер)

---

## 🔄 Резервная копия БД

### Экспорт данных:
```bash
python manage.py dumpdata > backup.json
```

### Импорт данных:
```bash
python manage.py loaddata backup.json
```

---

## 🚀 Масштабирование

### Переход с SQLite на MySQL:
```python
# settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'domi_sushi',
        'USER': 'root',
        'PASSWORD': 'password',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
```

### Переход на PostgreSQL:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'domi_sushi',
        'USER': 'postgres',
        'PASSWORD': 'password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

---

## 📝 Логирование БД

Для отладки SQL запросов в развитии:

```python
# settings.py (только для разработки!)
LOGGING = {
    'version': 1,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django.db.backends': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}
```

---

**Версия**: 1.0  
**Последнее обновление**: 31.03.2026  
**БД**: SQLite3
