from django.contrib import admin
from .models import Project, WebGLData


class WebGLInline(admin.StackedInline):
    model = WebGLData
    fk_name = "project"
    fieldsets = [
        (None, {
            'fields': ('project', 'webgl_path', 'webgl_fshader', 'webgl_vshader'),
        })
    ]


class ProjectAdmin(admin.ModelAdmin):
    # Removes slug field from visibility in admin view.
    fieldsets = (
        (None, {'fields': ('project_name', 'project_detail', 'blurb', 'technologies', 'image', 'image_size',)}),
    )

    # if WebGLData.objects.filter(project=Project.project_name):
    inlines = [
        WebGLInline
    ]


admin.site.register(Project, ProjectAdmin)
