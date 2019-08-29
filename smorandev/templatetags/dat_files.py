from django import template
from django.conf import settings
import os


register = template.Library()


# Returns content of dat files in directory associated with given project name.
# TODO figure out paths more... replacing // isn't ideal. Try/except works ok but still could be better.
@register.simple_tag
def get_datfiles(path):
    try:
        mainpath = settings.STATIC_ROOT
        mainpath = mainpath.replace('./', '').replace('\\', '/')
        path = path.split('/')[1:]
        path = '/'.join(path)
        path = os.path.relpath(os.path.dirname(path))   # Gives us the directory that the project JS file is in
        webgl = (os.path.join(mainpath, path, './datfiles'))
        return os.listdir(webgl.replace('..\\', '').replace('\\', '/'))

    except FileNotFoundError:
        return False
