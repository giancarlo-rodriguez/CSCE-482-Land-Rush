# Generated by Django 5.0.2 on 2024-04-05 00:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0012_coordinates'),
    ]

    operations = [
        migrations.AddField(
            model_name='plot',
            name='name',
            field=models.CharField(default=None, max_length=256),
        ),
    ]
