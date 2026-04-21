from django.contrib import admin
from .models import UserProfile, Booking

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone', 'date_joined')
    list_filter = ('date_joined',)
    search_fields = ('user__username', 'phone', 'address')
    readonly_fields = ('date_joined',)
    
    fieldsets = (
        ('Информация пользователя', {
            'fields': ('user',)
        }),
        ('Контактная информация', {
            'fields': ('phone', 'address')
        }),
        ('Дата добавления', {
            'fields': ('date_joined',)
        }),
    )


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('name', 'booking_date', 'booking_time', 'number_of_persons', 'table_number', 'status', 'created_at')
    list_filter = ('status', 'booking_date', 'booking_type', 'created_at')
    search_fields = ('name', 'phone', 'email', 'user__username')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('booking_type', 'status', 'user')
        }),
        ('Дата и время', {
            'fields': ('booking_date', 'booking_time')
        }),
        ('Детали бронирования', {
            'fields': ('number_of_persons', 'table_number', 'special_requests')
        }),
        ('Контактная информация', {
            'fields': ('name', 'phone', 'email')
        }),
        ('Заметки администратора', {
            'fields': ('admin_notes',)
        }),
        ('Системная информация', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_confirmed', 'mark_cancelled', 'mark_completed']
    
    def mark_confirmed(self, request, queryset):
        updated = queryset.update(status='confirmed')
        self.message_user(request, f'{updated} брондау подтверждены.')
    mark_confirmed.short_description = "✅ Отметить как подтвержденные"
    
    def mark_cancelled(self, request, queryset):
        updated = queryset.update(status='cancelled')
        self.message_user(request, f'{updated} брондау отменены.')
    mark_cancelled.short_description = "❌ Отметить как отменённые"
    
    def mark_completed(self, request, queryset):
        updated = queryset.update(status='completed')
        self.message_user(request, f'{updated} брондау выполнены.')
    mark_completed.short_description = "✓ Отметить как выполненные"
