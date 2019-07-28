from django.urls import path

from . import views

app_name = 'smorandev'
urlpatterns = [
    path('', views.StaticView.as_view(), name='index'),
    path('project/<int:pk>/', views.ProjectView.as_view(), name='project')
]
