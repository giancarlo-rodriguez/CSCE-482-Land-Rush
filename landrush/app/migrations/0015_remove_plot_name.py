# Generated by Django 5.0.2 on 2024-04-05 00:45

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0014_alter_plot_name'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='plot',
            name='name',
        ),
    ]