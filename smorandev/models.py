from django.db import models
from django.utils.text import slugify


class Project(models.Model):
    project_name = models.CharField(primary_key=True, max_length=100)
    project_detail = models.CharField(max_length=1000)
    slug = models.SlugField()

    # Override save method to provide slugified version of PK
    def save(self, *args, **kwargs):
        self.slug = slugify(self.project_name)
        super(Project, self).save(*args, **kwargs)

    def __str__(self):
        return self.project_name
