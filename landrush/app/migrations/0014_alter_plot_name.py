# Generated by Django 5.0.2 on 2024-04-05 00:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0013_plot_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='plot',
            name='name',
            field=models.CharField(blank=True, default=None, max_length=256),
        ),
    ]
