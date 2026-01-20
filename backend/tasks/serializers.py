from rest_framework import serializers
from .models import Task, TaskDependency


class TaskDependencySerializer(serializers.ModelSerializer):
    depends_on_title = serializers.CharField(source='depends_on.title', read_only=True)

    class Meta:
        model = TaskDependency
        fields = ['id', 'depends_on', 'depends_on_title', 'created_at']


class TaskSerializer(serializers.ModelSerializer):
    dependencies = TaskDependencySerializer(many=True, read_only=True)
    dependent_tasks = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'status', 'dependencies', 'dependent_tasks', 'created_at', 'updated_at']

    def get_dependent_tasks(self, obj):
        dependents = obj.dependents.all()
        return [
            {
                'id': dep.task.id,
                'title': dep.task.title,
                'status': dep.task.status
            }
            for dep in dependents
        ]


class TaskCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['title', 'description', 'status']


class AddDependencySerializer(serializers.Serializer):
    depends_on_id = serializers.IntegerField()

    def validate_depends_on_id(self, value):
        if not Task.objects.filter(id=value).exists():
            raise serializers.ValidationError("Task does not exist.")
        return value
