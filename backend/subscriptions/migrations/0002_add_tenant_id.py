from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('subscriptions', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='subscriptionplan',
            name='tenant_id',
            field=models.CharField(default='', max_length=100, verbose_name='ID du centre', db_index=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='subscription',
            name='tenant_id',
            field=models.CharField(default='', max_length=100, verbose_name='ID du centre', db_index=True),
            preserve_default=False,
        ),
        # Modifier la contrainte unique pour SubscriptionPlan
        migrations.AlterUniqueTogether(
            name='subscriptionplan',
            unique_together={('name', 'tenant_id')},
        ),
    ]