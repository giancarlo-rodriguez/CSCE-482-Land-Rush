# Generated by Django 5.0.3 on 2024-03-26 17:18

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0005_remove_plot_university'),
    ]

    operations = [
        migrations.AddField(
            model_name='plot',
            name='university',
            field=models.ForeignKey(default=None, on_delete=django.db.models.deletion.CASCADE, related_name='plot', to='app.university'),
        ),
    ]