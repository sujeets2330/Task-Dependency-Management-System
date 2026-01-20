from .models import Task, TaskDependency


class TaskStatusUpdater:
    """
    Automatically updates task status based on dependency completion.
    
    Rules:
    1. If ALL dependencies are 'completed' -> set to 'in_progress' (ready to work)
    2. If ANY dependency is 'blocked' -> set to 'blocked'
    3. If dependencies exist but not all completed -> set to 'pending'
    4. If a task has no dependencies, status is not auto-changed
    5. When a task is marked 'completed', cascade updates to dependent tasks
    """

    @staticmethod
    def update_status_from_dependencies(task_id):
        """
        Update a task's status based on its dependencies.
        """
        try:
            task = Task.objects.get(id=task_id)
        except Task.DoesNotExist:
            return False

        # Get all dependencies
        dependencies = TaskDependency.objects.filter(task_id=task_id).select_related('depends_on')
        
        if not dependencies.exists():
            # No dependencies, don't auto-update status
            return True

        # Check status of all dependencies
        blocked_count = 0
        completed_count = 0

        for dep in dependencies:
            if dep.depends_on.status == 'blocked':
                blocked_count += 1
            elif dep.depends_on.status == 'completed':
                completed_count += 1

        # Determine new status
        if blocked_count > 0:
            new_status = 'blocked'
        elif completed_count == dependencies.count():
            new_status = 'in_progress'
        else:
            new_status = 'pending'

        # Update if status changed
        if task.status != new_status:
            task.status = new_status
            task.save(update_fields=['status', 'updated_at'])

        return True

    @staticmethod
    def cascade_update_on_completion(task_id):
        """
        When a task is marked 'completed', update all dependent tasks.
        """
        try:
            task = Task.objects.get(id=task_id)
        except Task.DoesNotExist:
            return False

        if task.status != 'completed':
            return False

        # Find all tasks that depend on this task
        dependent_tasks = TaskDependency.objects.filter(
            depends_on_id=task_id
        ).values_list('task_id', flat=True)

        # Update each dependent task
        for dep_task_id in dependent_tasks:
            TaskStatusUpdater.update_status_from_dependencies(dep_task_id)

        return True

    @staticmethod
    def update_task_status(task_id, new_status):
        """
        Update task status and cascade changes.
        """
        try:
            task = Task.objects.get(id=task_id)
        except Task.DoesNotExist:
            return False

        task.status = new_status
        task.save(update_fields=['status', 'updated_at'])

        # If marked as completed, cascade update to dependents
        if new_status == 'completed':
            TaskStatusUpdater.cascade_update_on_completion(task_id)
        # Otherwise, just update this task from its dependencies
        else:
            TaskStatusUpdater.update_status_from_dependencies(task_id)

        return True

    @staticmethod
    def validate_status_transition(current_status, new_status):
        """
        Validate if status transition is allowed.
        Basic validation - any status can transition to any other.
        """
        valid_statuses = ['pending', 'in_progress', 'completed', 'blocked']
        return new_status in valid_statuses
