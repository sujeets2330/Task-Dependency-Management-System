from django.db import models


class Task(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('blocked', 'Blocked'),
    ]

    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        db_table = 'tasks'

    def __str__(self):
        return f"{self.id} - {self.title}"


class TaskDependency(models.Model):
    id = models.AutoField(primary_key=True)
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name='dependencies'
    )
    depends_on = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name='dependents'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('task', 'depends_on')
        db_table = 'task_dependencies'

    def __str__(self):
        return f"Task {self.task.id} depends on Task {self.depends_on.id}"
