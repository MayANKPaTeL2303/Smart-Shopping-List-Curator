from django.db import models

class Request(models.Model):
    text = models.TextField(blank=True, null=True) 
    image = models.ImageField(upload_to='requests/', blank=True, null=True)  
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.text if self.text else f"Image"
