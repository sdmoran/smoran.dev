from django.http import FileResponse, Http404
from django.shortcuts import render
from django.views import generic
from django.conf import settings
from django.contrib.staticfiles.templatetags.staticfiles import static
import random
import os


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


# Serves my resume as a PDF!
def pdf_view(request):
    try:
        url = os.path.join(settings.STATIC_ROOT, 'smoran_resume.pdf')
        return FileResponse(open(url, 'rb'), content_type='application/pdf')
    except FileNotFoundError:
        raise Http404()


def error_404(request, *args, **kwargs):
    data = {}
    return render(request, 'smorandev/404.html', data)
