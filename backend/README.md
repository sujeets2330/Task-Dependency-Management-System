# Task Dependency Management System - Backend

## Overview
Django REST Framework backend for the Task Dependency Management System with automatic circular dependency detection and status updates.

## Requirements
- Python 3.8+
- Django 4.2.0
- MySQL 8.0+
- pip

## Installation

### 1. Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Database Setup
Create a MySQL database:
```sql
CREATE DATABASE task_dependency_db;
```

Update `config/settings.py` with your MySQL credentials if needed.

### 4. Run Migrations
```bash
python manage.py migrate
```

### 5. Create Superuser (Optional)
```bash
python manage.py createsuperuser
```

### 6. Run Development Server
```bash
python manage.py runserver
```

The backend will be available at `http://localhost:8000/api/`

## API Endpoints

### Tasks
- `GET /api/tasks/` - List all tasks
- `POST /api/tasks/` - Create a new task
- `GET /api/tasks/{id}/` - Get task details
- `PATCH /api/tasks/{id}/` - Update task
- `DELETE /api/tasks/{id}/` - Delete task

### Dependencies
- `POST /api/tasks/{id}/add_dependency/` - Add a dependency
- `DELETE /api/tasks/{id}/remove_dependency/?depends_on_id={id}` - Remove dependency
- `POST /api/tasks/check_circular_dependency/` - Check for circular dependencies
- `GET /api/tasks/graph_data/` - Get all tasks and dependencies for visualization

## Key Features

### Circular Dependency Detection
Uses Depth-First Search (DFS) algorithm to detect cycles:
- Time Complexity: O(V + E)
- Prevents cycles before saving to database
- Returns the circular path when detected

### Auto Status Updates
- Automatically updates task status based on dependencies
- If all dependencies are completed → sets task to "in_progress"
- If any dependency is blocked → sets task to "blocked"
- Cascades updates when a task is marked as completed

## Database Schema

### Task Table
```
- id: Primary Key
- title: CharField (200)
- description: TextField
- status: CharField (pending/in_progress/completed/blocked)
- created_at: DateTime
- updated_at: DateTime
```

### TaskDependency Table
```
- id: Primary Key
- task: Foreign Key → Task
- depends_on: Foreign Key → Task
- created_at: DateTime
- Unique constraint: (task, depends_on)
```

## Error Handling
- 400: Invalid request (circular dependency, self-dependency, missing data)
- 404: Task not found
- 500: Server error

## Testing
To test the circular dependency detection:
```python
# Example: Create tasks 1→2→3→1
from tasks.dependency_checker import CircularDependencyChecker

result = CircularDependencyChecker.detect_circular_dependency(task_id=1, depends_on_id=3)
# Returns: {'has_cycle': True, 'path': [3, 2, 1, 3]}
```
