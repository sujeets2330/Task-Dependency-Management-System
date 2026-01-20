# Task Dependency Management System - Technical Decisions

## 1. Circular Dependency Detection Algorithm

### Choice: Depth-First Search (DFS)
**Algorithm Used:** DFS with path tracking

### Why DFS?
- **Time Complexity:** O(V + E) where V = number of tasks, E = number of dependencies
- **Space Complexity:** O(V) for visited set
- Efficient for detecting cycles in directed graphs
- Easy to implement and understand
- Returns the exact cycle path for user feedback

### Implementation Details
```python
def _dfs(current_id, target_id, visited, path):
    # Find if target_id is reachable from current_id
    # If target_id is reachable, a cycle exists
```

**Process:**
1. When adding dependency from Task A to Task B
2. Run DFS from B to check if it can reach A
3. If reachable → cycle detected
4. Return the complete path: [B, X, Y, A]

**Alternative Considered:** Topological Sort
- More complex to implement
- Better for large graphs (100+ nodes)
- Not necessary for typical task dependencies
- Would require entire graph recomputation

### Example Test Case
```
Task 1 → Task 2 → Task 3 → Task 1 (Cycle)
Detected Path: [3, 2, 1, 3]
```

---

## 2. Auto Status Update Strategy

### Rules Implemented
1. **If ALL dependencies are 'completed'** → set to 'in_progress' (ready to work)
2. **If ANY dependency is 'blocked'** → set to 'blocked' (blocked by dependency)
3. **If dependencies exist but not all completed** → set to 'pending' (waiting)
4. **When marked 'completed'** → cascade update all dependent tasks

### Why This Design?
- **Realistic workflow:** Task becomes available when all dependencies done
- **Blocking propagation:** Issues cascade through dependent tasks
- **Automatic management:** No manual status changes needed for dependent tasks

### Implementation Flow
```
User marks Task A as "completed"
  ↓
System cascades to all tasks depending on A
  ↓
Each dependent task recalculates status from its dependencies
  ↓
Tasks with all dependencies done → "in_progress"
  ↓
Tasks with blocked dependencies → "blocked"
```

### Database Trigger Alternative (Not Used)
- Reason: Triggers are database-specific
- Django ORM handles logic better
- More portable and testable

---

## 3. Frontend Architecture Choices

### State Management: React Hooks (No Redux/Zustand)
**Why Custom Hook (useTasks)?**
- Meets requirement of "no Redux/Zustand"
- Simple for small-medium apps
- useCallback prevents unnecessary re-renders
- Easy to understand and maintain

### Graph Visualization: Canvas (No D3.js/Cytoscape)
**Implementation:**
- HTML5 Canvas 2D API
- Custom hierarchical layout (rows/columns)
- Click to highlight dependencies
- Zoom and pan functionality

**Why not SVG?**
- Canvas better for dynamic rendering
- Easier to handle click interactions
- Better performance with 20-30 nodes

**Why not D3.js?**
- Requirement: No external graph libraries
- Custom implementation matches requirement perfectly
- Simpler codebase, faster load time

### Layout Algorithm: Hierarchical (Grid-based)
- Nodes positioned in rows and columns
- Spacing: 150px x 150px
- Clean, organized appearance
- Performance: O(n) time complexity

**Why not Force-Directed Layout?**
- More complex implementation
- Not required by specifications
- Overkill for typical task graphs

---

## 4. Database Design Decisions

### Why MySQL 8.0+?
- Requirement specified
- Strong consistency with FOREIGN KEYS
- UNIQUE constraints prevent duplicate dependencies
- Good transaction support

### Schema Simplicity
- Only essential fields
- No unnecessary complexity
- Unique constraint: (task, depends_on) prevents duplicates
- Indexes on foreign keys for query performance

### No Soft Deletes
- Requirement: simple design
- Hard deletes simpler to understand
- Error handling warns about dependencies before deletion

---

## 5. API Design Decisions

### RESTful Endpoints
```
POST   /api/tasks/                          - Create task
GET    /api/tasks/                          - List tasks
GET    /api/tasks/{id}/                     - Get task
PATCH  /api/tasks/{id}/                     - Update task
DELETE /api/tasks/{id}/                     - Delete task
POST   /api/tasks/{id}/add_dependency/      - Add dependency
DELETE /api/tasks/{id}/remove_dependency/   - Remove dependency
POST   /api/tasks/check_circular_dependency/- Check cycle
GET    /api/tasks/graph_data/               - Get graph data
```

### Why Custom Actions over Nested Routes?
- Clearer intent
- Better validation at action level
- DRF's `@action` decorator is perfect for this

### Error Response Format
```json
{
  "error": "Circular dependency detected",
  "path": [1, 3, 5, 1]
}
```
- Consistent error handling
- Includes actionable information (path)
- User-friendly messages

---

## 6. Frontend Validation

### Validation Layers
1. **Client-side:** Instant feedback, better UX
2. **Server-side:** Security, data integrity
3. **Backend API:** Circular dependency check before save

### Why Two-Layer Validation?
- **Client:** Fast, prevents unnecessary API calls
- **Server:** Prevents concurrent update issues
- Both prevent invalid states

---

## 7. Performance Considerations

### For 20-30 Tasks
- Canvas rendering: Negligible overhead
- DFS algorithm: < 1ms (even with 30 dependencies)
- API calls: Minimal with proper caching
- Frontend state: Efficient with useCallback

### Future Optimizations
- Virtual scrolling if task list grows
- Pagination for large datasets
- Memoization for expensive renders
- Graph auto-layout algorithms

---

## 8. Trade-offs Made

| Decision | Trade-off | Chosen For |
|----------|-----------|-----------|
| DFS vs Topological Sort | Simplicity vs Graph Algorithm | Simplicity |
| Canvas vs SVG | Performance vs Semantics | Performance/Interaction |
| Custom State vs Redux | Simplicity vs Scalability | Simplicity |
| Grid Layout vs Force-Directed | Simplicity vs Aesthetics | Simplicity |
| Hard Delete vs Soft Delete | Simplicity vs History | Simplicity |

---

## 9. What Would Be Improved With More Time

1. **Graph Visualization:**
   - Force-directed layout for better aesthetics
   - Drag-and-drop node repositioning
   - Save layout preferences

2. **Features:**
   - Task priority levels
   - Estimated completion time
   - Task assignees
   - Comments and activity logs
   - Undo/redo for actions

3. **Performance:**
   - WebSocket for real-time updates
   - GraphQL for optimized queries
   - Caching layer (Redis)
   - Pagination for large datasets

4. **Testing:**
   - Unit tests for all utils (DFS, status updates)
   - Integration tests for API
   - E2E tests for UI workflows
   - Performance benchmarks

5. **Frontend Polish:**
   - Dark mode
   - Keyboard shortcuts
   - Export graph as PNG/SVG
   - Search and filter
   - Bulk operations

6. **Backend:**
   - Rate limiting
   - Audit logging
   - Concurrent update handling
   - Background jobs for cascading updates

---

## 10. Security Considerations

### Current Implementation
- CORS enabled for development
- Input validation on all endpoints
- SQL injection prevention via ORM
- CSRF protection built-in

### Production Improvements
- Rate limiting
- Authentication/Authorization
- HTTPS enforcement
- Input sanitization
- SQL query monitoring

---

## Conclusion

This design prioritizes **simplicity and clarity** over advanced features, following the principle "Make it work first, optimize later." The circular dependency detection algorithm is proven and efficient, the UI is clean and functional, and the code is maintainable and well-documented.
