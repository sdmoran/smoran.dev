# Generated by Django 2.2.4 on 2019-08-24 12:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('smorandev', '0009_auto_20190823_2213'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='project',
            name='webgl_url',
        ),
        migrations.AddField(
            model_name='project',
            name='webgl_path',
            field=models.TextField(blank=True, default=None, null=True),
        ),
    ]
