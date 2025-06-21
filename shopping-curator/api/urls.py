from django.urls import path
from .views import index

urlpatterns = [
    path("", index, name="home"),            # root view
    path("process/", index, name="process"), # handles POST too
]
