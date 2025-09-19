import { useRef, useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
  const [season, setSeason] = useState('normal');
  const [robotSpeed, setRobotSpeed] = useState(1);
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
    liveMetrics: { totalDistance: 0, totalTime: 0, efficiency: 0, costSavings: 0,Co2:0 },
    shelfPositions: [],
    totalOptimalDistance: 0,
  });
  const [shelfProductMap, setShelfProductMap] = useState({});
  const [orderItem, setOrderItem] = useState([]);
  const { data: layouts = [] } = useQuery({ queryKey: ["http://localhost:5000/api/layouts"] });
  const { data: currentLayout, isLoading } = useQuery({ queryKey: ["http://localhost:5000/api/layouts/1"] });
  const { data: orderItems = [] } = useQuery({ queryKey: ["http://localhost:5000/api/order-items"] });

  const createLayoutMutation = useMutation({
    mutationFn: async (layoutData) => {
      const res = await fetch("http://localhost:5000/api/layouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(layoutData),
      });
      return res.json();
    },
  });

  const handleNewLayout = async () => {
    if (!gridRef.current) {
      alert("Grid not ready to save.");
      return;
    }
    const name = prompt("Enter a name for the new layout:");
    if (!name) return;
    const layoutToSave = {
      name,
      gridData: gridRef.current,
      gridSize,
      metrics: simulationState.liveMetrics,
    };
    try {
     const response= await createLayoutMutation.mutateAsync(layoutToSave);
     layouts.push(response);
     console.log("New layout created:", response);
      alert("✅ New layout saved successfully!");
    } catch (err) {
      alert("❌ Save failed: " + err.message);
    }
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
    return dist * 100;
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
        for (const shelf of prev.shelfPositions) {
          if (!collectedShelves.some(s => s.gridX === shelf.gridX && s.gridY === shelf.gridY)
            && shelf.gridX === nextPos.x && shelf.gridY === nextPos.y) {
            collectedShelves = [...collectedShelves, shelf];
          }
        }
        const remainingShelves = prev.shelfPositions.filter(shelf =>
          !collectedShelves.some(cs => cs.gridX === shelf.gridX && cs.gridY === shelf.gridY)
        );
        const currentOrderItem = remainingShelves[0] || null;
        const totalDistance = calculateDistanceUpTo(prev.path, nextStep);
        const totalOptimalDistance = prev.totalOptimalDistance || 1;
        const efficiency = totalDistance > 0 ? Math.min(Math.round((totalOptimalDistance / totalDistance) * 100), 100) : 100;
        const totalTime = robotSpeed > 0 ? (totalDistance / 100) / robotSpeed : 0;
        const emissionFactor = 0.21; // kg CO₂ per km
        const savedDistance = (simulationState.totalOptimalDistance - simulationState.liveMetrics.totalDistance) / 1000; // convert meters to km
        const co2Reduction = savedDistance * emissionFactor;
        const laborCostPerHour = 200;  // INR
        const energyCostPerKm = 5;     // INR per km

        const baselineTime = simulationState.totalOptimalDistance / 100 / robotSpeed; 
        const baselineCost = (baselineTime / 3600) * laborCostPerHour + (simulationState.totalOptimalDistance / 1000) * energyCostPerKm;
        const actualCost = (simulationState.liveMetrics.totalTime / 3600) * laborCostPerHour + (simulationState.liveMetrics.totalDistance / 1000) * energyCostPerKm;
        const costSavings = baselineCost - actualCost;


        return {
          ...prev,
          currentStep: nextStep,
          robotPosition: nextPos,
          collectedShelves,
          currentOrderItem,
          liveMetrics: {
            ...prev.liveMetrics,
            totalDistance,
            totalTime: isNaN(totalTime) ? 0 : totalTime,
            efficiency,
            costSavings: Math.round(costSavings),
            Co2:co2Reduction.toFixed(2)
          },
        };
      });
    }, 300 / robotSpeed);
    return () => clearTimeout(timer);
  }, [simulationState.isRunning, simulationState.isPaused, simulationState.currentStep, simulationState.path, robotSpeed]);

  const handleStartSimulation = () => {
    if (isLoading) {
      console.warn("⚠️ Layout is still loading...");
      return;
    }
    if (!gridRef.current) {
      console.error("❌ No grid found (gridRef.current is null)");
      return;
    }
    const grid = gridRef.current;

    if (orderItem.length === 0) {
    alert("No order items selected. Please add items to the order.");
    return;
  }

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
    try {
      // Pass the selected season to the SimulationEngine
      const engine = new SimulationEngine(grid, gridSize, robotSpeed, season);
      const simResult = engine.planSimulation(grid, orderItem);
      const steps = engine.generateSimulationSteps(simResult.totalPath, orderItem);
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
          costSavings: simResult.costSavings || 0,
        },
        shelfPositions,
        totalOptimalDistance: simResult.optimalDistance,
      }));
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
      liveMetrics: { totalDistance: 0, totalTime: 0, efficiency: 0, costSavings: 0, Co2:0 },
      shelfPositions: [],
      totalOptimalDistance: 0,
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
        simulationState={simulationState}
        season={season}
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
                <h1 className="text-2xl CENTER font-bold text-warehouse-900">
                  BHARAT WAREHOUSE OPTIMISER
                  <img src="https://img.icons8.com/color/48/india.png" alt="India Flag" style={{ display: 'inline', marginLeft: 8, verticalAlign: 'middle', height: 32 }} />
                </h1>
              </div>
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
              <button
                onClick={handleNewLayout}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
              >
                + New Layout
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
                isRunning={simulationState.isRunning}
                isPaused={simulationState.isPaused}
                onStart={handleStartSimulation}
                onPause={handlePauseSimulation}
                onStop={handleStopSimulation}
                onReset={handleResetSimulation}
                robotSpeed={robotSpeed}
                onSpeedChange={setRobotSpeed}
                currentMetrics={simulationState.liveMetrics}
                season={season}
                onSeasonChange={setSeason}
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
              orderItem={orderItem}
              setOrderItem={setOrderItem}
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
              orderItem={orderItem}
              setOrderItem={setOrderItem}
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