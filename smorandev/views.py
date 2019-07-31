from django.http import HttpResponseRedirect
from django.shortcuts import get_object_or_404, render
from django.urls import reverse
from django.views import generic
import random

from .models import Project


# Home is now a list view, to add projects to cards on homepage
class StaticView(generic.ListView):
    template_name = 'smorandev/index.html'
    context_object_name = 'project_list'

    def get_queryset(self):
        # Choose some random projects to display links to from homepage
        projects = []
        for p in Project.objects.all():
            projects.append(p.pk)
        random.shuffle(projects)
        picks = projects[0:2]

        # Pass projects to template
        return Project.objects.filter(pk__in=picks)


class ProjectView(generic.DetailView):
    model = Project
    template_name = 'smorandev/project.html'


class ProjectList(generic.ListView):
    template_name = 'smorandev/project-index.html'
    context_object_name = 'project_list'

    def get_queryset(self):
        return Project.objects.all()