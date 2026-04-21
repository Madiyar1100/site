from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    """Модель профиля пользователя"""
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Профиль пользователя"
        verbose_name_plural = "Профили пользователей"
    
    def __str__(self):
        return f"Профиль: {self.user.username}"


class Booking(models.Model):
    """Модель бронирования"""
    BOOKING_TYPES = [
        ('table', 'Столик'),
        ('event', 'Мероприятие'),
        ('other', 'Другое'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Ожидается подтверждение'),
        ('confirmed', 'Подтверждено'),
        ('cancelled', 'Отменено'),
        ('completed', 'Выполнено'),
    ]
    
    # Связь с пользователем (опционально, может быть и анонимное бронирование)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='bookings', verbose_name="Пользователь")
    
    # Данные бронирования
    booking_type = models.CharField(max_length=20, choices=BOOKING_TYPES, default='table', verbose_name="Тип бронирования")
    booking_date = models.DateField(verbose_name="Дата бронирования")
    booking_time = models.TimeField(verbose_name="Время бронирования")
    number_of_persons = models.PositiveIntegerField(verbose_name="Количество человек")
    table_number = models.CharField(max_length=50, blank=True, verbose_name="Столик")
    
    # Контактная информация
    name = models.CharField(max_length=100, verbose_name="Имя заказчика")
    phone = models.CharField(max_length=20, verbose_name="Телефон")
    email = models.EmailField(blank=True, verbose_name="Email")
    
    # Статус и комментарии
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="Статус")
    special_requests = models.TextField(blank=True, verbose_name="Специальные пожелания")
    admin_notes = models.TextField(blank=True, verbose_name="Заметки администратора")
    
    # Даты системы
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")
    
    class Meta:
        verbose_name = "Бронирование"
        verbose_name_plural = "Бронирования"
        ordering = ['-booking_date', '-booking_time']
    
    def __str__(self):
        return f"Брондау {self.booking_date} {self.booking_time} - {self.name} ({self.number_of_persons} адам)"
