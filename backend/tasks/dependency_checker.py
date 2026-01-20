from .models import Task, TaskDependency


class CircularDependencyChecker:
    """
    Detects circular dependencies using Depth-First Search (DFS).
    
    Algorithm:
    1. Build adjacency list of all task dependencies
    2. For a new dependency (A depends on B), check if B already depends on A (directly or indirectly)
    3. Use DFS to traverse from B and check if we can reach A
    4. Return the circular path if found
    
    Time Complexity: O(V + E) where V = tasks, E = dependencies
    """

    @staticmethod
    def detect_circular_dependency(task_id, depends_on_id):
        """
        Check if adding dependency from task_id to depends_on_id creates a cycle.
        
        Args:
            task_id: ID of the task that will depend on another
            depends_on_id: ID of the task it will depend on
            
        Returns:
            {
                'has_cycle': bool,
                'path': list (if cycle exists) or None
            }
        """
        if task_id == depends_on_id:
            return {
                'has_cycle': True,
                'path': [task_id, task_id]
            }

        # Check if depends_on can reach task_id through existing dependencies
        visited = set()
        path = []
        
        has_cycle = CircularDependencyChecker._dfs(
            depends_on_id,
            task_id,
            visited,
            path
        )
        
        if has_cycle:
            path.append(task_id)  # Complete the cycle
            return {
                'has_cycle': True,
                'path': path
            }
        
        return {
            'has_cycle': False,
            'path': None
        }

    @staticmethod
    def _dfs(current_id, target_id, visited, path):
        """
        DFS traversal to find if target_id is reachable from current_id.
        """
        if current_id == target_id:
            path.append(current_id)
            return True
        
        if current_id in visited:
            return False
        
        visited.add(current_id)
        path.append(current_id)
        
        # Get all tasks that current task depends on
        dependencies = TaskDependency.objects.filter(task_id=current_id).values_list('depends_on_id', flat=True)
        
        for dep_id in dependencies:
            if CircularDependencyChecker._dfs(dep_id, target_id, visited, path):
                return True
        
        path.pop()
        return False

    @staticmethod
    def get_all_dependencies(task_id):
        """Get all tasks that the given task depends on (directly and indirectly)."""
        visited = set()
        dependencies = set()
        CircularDependencyChecker._collect_dependencies(task_id, visited, dependencies)
        return dependencies

    @staticmethod
    def _collect_dependencies(task_id, visited, dependencies):
        """Recursively collect all dependencies."""
        if task_id in visited:
            return
        
        visited.add(task_id)
        
        direct_deps = TaskDependency.objects.filter(task_id=task_id).values_list('depends_on_id', flat=True)
        
        for dep_id in direct_deps:
            dependencies.add(dep_id)
            CircularDependencyChecker._collect_dependencies(dep_id, visited, dependencies)
