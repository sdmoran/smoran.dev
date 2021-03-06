from django.db import models
from django.utils.text import slugify


DEFAULT_LINK = "https://s3.us-east-2.amazonaws.com/smoran.dev/images/default.png"
class Project(models.Model):
    project_name = models.CharField(primary_key=True, verbose_name="Name", max_length=100)
    project_detail = models.TextField(verbose_name="Description", default="Description")
    github = models.URLField(verbose_name="Github Link", default=None, blank=True, null=True)
    blurb = models.TextField(verbose_name="Blurb", default="Sample text")
    technologies = models.TextField(default="Python, probably")
    markdown = models.BooleanField(default=False)
    image = models.TextField(verbose_name="Image Link", default=DEFAULT_LINK)
    image_size = models.TextField(default="col-md-4")
    webgl_path = models.TextField(default=None, blank=True, null=True)  # Path in static/ for projects that use WebGL
    webgl_vshader = models.TextField(verbose_name="Vertex Shader", default=None, blank=True, null=True)
    webgl_fshader = models.TextField(verbose_name="Fragment Shader", default=None, blank=True, null=True)
    slug = models.SlugField(default="")

    #Override save method to provide slugified version of PK
    def save(self, *args, **kwargs):
        self.slug = slugify(self.project_name)
        super(Project, self).save(*args, **kwargs)

    def __str__(self):
        return self.project_name

