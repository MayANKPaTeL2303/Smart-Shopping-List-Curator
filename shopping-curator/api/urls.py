from django.urls import path
from .views import index, get_recipe_ingredients

urlpatterns = [
    # path("", index, name="home"),            # root view
    path("get-recipe-ingredients/", get_recipe_ingredients, name="get_recipe_ingredients"),
    path("process/", index, name="process"), # handles POST too
]
