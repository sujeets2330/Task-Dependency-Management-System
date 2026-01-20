'use client';

import { useState, useCallback, useEffect } from "react";
import { taskAPI } from "../services/api";

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all tasks
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskAPI.getTasks();
      setTasks(data.results || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create task
  const createTask = useCallback(async (taskData) => {
    setError(null);
    try {
      const newTask = await taskAPI.createTask(taskData);
      setTasks((prev) => [newTask, ...prev]);
      return newTask;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Update task
  const updateTask = useCallback(async (taskId, updates) => {
    setError(null);
    try {
      const updated = await taskAPI.updateTask(taskId, updates);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? updated : t))
      );
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Delete task
  const deleteTask = useCallback(async (taskId) => {
    setError(null);
    try {
      await taskAPI.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Add dependency
  const addDependency = useCallback(async (taskId, dependsOnId) => {
    setError(null);
    try {
      await taskAPI.addDependency(taskId, dependsOnId);
      await fetchTasks();
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchTasks]);

  // Remove dependency
  const removeDependency = useCallback(async (taskId, dependsOnId) => {
    setError(null);
    try {
      await taskAPI.removeDependency(taskId, dependsOnId);
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === taskId) {
            return {
              ...t,
              dependencies: t.dependencies.filter((d) => d.depends_on !== dependsOnId)
            };
          }
          return t;
        })
      );
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Check circular dependency
  const checkCircularDependency = useCallback(async (taskId, dependsOnId) => {
    try {
      return await taskAPI.checkCircularDependency(taskId, dependsOnId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    addDependency,
    removeDependency,
    checkCircularDependency
  };
};
