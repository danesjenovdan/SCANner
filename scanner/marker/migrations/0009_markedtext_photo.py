# Generated by Django 2.0 on 2018-02-06 07:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('marker', '0008_auto_20180205_2125'),
    ]

    operations = [
        migrations.AddField(
            model_name='markedtext',
            name='photo',
            field=models.FileField(blank=True, null=True, upload_to=''),
        ),
    ]
