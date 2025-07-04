import { useRef, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import GridEditor from "../components/GridEditor.jsx";
import ComponentPalette from "../components/ComponentPalette.jsx";
import MetricsPanel from "../components/MetricsPanel.jsx";
import SimulationControls from "../components/SimulationControls.jsx";
import AnalyticsDashboard from "../components/AnalyticsDashboard.jsx";
import { Bot, Save, BarChart3 } from "lucide-react";
import { SimulationEngine } from "../lib/simulation";

export default function Simulator() {
  const [gridSize, setGridSize] = useState(15);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const gridRef = useRef(null);
  const [simulationState, setSimulationState] = useState({
    isRunning: false,
    isPaused: false,
    currentStep: 0,
    totalSteps: 0,
    robotPosition: null,
    targetPosition: null,
    currentOrderItem: null,
    path: [],
    collectedShelves: [],
    liveMetrics: { totalDistance: 0, totalTime: 0, efficiency: 100 },
    shelfPositions: [],
  });
  const [shelfProductMap, setShelfProductMap] = useState({});
  const { data: layouts = [] } = useQuery({ queryKey: ["http://localhost:5000/api/layouts"] });
  const { data: currentLayout,isLoading } = useQuery({ queryKey: ["http://localhost:5000/api/layouts/1"] });
  const { data: orderItems = [] } = useQuery({
  queryKey: ["http://localhost:5000/api/order-items"]
});
  const currentMetrics = {
    totalDistance: 2400,
    totalTime: 36,
    efficiency: 92,
  };

  const handleRobotPlaced = (pos) => {
  setSimulationState(prev => ({
    ...prev,
    robotPosition: pos || { x: -1, y: -1 }
  }));
};

  function calculateDistanceUpTo(path, step) {
    if (!path || path.length < 2 || step < 1) return 0;
    let dist = 0;
    for (let i = 1; i <= step && i < path.length; i++) {
      dist += Math.abs(path[i].x - path[i-1].x) + Math.abs(path[i].y - path[i-1].y);
    }
    return dist * 100; // in cm
  }

  useEffect(() => {
    if (!simulationState.isRunning || simulationState.isPaused) return;
    if (!simulationState.path || simulationState.path.length === 0) return;
    if (simulationState.currentStep >= simulationState.path.length - 1) return;

    const timer = setTimeout(() => {
      setSimulationState(prev => {
        const nextStep = prev.currentStep + 1;
        const nextPos = prev.path[nextStep];
        let collectedShelves = prev.collectedShelves;
        let newCollected = false;
        for (const shelf of prev.shelfPositions) {
          if (!collectedShelves.some(s => s.gridX === shelf.gridX && s.gridY === shelf.gridY)
            && shelf.gridX === nextPos.x && shelf.gridY === nextPos.y) {
            collectedShelves = [...collectedShelves, shelf];
            newCollected = true;
          }
        }
        const remainingShelves = prev.shelfPositions.filter(shelf =>
          !collectedShelves.some(cs => cs.gridX === shelf.gridX && cs.gridY === shelf.gridY)
        );
        const currentOrderItem = remainingShelves[0] || null;
        const totalDistance = calculateDistanceUpTo(prev.path, nextStep);
        const totalTime = prev.liveMetrics.totalTime * (totalDistance / (prev.liveMetrics.totalDistance || 1));
        const efficiency = prev.liveMetrics.efficiency || 100;
        return {
          ...prev,
          currentStep: nextStep,
          robotPosition: nextPos,
          collectedShelves,
          currentOrderItem,
          liveMetrics: {
            totalDistance,
            totalTime: isNaN(totalTime) ? 0 : totalTime,
            efficiency,
          },
        };
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [simulationState.isRunning, simulationState.isPaused, simulationState.currentStep, simulationState.path]);

  const handleStartSimulation = () => {
  if (isLoading) {
    console.warn("⚠️ Layout is still loading...");
    return;
  }

  console.log("🟡 Start simulation clicked");

  if (!gridRef.current) {
    console.error("❌ No grid found (gridRef.current is null)");
    return;
  }

  const grid = gridRef.current;
  console.log("✅ Loaded grid from layout", grid);

  // Gather all shelf positions from the grid
  const shelfPositions = [];
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col] === 'shelf') {
        shelfPositions.push({ gridX: col, gridY: row, item: `Shelf (${col},${row})` });
      }
    }
  }

  if (shelfPositions.length === 0) {
    alert("No shelves found on the grid. Please add at least one shelf.");
    return;
  }

  console.log("🧾 All shelf positions:", shelfPositions);

  try {
    const engine = new SimulationEngine(grid, gridSize);
    const simResult = engine.planSimulation(grid, shelfPositions);
    console.log("✅ Simulation plan result:", simResult);

    const steps = engine.generateSimulationSteps(simResult.totalPath, shelfPositions);
    console.log("📈 Generated simulation steps:", steps);

    setSimulationState(prev => ({
      ...prev,
      isRunning: true,
      isPaused: false,
      path: simResult.totalPath,
      currentStep: 0,
      totalSteps: steps.length,
      currentOrderItem: shelfPositions[0],
      robotPosition: simResult.totalPath[0] || null,
      collectedShelves: [],
      liveMetrics: {
        totalDistance: simResult.totalDistance,
        totalTime: simResult.totalTime,
        efficiency: simResult.efficiency,
      },
      shelfPositions,
    }));

    console.log("🚀 Simulation started and state updated");
  } catch (err) {
    console.error("❌ Simulation planning failed:", err.message);
    alert("Simulation failed: " + err.message);
  }
};

  const handlePauseSimulation = () => {
    setSimulationState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const handleStopSimulation = () => {
    setSimulationState(prev => ({ 
      ...prev, 
      isRunning: false, 
      isPaused: false,
      currentStep: 0
    }));
  };

  const handleResetSimulation = () => {
    setSimulationState({
      isRunning: false,
      isPaused: false,
      currentStep: 0,
      totalSteps: 0,
      robotPosition: null,
      targetPosition: null,
      currentOrderItem: null,
      path: [],
      collectedShelves: [],
      liveMetrics: { totalDistance: 0, totalTime: 0, efficiency: 100 },
      shelfPositions: [],
    });
  };

  const handleSaveLayout = async () => {
  if (!gridRef.current) {
    alert("Grid not ready to save.");
    return;
  }

  const layoutToSave = {
    name: "Current Layout",
    gridData: gridRef.current,
  };

  try {
    const res = await fetch("http://localhost:5000/api/layouts/1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(layoutToSave),
    });

    if (!res.ok) throw new Error("Failed to save layout");

    alert("✅ Layout saved successfully!");
  } catch (err) {
    alert("❌ Save failed: " + err.message);
  }
};


  if (showAnalytics) {
    return (
      <AnalyticsDashboard 
        layouts={layouts}
        onClose={() => setShowAnalytics(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-warehouse-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-warehouse-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Bot className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold text-warehouse-900">MFU Simulator</h1>
              </div>
              {/* <span className="text-sm text-warehouse-500 bg-warehouse-100 px-2 py-1 rounded-full">
                JavaScript Edition
              </span> */}
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowAnalytics(true)}
                className="bg-warehouse-100 hover:bg-warehouse-200 text-warehouse-700 px-4 py-2 rounded-lg flex items-center transition-colors"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </button>
              <button 
  onClick={handleSaveLayout}
  className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
>
  <Save className="w-4 h-4 mr-2" />
  Save Layout
</button>

            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Control Panel */}
        <div className="bg-white p-6 mb-6 rounded-lg shadow-sm border border-warehouse-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-warehouse-900">Layout Designer</h2>
              <SimulationControls
                simulationState={simulationState}
                onStart={handleStartSimulation}
                onPause={handlePauseSimulation}
                onStop={handleStopSimulation}
                onReset={handleResetSimulation}
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-warehouse-700">Grid Size:</label>
                <select 
                  value={gridSize} 
                  onChange={(e) => setGridSize(parseInt(e.target.value))}
                  className="border border-warehouse-300 rounded px-2 py-1 text-sm"
                >
                  <option value="10">10x10</option>
                  <option value="15">15x15</option>
                  <option value="20">20x20</option>
                  <option value="25">25x25</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Component Palette */}
          <div className="lg:col-span-1">
            <ComponentPalette
              selectedComponent={selectedComponent}
              onComponentSelect={setSelectedComponent}
              shelfProductMap={shelfProductMap}
              collectedShelves={simulationState.collectedShelves}
              currentOrderItem={simulationState.currentOrderItem}
            />
          </div>

          {/* Grid Layout Editor */}
          <div className="lg:col-span-2">
            <GridEditor
              gridSize={gridSize}
              selectedComponent={selectedComponent}
              simulationState={simulationState}
              currentLayout={currentLayout}
              onRobotPlaced={handleRobotPlaced}
              shelfProductMap={shelfProductMap}
              setShelfProductMap={setShelfProductMap}
              onGridChange={(grid) => (gridRef.current = grid)}
            />
          </div>

          {/* Metrics Panel */}
          <div className="lg:col-span-1">
            <MetricsPanel
              currentMetrics={simulationState.liveMetrics}
              layouts={layouts}
              simulationState={simulationState}
            />
          </div>
        </div>
      </div>
    </div>
  );
}