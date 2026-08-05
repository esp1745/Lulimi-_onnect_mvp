from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('teachers', '0004_teacher_work_experience'),
    ]

    operations = [
        migrations.AddField(
            model_name='teacher',
            name='intro_video_url',
            field=models.URLField(blank=True),
        ),
        migrations.AddField(
            model_name='teacher',
            name='city',
            field=models.CharField(blank=True, max_length=100),
        ),
    ]
