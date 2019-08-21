from django.contrib import admin
from .models import Project


class ProjectAdmin(admin.ModelAdmin):
    # Removes slug field from visibility in admin view.
    fieldsets = [
        (None, {'fields': ('project_name', 'project_detail', 'blurb', 'technologies', 'image', 'image_size', 'webgl_url')}),
        ]


admin.site.register(Project, ProjectAdmin)
