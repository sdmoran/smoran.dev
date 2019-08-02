from django.db import models
from django.utils.text import slugify


DEFAULT_LINK = "https://s3.us-east-2.amazonaws.com/smoran.dev/images/default.png?response-content-disposition=inline&X-Amz-Security-Token=AgoJb3JpZ2luX2VjEGMaCXVzLWVhc3QtMSJHMEUCIHhJwZiAoq9Cz%2BMZDLnFiRnCeJATaXBqMIOjB4shWWR2AiEA19U0zZrc22h7WbLAIiWtoY%2F1IrVMD0gw7ls7%2FQURcjUq5AMI3P%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgwyMTU2MzQ2NTQ5NTQiDO7DgwX3Jh5LO%2FnJ2yq4A5oIZw%2Fq0vp0M8gml88nyf%2BX1g518tLoJxqVdDKF5T4o9X9FUXkAnz%2Bozsv9fDRthXjrAFNF1a%2FxsvRW99%2Bn1qlMCsPMvX38k6KN1zGa1rR%2BGxan%2BuqyTtrVNMeefgDB7YVoSLK7ohypxk6XM4sOU4jI11hYLOfUY%2FrM9LXH8BeEPOhFPT1RLQlm2hfYNPMhQXfemEBdOKsAJuy5EZ%2FVaps0eRtfBTKeKEVclnhM75inSaCZywS1RzbXLNORHGZoZcwqFOkiA8okUJ27Yq%2FimPViqKz2S6KbJapsKIQ52TSFCI7AXkQK2og3m0dVhelVBALdcLyPjzJ%2BvTumxlWp3fBlfGaYERQKetim5f7PoHx7HGTFpRtJ2iI3PyOcYQ4IGfewNxfclnFn5pWJ8CgpMojcZ7cqXDCi2byOBKkzII5YP4D72sJ2dEocWT5sMQCQeZimb38XYY9%2FEDc8syG2vqWbbjQG4iQ9%2F9aG1DLppiNIUxK5OI1My%2Bt%2BWAaPHXTeMukfaUtw2vMyx%2FdCv6FlW%2FvgZWnaATYGFj8Hw4qsbuClse44UMRvnSPchT9OlWfJCvENjmiT2tdyMNj%2FkeoFOrQBZiMxA5g4WHmLdy0QpS77VsOgWZlhsqHG8c2CCxbIe7XeUw9qLYCNJ4vxHSvlJjC7uSRuwqW4a8sJ4CAmx9FXvi9dD6Zwy3WRCNiQU99QtjUPvQJaJ%2Ffa2TExvKDeeE%2FoQkWMgb7KZ%2FoW4xtEzt5TdAcc0E7wbShRloSy4UJ8HQgIf5u1Dcv9EidUm%2B60Q8CggXUxFJ%2BrF3H2zcbfbREpsw2ZFiXexsCNa4PfZCJJ9GOABBG%2B&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20190802T182659Z&X-Amz-SignedHeaders=host&X-Amz-Expires=300&X-Amz-Credential=ASIATENGTW3VPGPUIYE5%2F20190802%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=426185a3465ade57b0bad68074069686b7ae45a6b90ee9d41e9b9f5e1a284159"

class Project(models.Model):
    project_name = models.CharField(primary_key=True, verbose_name="Name", max_length=100)
    project_detail = models.TextField(verbose_name="Description")
    blurb = models.TextField(verbose_name="Blurb", default="Sample text")
    technologies = models.TextField(default="Python, probably")
    image = models.TextField(verbose_name="Image Link", default=DEFAULT_LINK)
    slug = models.SlugField()

    # Override save method to provide slugified version of PK
    def save(self, *args, **kwargs):
        self.slug = slugify(self.project_name)
        super(Project, self).save(*args, **kwargs)

    def __str__(self):
        return self.project_name
