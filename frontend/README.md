# Task Dependency Manager - Frontend

## Overview
React 18 frontend for the Task Dependency Management System with real-time task management and interactive dependency graph visualization.

## Requirements
- Node.js 14+ (with npm)
- Backend API running on `http://localhost:8000`

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Development Server
```bash
npm run dev
```
Frontend will be available at `http://localhost:3000`

### 3. Build for Production
```bash
npm run build
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── DependencyGraph.jsx    - Canvas-based graph visualization
│   │   ├── TaskCard.jsx           - Individual task component
│   │   ├── TaskForm.jsx           - Task creation form
│   │   └── TaskList.jsx           - Task list container
│   ├── hooks/
│   │   └── useTasks.js            - Custom hook for task management
│   ├── services/
│   │   └── api.js                 - API service layer
│   ├── App.jsx                    - Main application component
│   ├── main.jsx                   - Entry point
│   └── index.css                  - Global styles with Tailwind
├── vite.config.js                 - Vite configuration
├── tailwind.config.js             - Tailwind CSS configuration
└── package.json
```

## Key Features

### 1. Task Management
- **Create Tasks:** Add new tasks with title and description
- **Update Status:** Change task status (pending → in_progress → completed/blocked)
- **Delete Tasks:** Remove tasks with dependency warnings
- **View Dependencies:** See all tasks depending on current task

### 2. Dependency Management
- **Add Dependencies:** Select tasks to depend on
- **Remove Dependencies:** Unlink dependencies
- **Circular Detection:** Real-time check before adding
- **Visual Feedback:** Clear indication of blocking relationships

### 3. Dependency Graph Visualization
- **Canvas Rendering:** HTML5 Canvas for smooth rendering
- **Node Colors:** Status-based color coding
  - Gray: Pending
  - Blue: In Progress
  - Green: Completed
  - Red: Blocked
- **Click Highlighting:** Click nodes to highlight connected tasks
- **Zoom & Pan:** Scroll to zoom, view full graph at different scales
- **Reset View:** Button to reset zoom and pan

### 4. Statistics Dashboard
- Total tasks count
- Tasks in progress
- Completed tasks
- Blocked tasks

## Component Details

### useTasks Hook
Manages all task-related state and API calls:
```javascript
const {
  tasks,           // Array of all tasks
  loading,         // Loading state
  error,           // Error messages
  fetchTasks,      // Refresh task list
  createTask,      // Create new task
  updateTask,      // Update task details/status
  deleteTask,      // Delete task
  addDependency,   // Add dependency relationship
  removeDependency,// Remove dependency
  checkCircularDependency // Check for cycles
} = useTasks();
```

### TaskCard Component
Displays individual task with:
- Title and description
- Status badge with color coding
- Status dropdown
- Delete button
- Dependency management (add/remove)
- Expandable dependency view

### DependencyGraph Component
Canvas-based visualization featuring:
- Hierarchical node layout
- Arrow edges showing dependencies
- Click to highlight related tasks
- Zoom in/out functionality
- Pan support
- Reset view button

### TaskForm Component
Creates new tasks with:
- Title input (required)
- Description textarea (optional)
- Input validation
- Error messages
- Submit button with loading state

## API Integration

All API calls go through `/frontend/src/services/api.js`:
- Base URL: `http://localhost:8000/api`
- Automatic error handling
- Response validation

## Styling

Uses Tailwind CSS v3 with custom color scheme:
- Primary: #2563eb (Blue)
- Success: #10b981 (Green)
- Danger: #ef4444 (Red)
- Secondary: #64748b (Gray)

Status badges with Tailwind components:
```css
.status-pending    { bg-gray-200 }
.status-in_progress { bg-blue-200 }
.status-completed  { bg-green-200 }
.status-blocked    { bg-red-200 }
```

## Error Handling

### User-Friendly Messages
- "This task cannot depend on itself"
- "Circular dependency detected: [path]"
- Network error messages
- Validation error feedback

### Fallback States
- Empty state when no tasks exist
- Loading indicators for API calls
- Error boundaries for failed requests
- Graceful degradation on failures

## Performance Optimizations

1. **useCallback:** Prevents unnecessary re-renders
2. **Memoization:** Efficient state updates
3. **Canvas Rendering:** Smooth graph visualization
4. **Event Delegation:** Efficient event handling

## Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Modern browsers with ES6 support

## Troubleshooting

### Backend Connection Failed
- Ensure Django backend is running on `http://localhost:8000`
- Check CORS settings in Django
- Verify API endpoints are accessible

### Graph Not Rendering
- Check browser console for errors
- Verify tasks are created
- Check canvas element in HTML

### Tasks Not Loading
- Check network tab in browser DevTools
- Verify backend API response
- Check useTasks hook error state

## Future Enhancements

1. **Real-time Updates:** WebSocket integration
2. **Advanced Layouts:** Force-directed graph layout
3. **Drag & Drop:** Reorder tasks and nodes
4. **Export:** Export graph as PNG/SVG
5. **Search & Filter:** Find tasks by name or status
6. **Dark Mode:** Light/dark theme toggle
7. **Keyboard Shortcuts:** Power user features
8. **Offline Mode:** Service worker caching

## Development Tips

### Debug Mode
Add to App.jsx:
```javascript
console.log("[v0] Tasks loaded:", tasks);
console.log("[v0] Selected task:", selectedTaskId);
```

### Testing Circular Dependencies
```javascript
// Create: Task 1, Task 2, Task 3
// Add: 1 depends on 2
// Add: 2 depends on 3
// Try: 3 depends on 1 (should fail)
```

### Canvas Debugging
```javascript
// In DependencyGraph.jsx
// Log node positions and dependencies
console.log("[v0] Node positions:", nodePositions);
console.log("[v0] Dependencies:", dependencies);
```
