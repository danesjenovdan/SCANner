# Generated by Django 2.0 on 2017-12-11 14:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('marker', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='markedtext',
            name='text',
            field=models.TextField(default=''),
            preserve_default=False,
        ),
    ]