const API_BASE_URL = "http://localhost:8000/api";

export const taskAPI = {
  // Get all tasks
  getTasks: async () => {
    const response = await fetch(`${API_BASE_URL}/tasks/`);
    if (!response.ok) throw new Error("Failed to fetch tasks");
    return response.json();
  },

  // Get single task
  getTask: async (id) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}/`);
    if (!response.ok) throw new Error("Failed to fetch task");
    return response.json();
  },

  // Create task
  createTask: async (data) => {
    const response = await fetch(`${API_BASE_URL}/tasks/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to create task");
    }
    return response.json();
  },

  // Update task
  updateTask: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to update task");
    }
    return response.json();
  },

  // Delete task
  deleteTask: async (id) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}/`, {
      method: "DELETE"
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete task");
    }
  },

  // Add dependency
  addDependency: async (taskId, dependsOnId) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/add_dependency/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ depends_on_id: dependsOnId })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to add dependency");
    }
    return response.json();
  },

  // Remove dependency
  removeDependency: async (taskId, dependsOnId) => {
    const response = await fetch(
      `${API_BASE_URL}/tasks/${taskId}/remove_dependency/?depends_on_id=${dependsOnId}`,
      { method: "DELETE" }
    );
    if (!response.ok) throw new Error("Failed to remove dependency");
  },

  // Check circular dependency
  checkCircularDependency: async (taskId, dependsOnId) => {
    const response = await fetch(`${API_BASE_URL}/tasks/check_circular_dependency/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task_id: taskId, depends_on_id: dependsOnId })
    });
    if (!response.ok) throw new Error("Failed to check circular dependency");
    return response.json();
  },

  // Get graph data
  getGraphData: async () => {
    const response = await fetch(`${API_BASE_URL}/tasks/graph_data/`);
    if (!response.ok) throw new Error("Failed to fetch graph data");
    return response.json();
  }
};
