# Generated by Django 4.2.10 on 2024-04-21 23:03

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0020_alter_event_created_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='FilledPlot',
            fields=[
                ('id', models.IntegerField(primary_key=True, serialize=False)),
                ('image', models.ImageField(upload_to='filled_plots/')),
                ('event', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='filled_plots', to='app.event')),
            ],
            options={
                'verbose_name_plural': 'Filled Plots',
                'db_table': 'filled_plots',
            },
        ),
    ]
