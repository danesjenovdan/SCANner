# Generated by Django 2.0 on 2018-02-05 21:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('marker', '0007_auto_20180205_2038'),
    ]

    operations = [
        migrations.AlterField(
            model_name='markedtext',
            name='date',
            field=models.DateField(blank=True, null=True),
        ),
    ]
