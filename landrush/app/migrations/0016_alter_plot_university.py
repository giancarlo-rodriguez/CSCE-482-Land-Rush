# Generated by Django 5.0.2 on 2024-04-05 00:46

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0015_remove_plot_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='plot',
            name='university',
            field=models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='plot', to='app.university'),
        ),
    ]