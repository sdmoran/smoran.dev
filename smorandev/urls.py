from django.urls import path

from . import views

app_name = 'smorandev'
urlpatterns = [
    path('', views.StaticView.as_view(), name='index'),
    path('projects/', views.ProjectList.as_view(), name='project-index'),
    path('projects/<str:slug>/', views.ProjectView.as_view(), name='project')
]
