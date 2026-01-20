import TaskCard from "./TaskCard";

export default function TaskList({
  tasks,
  onStatusChange,
  onAddDependency,
  onRemoveDependency,
  onDelete,
  onCheckCircularDependency,
  isLoading,
  error
}) {
  if (tasks.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <p className="text-secondary text-lg">No tasks yet. Create your first task to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          allTasks={tasks}
          onStatusChange={onStatusChange}
          onAddDependency={onAddDependency}
          onRemoveDependency={onRemoveDependency}
          onDelete={onDelete}
          onCheckCircularDependency={onCheckCircularDependency}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
