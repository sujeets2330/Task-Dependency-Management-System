'use client';

import { useEffect, useRef, useState } from "react";

export default function DependencyGraph({ tasks, dependencies, selectedTaskId }) {
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [highlightedNodes, setHighlightedNodes] = useState(new Set());

  const statusColors = {
    pending: "#9ca3af",
    in_progress: "#3b82f6",
    completed: "#10b981",
    blocked: "#ef4444"
  };

  useEffect(() => {
    if (!canvasRef.current || tasks.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Position nodes in a hierarchical layout
    const nodePositions = calculateNodePositions(tasks.length);
    const nodeMap = new Map(tasks.map((task, idx) => [task.id, { ...task, idx }]));

    // Clear canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw edges
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 2;
    dependencies.forEach((dep) => {
      const taskNode = nodeMap.get(dep.task_id);
      const depNode = nodeMap.get(dep.depends_on_id);

      if (taskNode && depNode) {
        const fromPos = nodePositions[taskNode.idx];
        const toPos = nodePositions[depNode.idx];

        // Check if highlighted
        if (
          highlightedNodes.has(dep.task_id) ||
          highlightedNodes.has(dep.depends_on_id)
        ) {
          ctx.strokeStyle = "#ef4444";
          ctx.lineWidth = 3;
        } else {
          ctx.strokeStyle = "#cbd5e1";
          ctx.lineWidth = 2;
        }

        drawArrow(ctx, fromPos.x, fromPos.y, toPos.x, toPos.y);
      }
    });

    // Draw nodes
    tasks.forEach((task, idx) => {
      const pos = nodePositions[idx];
      const radius = 30;
      const isHighlighted = highlightedNodes.has(task.id);
      const isSelected = task.id === selectedTaskId;

      ctx.fillStyle = statusColors[task.status];
      ctx.beginPath();
      ctx.arc(
        pan.x + pos.x * zoom,
        pan.y + pos.y * zoom,
        radius * zoom,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Border for selected or highlighted
      if (isSelected || isHighlighted) {
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Label
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${12 * zoom}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        task.id.toString(),
        pan.x + pos.x * zoom,
        pan.y + pos.y * zoom
      );
    });

    // Draw zoom level
    ctx.fillStyle = "#1e293b";
    ctx.font = "12px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`Zoom: ${(zoom * 100).toFixed(0)}%`, 10, 20);
  }, [tasks, dependencies, zoom, pan, highlightedNodes, selectedTaskId]);

  const calculateNodePositions = (count) => {
    const positions = [];
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    const spacingX = 150;
    const spacingY = 150;

    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      positions.push({
        x: col * spacingX + 100,
        y: row * spacingY + 100
      });
    }

    return positions;
  };

  const drawArrow = (ctx, fromX, fromY, toX, toY) => {
    const headlen = 15;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const nodePositions = calculateNodePositions(tasks.length);
    const radius = 30;

    tasks.forEach((task, idx) => {
      const pos = nodePositions[idx];
      const nodeX = pan.x + pos.x * zoom;
      const nodeY = pan.y + pos.y * zoom;
      const distance = Math.sqrt(Math.pow(x - nodeX, 2) + Math.pow(y - nodeY, 2));

      if (distance <= radius * zoom) {
        // Toggle highlight for clicked node and its dependencies
        const newHighlighted = new Set(highlightedNodes);
        if (newHighlighted.has(task.id)) {
          newHighlighted.delete(task.id);
        } else {
          newHighlighted.add(task.id);
          // Add connected tasks
          dependencies.forEach((dep) => {
            if (dep.task_id === task.id) newHighlighted.add(dep.depends_on_id);
            if (dep.depends_on_id === task.id) newHighlighted.add(dep.task_id);
          });
        }
        setHighlightedNodes(newHighlighted);
      }
    });
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((prev) => Math.max(0.5, Math.min(3, prev * delta)));
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setHighlightedNodes(new Set());
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-3 border-b bg-light flex justify-between items-center">
        <h2 className="text-lg font-bold text-dark">Task Dependency Graph</h2>
        <button
          onClick={handleReset}
          className="px-3 py-1 bg-secondary text-white rounded text-sm hover:bg-gray-700"
        >
          Reset View
        </button>
      </div>
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onWheel={handleWheel}
        className="w-full border border-gray-200 cursor-pointer"
        style={{ height: "500px" }}
        title="Click nodes to highlight dependencies. Scroll to zoom."
      />
      <div className="p-3 bg-light text-sm text-secondary">
        Click on nodes to highlight dependencies. Use scroll wheel to zoom.
      </div>
    </div>
  );
}
