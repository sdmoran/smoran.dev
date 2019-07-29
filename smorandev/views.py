from django.http import HttpResponseRedirect
from django.shortcuts import get_object_or_404, render
from django.urls import reverse
from django.views import generic

from .models import Project

class StaticView(generic.TemplateView):
    template_name = 'smorandev/index.html'


class ProjectView(generic.DetailView):
    model = Project
    template_name = 'smorandev/project.html'


class ProjectList(generic.ListView):
    template_name = 'smorandev/project-index.html'
    context_object_name = 'project_list'

    def get_queryset(self):
        return Project.objects.all()

def static(request):
    return render(request, 'smorandev/index.html', {})