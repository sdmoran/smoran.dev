import os
try:
    from .dev_settings import *
except ImportError:
    from .production_settings import *


