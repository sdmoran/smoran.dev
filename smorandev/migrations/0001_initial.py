# Generated by Django 2.2.4 on 2019-08-14 01:47

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Project',
            fields=[
                ('project_name', models.CharField(max_length=100, primary_key=True, serialize=False, verbose_name='Name')),
                ('project_detail', models.TextField(verbose_name='Description')),
                ('blurb', models.TextField(default='Sample text', verbose_name='Blurb')),
                ('technologies', models.TextField(default='Python, probably')),
                ('image', models.TextField(default='https://s3.us-east-2.amazonaws.com/smoran.dev/images/default.png', verbose_name='Image Link')),
                ('slug', models.SlugField(default='sluggg')),
            ],
        ),
    ]
