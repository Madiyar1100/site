from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('menu/', views.menu, name='menu'),
    path('auth/', views.auth_page, name='auth'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.profile, name='profile'),
    path('booking/create/', views.create_booking, name='create_booking'),
    path('chat/', views.chat_handler, name='chat_handler'),
]
