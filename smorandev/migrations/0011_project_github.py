# Generated by Django 2.2.4 on 2019-09-02 19:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('smorandev', '0010_auto_20190824_1256'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='github',
            field=models.URLField(blank=True, default=None, null=True, verbose_name='Github Link'),
        ),
    ]
