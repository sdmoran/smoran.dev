from django.urls import path

from . import views

app_name = 'smorandev'
urlpatterns = [
    path('', views.StaticView.as_view(), name='index'),
    path('projects/<str:pk>/', views.ProjectView.as_view(), name='project')
]
