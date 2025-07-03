import { useRef, useState } from "react";
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

  const engine = new SimulationEngine(grid, gridSize);
  console.log("🛠️ Simulation engine initialized");
  console.log(shelfProductMap)
  const convertedItems = orderItems.map(item => {
    const location = Object.entries(shelfProductMap).find(
      ([_, name]) => name.toLowerCase() === item.item.toLowerCase()
    );

    if (!location) {
      console.warn(`⚠️ No shelf location found for item "${item.item}"`);
      return null;
    }

    const [y, x] = location[0].split(",").map(Number);
    console.log(`📦 Mapped item "${item.item}" to grid position: (${x}, ${y})`);

    return {
      ...item,
      gridX: x,
      gridY: y,
    };
  }).filter(Boolean);

  console.log("🧾 Converted order items with positions:", convertedItems);

  try {
    const simResult = engine.planSimulation(grid, convertedItems);
    console.log("✅ Simulation plan result:", simResult);

    const steps = engine.generateSimulationSteps(simResult.totalPath, convertedItems);
    console.log("📈 Generated simulation steps:", steps);

    setSimulationState(prev => ({
      ...prev,
      isRunning: true,
      isPaused: false,
      path: simResult.totalPath,
      currentStep: 0,
      totalSteps: steps.length,
      currentOrderItem: convertedItems[0],
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
              currentMetrics={currentMetrics}
              layouts={layouts}
              simulationState={simulationState}
            />
          </div>
        </div>
      </div>
    </div>
  );
}