# Generated by Django 5.0.4 on 2024-04-03 16:40

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0009_event_plot'),
    ]

    operations = [
        migrations.AddField(
            model_name='event',
            name='timestamp',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
    ]
