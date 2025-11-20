from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('bookings', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='room',
            name='tenant_id',
            field=models.CharField(default='', max_length=100, verbose_name='ID du centre', db_index=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='coursetype',
            name='tenant_id',
            field=models.CharField(default='', max_length=100, verbose_name='ID du centre', db_index=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='course',
            name='tenant_id',
            field=models.CharField(default='', max_length=100, verbose_name='ID du centre', db_index=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='booking',
            name='tenant_id',
            field=models.CharField(default='', max_length=100, verbose_name='ID du centre', db_index=True),
            preserve_default=False,
        ),
        # Modifier la contrainte unique pour CourseType
        migrations.AlterUniqueTogether(
            name='coursetype',
            unique_together={('name', 'tenant_id')},
        ),
        # Modifier la contrainte unique pour Course
        migrations.AlterUniqueTogether(
            name='course',
            unique_together={('coach', 'date', 'start_time', 'tenant_id')},
        ),
    ]
